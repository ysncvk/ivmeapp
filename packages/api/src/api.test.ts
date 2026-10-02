import { createAuth } from "@ivmeapp/auth";
import { user } from "@ivmeapp/db/schema/auth";
import { accessLog, plan, planTask } from "@ivmeapp/db/schema/domain";
import {
	createTestDatabase,
	type TestDatabase,
} from "@ivmeapp/db/test-database";
import { call } from "@orpc/server";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Context } from "./context";
import { appRouter } from "./routers/index";
import {
	generateUpcomingPlans,
	purgeExpiredPlanData,
} from "./services/maintenance";

let t: TestDatabase;
let auth: ReturnType<typeof createAuth>;
// 2026-10-05 Pazartesi, okul yılının 4. haftası; 10:00 İstanbul
const NOW = new Date("2026-10-05T07:00:00Z");

beforeAll(async () => {
	t = await createTestDatabase("api");
	auth = createAuth(
		{
			BETTER_AUTH_URL: "http://localhost:3000",
			BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
			CORS_ORIGIN: "http://localhost:3001",
		},
		t.db,
		{ rateLimit: false },
	);
}, 60_000);
afterAll(async () => {
	await t?.close();
});

async function ctxFor(userId: string | null): Promise<Context> {
	let session: Context["session"] = null;
	if (userId) {
		const [u] = await t.db.select().from(user).where(eq(user.id, userId));
		session = {
			user: u,
			session: { id: "s", userId, token: "t", expiresAt: new Date() },
		} as unknown as Context["session"];
	}
	return { db: t.db, auth, session, now: () => NOW };
}

async function signUp(role: "guardian" | "teacher") {
	const res = await auth.api.signUpEmail({
		body: {
			email: `${crypto.randomUUID().slice(0, 8)}@example.test`,
			password: "Sifre12345",
			name: role === "teacher" ? "Ayşe Öğretmen" : "Veli",
			role,
		},
	});
	return res.user.id;
}

const BOOKS = [
	"fenomen-6-paragraf-a",
	"fenomen-6-matematik-a",
	"fenomen-6-fen-a",
];

async function family() {
	const guardianId = await signUp("guardian");
	const g = await ctxFor(guardianId);
	await call(
		appRouter.account.acceptConsent,
		{ kind: "parental_consent", version: "v1" },
		{ context: g },
	);
	const username = `ogr-${crypto.randomUUID().slice(0, 6)}`;
	const c = await call(
		appRouter.children.create,
		{ displayName: "Deniz", username, password: "123456" },
		{ context: g },
	);
	return { g, guardianId, child: c };
}

describe("çocuk ekleme", () => {
	it("açık rıza olmadan reddedilir", async () => {
		const g = await ctxFor(await signUp("guardian"));
		await expect(
			call(
				appRouter.children.create,
				{ displayName: "X", password: "123456" },
				{ context: g },
			),
		).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
	});

	it("rıza sonrası oluşur; çocuk kendi oturumuyla kendini görür", async () => {
		const { child } = await family();
		const s = await ctxFor(
			(
				await t.db
					.select()
					.from(user)
					.where(eq(user.username, child.username ?? ""))
			)[0]?.id ?? null,
		);
		const me = await call(appRouter.account.me, undefined, { context: s });
		expect(me.user.role).toBe("student");
		expect(me.children[0]?.id).toBe(child.id);
	});

	it("öğretmen çocuk ekleyemez, anonim erişemez", async () => {
		const tc = await ctxFor(await signUp("teacher"));
		await expect(
			call(appRouter.children.list, undefined, { context: tc }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		await expect(
			call(appRouter.children.list, undefined, { context: await ctxFor(null) }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});
});

describe("plan ve abonelik", () => {
	it("ücretsiz çocuk için kilitli, deneme ile plan üretilir", async () => {
		const { g, child } = await family();
		await call(
			appRouter.children.settings.update,
			{ childId: child.id, sources: BOOKS },
			{ context: g },
		);
		const locked = await call(
			appRouter.plan.week,
			{ childId: child.id },
			{ context: g },
		);
		expect(locked.locked).toBe(true);

		await call(
			appRouter.subscription.startTrial,
			{ childId: child.id },
			{ context: g },
		);
		await expect(
			call(
				appRouter.subscription.startTrial,
				{ childId: child.id },
				{ context: g },
			),
		).rejects.toMatchObject({ code: "CONFLICT" });

		const week = await call(
			appRouter.plan.week,
			{ childId: child.id },
			{ context: g },
		);
		expect(week.locked).toBe(false);
		expect(week.plan?.weekStart).toBe("2026-10-05");
		const tasks = week.plan?.days.flatMap((d) => d.tasks) ?? [];
		expect(tasks.length).toBeGreaterThan(5);
		const subjects = new Set(tasks.map((x) => x.subject));
		expect(subjects.has("turkce") || subjects.has("matematik")).toBe(true);
		// 6 gün, günlük bütçe aşılmaz
		for (const d of week.plan?.days ?? []) {
			expect(d.tasks.reduce((s, x) => s + x.minutes, 0)).toBeLessThanOrEqual(
				week.plan?.settings.dailyBudgetMinutes ?? 0,
			);
		}

		// ikinci çağrı aynı planı döner (kalıcı)
		const again = await call(
			appRouter.plan.week,
			{ childId: child.id },
			{ context: g },
		);
		expect(again.plan?.days.flatMap((d) => d.tasks.map((x) => x.id))).toEqual(
			tasks.map((x) => x.id),
		);
	});

	it("görev işaretleme, taşıma ve ilerleme sonrası yeniden kurma çatışması", async () => {
		const { g, child } = await family();
		await call(
			appRouter.children.settings.update,
			{ childId: child.id, sources: BOOKS },
			{ context: g },
		);
		await call(
			appRouter.subscription.startTrial,
			{ childId: child.id },
			{ context: g },
		);
		const week = await call(
			appRouter.plan.week,
			{ childId: child.id },
			{ context: g },
		);
		const tasks = week.plan?.days.flatMap((d) => d.tasks) ?? [];
		const first = tasks[0];
		if (!first) throw new Error("görev yok");

		const load = (day: number) =>
			(week.plan?.days.find((d) => d.day === day)?.tasks ?? []).reduce(
				(sum, x) => sum + x.minutes,
				0,
			);
		const toDay = (week.plan?.days ?? [])
			.map((d) => d.day)
			.filter((d) => d !== first.day)
			.sort((a, b) => load(a) - load(b))[0];
		if (!toDay) throw new Error("hedef gün yok");
		// Tam dolu haftada taşıma reddedilir; ödev dışı görev başka göreve yer açmaz
		await expect(
			call(
				appRouter.plan.moveTask,
				{ childId: child.id, taskId: first.id, toDay },
				{ context: g },
			),
		).rejects.toMatchObject({ code: "BAD_REQUEST", message: "no_capacity" });

		await call(
			appRouter.plan.toggleTask,
			{ childId: child.id, taskId: first.id, done: true },
			{ context: g },
		);
		await expect(
			call(
				appRouter.plan.moveTask,
				{ childId: child.id, taskId: first.id, toDay: 2 },
				{ context: g },
			),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		await expect(
			call(appRouter.plan.rebuild, { childId: child.id }, { context: g }),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("başka ailenin çocuğuna erişilemez (NOT_FOUND)", async () => {
		const a = await family();
		const b = await family();
		await expect(
			call(appRouter.plan.week, { childId: a.child.id }, { context: b.g }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		await expect(
			call(
				appRouter.children.settings.get,
				{ childId: a.child.id },
				{ context: b.g },
			),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("ödev, deneme ve öğretmen", () => {
	it("öğretmen ödevi gruba atanır; öğretmen yalnızca özet ve net görür, erişim kaydı tutulur", async () => {
		const { g, child } = await family();
		const teacherId = await signUp("teacher");
		const tc = await ctxFor(teacherId);
		const group = await call(
			appRouter.teacher.groups.create,
			{ name: "6-A Fen" },
			{ context: tc },
		);
		const invite = await call(
			appRouter.groups.preview,
			{ code: group.joinCode },
			{ context: g },
		);
		expect(invite.groupName).toBe("6-A Fen");
		await call(
			appRouter.groups.join,
			{ code: group.joinCode, childId: child.id },
			{ context: g },
		);
		const asg = await call(
			appRouter.teacher.assignments.create,
			{
				groupId: group.id,
				subject: "fen",
				title: "Test 3",
				dueDate: "2026-10-09",
			},
			{ context: tc },
		);
		expect(asg.assigned).toBe(1);

		const hw = await call(
			appRouter.homework.list,
			{ childId: child.id },
			{ context: g },
		);
		expect(hw).toHaveLength(1);
		await call(
			appRouter.homework.toggle,
			{ childId: child.id, homeworkId: hw[0]?.id ?? "", done: true },
			{ context: g },
		);

		await call(
			appRouter.exam.create,
			{
				childId: child.id,
				name: "Deneme 1",
				date: "2026-10-03",
				subjects: [{ subject: "fen", questions: 20, correct: 15, wrong: 4 }],
			},
			{ context: g },
		);

		const roster = await call(
			appRouter.teacher.groups.roster,
			{ groupId: group.id },
			{ context: tc },
		);
		const m = roster.members[0];
		expect(m?.homework).toMatchObject({ total: 1, done: 1, overdue: 0 });
		expect(m?.latestExam?.nets[0]?.net).toBeCloseTo(15 - 4 / 3, 1);
		expect(JSON.stringify(roster)).not.toMatch(/plan|subscription|username/i);

		const logs = await t.db
			.select()
			.from(accessLog)
			.where(eq(accessLog.childId, child.id));
		expect(logs.length).toBeGreaterThan(0);
	});

	it("başka öğretmen grubu göremez; veli öğretmen ucunu çağıramaz", async () => {
		const tc = await ctxFor(await signUp("teacher"));
		const other = await ctxFor(await signUp("teacher"));
		const group = await call(
			appRouter.teacher.groups.create,
			{ name: "G" },
			{ context: tc },
		);
		await expect(
			call(
				appRouter.teacher.groups.roster,
				{ groupId: group.id },
				{ context: other },
			),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		const { g } = await family();
		await expect(
			call(appRouter.teacher.groups.list, undefined, { context: g }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("deneme doğrulaması ve teşhis", async () => {
		const { g, child } = await family();
		await expect(
			call(
				appRouter.exam.create,
				{
					childId: child.id,
					name: "Kötü",
					date: "2026-10-03",
					subjects: [{ subject: "fen", questions: 20, correct: 15, wrong: 9 }],
				},
				{ context: g },
			),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		for (const d of ["2026-09-20", "2026-09-27"]) {
			await call(
				appRouter.exam.create,
				{
					childId: child.id,
					name: `D ${d}`,
					date: d,
					subjects: [
						{ subject: "matematik", questions: 20, correct: 10, wrong: 5 },
					],
					weakTopics: [{ subject: "matematik", topic: "Kesirler" }],
				},
				{ context: g },
			);
		}
		const diag = await call(
			appRouter.exam.diagnosis,
			{ childId: child.id },
			{ context: g },
		);
		expect(JSON.stringify(diag)).toContain("Kesirler");
	});

	it("veli hesabı silinince çocuk verisi gider", async () => {
		const { g, guardianId, child } = await family();
		await call(
			appRouter.subscription.startTrial,
			{ childId: child.id },
			{ context: g },
		);
		await call(
			appRouter.account.deleteAccount,
			{ confirm: "SİL" },
			{ context: g },
		);
		const left = await t.db.select().from(planTask);
		expect(left.every((x) => x.childId !== child.id)).toBe(true);
		const rows = await t.db.select().from(user).where(eq(user.id, guardianId));
		expect(rows).toHaveLength(0);
	});
});

describe("bakım işleri", () => {
	it("Pazar işi gelecek haftanın planını bir kez kurar; saklama süresi dolan plan silinir", async () => {
		const { g, child } = await family();
		await call(
			appRouter.children.settings.update,
			{ childId: child.id, sources: BOOKS },
			{ context: g },
		);
		await call(
			appRouter.subscription.startTrial,
			{ childId: child.id },
			{ context: g },
		);
		const sunday = new Date("2026-10-11T15:00:00Z");
		const first = await generateUpcomingPlans(t.db, sunday);
		expect(first.created).toBeGreaterThanOrEqual(1);
		const again = await generateUpcomingPlans(t.db, sunday);
		expect(again.created).toBe(0);
		const week = await call(
			appRouter.plan.week,
			{ childId: child.id, weekStart: "2026-10-12" },
			{ context: g },
		);
		expect(week.plan?.days.flatMap((d) => d.tasks).length).toBeGreaterThan(5);

		// Deneme bitti, 6 ay geçti: plan verisi silinir, hesap kalır
		const later = new Date("2027-06-01T00:00:00Z");
		const purged = await purgeExpiredPlanData(t.db, later);
		expect(purged.children).toBeGreaterThanOrEqual(1);
		const left = await t.db
			.select()
			.from(plan)
			.where(eq(plan.childId, child.id));
		expect(left).toHaveLength(0);
	});
});
