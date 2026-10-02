import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { deleteGuardianAccount } from "./account";
import { account, session, user } from "./schema/auth";
import {
	accessLog,
	child,
	childSource,
	childSubject,
	consent,
	exam,
	examSubject,
	groupMember,
	homework,
	plan,
	planEvent,
	planTask,
	reward,
	rewardGrant,
	studyGroup,
	subscription,
} from "./schema/domain";
import { createTestDatabase, type TestDatabase } from "./test-database";

let t: TestDatabase;
beforeAll(async () => {
	t = await createTestDatabase("db");
}, 60_000);
afterAll(async () => {
	await t?.close();
});

let n = 0;
const uid = () => `u${++n}-${crypto.randomUUID().slice(0, 8)}`;

async function makeGuardian() {
	const id = uid();
	await t.db.insert(user).values({
		id,
		name: "Veli",
		email: `${id}@example.test`,
		role: "guardian",
	});
	return id;
}

async function makeChild(guardianId: string) {
	const userId = uid();
	await t.db.insert(user).values({
		id: userId,
		name: "Ada",
		email: `${userId}@cocuk.ivme.invalid`,
		role: "student",
		username: `ada-${userId}`,
	});
	const [row] = await t.db
		.insert(child)
		.values({ guardianId, userId, displayName: "Ada" })
		.returning();
	if (!row) throw new Error("çocuk oluşmadı");
	return row;
}

describe("şema", () => {
	it("migration'lar uygulanır, varsayılanlar ADR-0013'e uyar", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		expect(c.dailyBudgetMinutes).toBe(90);
		expect(c.blockMinutes).toBe(30);
		expect(c.studyDays).toEqual([1, 2, 3, 4, 5, 6]);
		expect(c.idleTime).toBe("review");
		expect(c.grade).toBe(6);
	});

	it("bütçe ve blok süresi pozitif olmak zorunda", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		await expect(
			t.db
				.update(child)
				.set({ dailyBudgetMinutes: 0 })
				.where(eq(child.id, c.id)),
		).rejects.toThrow();
		await expect(
			t.db.update(child).set({ blockMinutes: -5 }).where(eq(child.id, c.id)),
		).rejects.toThrow();
	});

	it("deneme: doğru+yanlış+boş = soru sayısı olmak zorunda", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		const [e] = await t.db
			.insert(exam)
			.values({ childId: c.id, name: "Deneme 1", date: "2026-09-26" })
			.returning();
		if (!e) throw new Error("deneme yok");
		await t.db.insert(examSubject).values({
			examId: e.id,
			subject: "matematik",
			questions: 20,
			correct: 13,
			wrong: 5,
			blank: 2,
		});
		await expect(
			t.db.insert(examSubject).values({
				examId: e.id,
				subject: "fen",
				questions: 20,
				correct: 15,
				wrong: 5,
				blank: 2,
			}),
		).rejects.toThrow();
	});

	it("ödül eşiği (0, 1] aralığında; çocuk başına seviye başına bir ödül", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		await t.db.insert(reward).values({
			childId: c.id,
			tier: "weekly",
			title: "Sinema",
			threshold: 0.8,
		});
		await expect(
			t.db
				.insert(reward)
				.values({ childId: c.id, tier: "weekly", title: "Başka" }),
		).rejects.toThrow();
		await expect(
			t.db
				.insert(reward)
				.values({ childId: c.id, tier: "daily", title: "X", threshold: 1.5 }),
		).rejects.toThrow();
		await expect(
			t.db
				.insert(reward)
				.values({ childId: c.id, tier: "milestone", title: "Y", threshold: 0 }),
		).rejects.toThrow();
	});

	it("çocuk başına hafta başına tek plan", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		const row = {
			childId: c.id,
			weekStart: "2026-10-05",
			settings: {},
			coverage: {},
			unplaced: [],
		};
		await t.db.insert(plan).values(row);
		await expect(t.db.insert(plan).values(row)).rejects.toThrow();
	});

	it("görev günü 1-7 aralığında olmalı", async () => {
		const g = await makeGuardian();
		const c = await makeChild(g);
		const [p] = await t.db
			.insert(plan)
			.values({
				childId: c.id,
				weekStart: "2026-10-12",
				settings: {},
				coverage: {},
				unplaced: [],
			})
			.returning();
		if (!p) throw new Error("plan yok");
		const task = {
			planId: p.id,
			childId: c.id,
			block: 1,
			minutes: 30,
			subject: "fen" as const,
			topic: "Bileşke Kuvvet",
			resource: "Kitap",
			work: "s.35 Test 1",
			reasonSource: "weekly_topic" as const,
			reasonDetail: "Bu haftanın konusu",
		};
		await t.db.insert(planTask).values({ ...task, day: 3 });
		await expect(
			t.db.insert(planTask).values({ ...task, day: 8 }),
		).rejects.toThrow();
	});
});

describe("silme hakkı (ADR-0010 madde 3)", () => {
	it("veli hesabı silinince çocuğa ait tüm veri ve çocuğun giriş kaydı silinir", async () => {
		const g = await makeGuardian();
		const teacherId = uid();
		await t.db.insert(user).values({
			id: teacherId,
			name: "Öğretmen",
			email: `${teacherId}@example.test`,
			role: "teacher",
		});
		const c = await makeChild(g);

		// Çocuğa ait her tabloda veri
		await t.db.insert(account).values({
			id: uid(),
			accountId: c.userId,
			providerId: "credential",
			userId: c.userId,
			password: "hash",
		});
		await t.db.insert(session).values({
			id: uid(),
			token: uid(),
			userId: c.userId,
			expiresAt: new Date(Date.now() + 3_600_000),
		});
		await t.db.insert(childSubject).values({ childId: c.id, subject: "fen" });
		await t.db
			.insert(childSource)
			.values({ childId: c.id, bookId: "fenomen-6-fen-a" });
		await t.db.insert(subscription).values({ childId: c.id, status: "trial" });
		const [p] = await t.db
			.insert(plan)
			.values({
				childId: c.id,
				weekStart: "2026-10-05",
				settings: {},
				coverage: {},
				unplaced: [],
			})
			.returning();
		if (!p) throw new Error("plan yok");
		await t.db.insert(planTask).values({
			planId: p.id,
			childId: c.id,
			day: 1,
			block: 1,
			minutes: 30,
			subject: "fen",
			topic: "K",
			resource: "R",
			work: "W",
			reasonSource: "weekly_topic",
			reasonDetail: "D",
		});
		await t.db
			.insert(planEvent)
			.values({ planId: p.id, kind: "done", actorUserId: c.userId });
		await t.db.insert(homework).values({
			childId: c.id,
			subject: "fen",
			title: "Ödev",
			source: "guardian",
		});
		const [e] = await t.db
			.insert(exam)
			.values({ childId: c.id, name: "D", date: "2026-09-26" })
			.returning();
		if (!e) throw new Error("deneme yok");
		await t.db.insert(examSubject).values({
			examId: e.id,
			subject: "fen",
			questions: 20,
			correct: 10,
			wrong: 5,
			blank: 5,
		});
		const [r] = await t.db
			.insert(reward)
			.values({ childId: c.id, tier: "weekly", title: "Sinema" })
			.returning();
		if (!r) throw new Error("ödül yok");
		await t.db
			.insert(rewardGrant)
			.values({ rewardId: r.id, periodKey: "2026-10-05" });
		await t.db.insert(accessLog).values({
			actorUserId: teacherId,
			actorRole: "teacher",
			childId: c.id,
			action: "view_homework_status",
		});
		const [grp] = await t.db
			.insert(studyGroup)
			.values({ teacherId, name: "6-A", joinCode: `kod-${uid()}` })
			.returning();
		if (!grp) throw new Error("grup yok");
		await t.db.insert(groupMember).values({ groupId: grp.id, childId: c.id });
		await t.db
			.insert(consent)
			.values({ userId: g, kind: "parental_consent", version: "2026-10" });

		await deleteGuardianAccount(t.db, g);

		// Bu çocuğa ait satır kalmadı ("user" Postgres'te ayrılmış sözcük, tırnaklanır)
		const remaining = async (table: string, col: string, value: string) => {
			const res = await t.db.execute(
				sql.raw(
					`select count(*)::int as n from "${table}" where "${col}" = '${value}'`,
				),
			);
			return (res.rows[0] as { n: number }).n;
		};
		for (const [table, col] of [
			["child", "id"],
			["child_subject", "child_id"],
			["child_source", "child_id"],
			["subscription", "child_id"],
			["plan", "child_id"],
			["plan_task", "child_id"],
			["homework", "child_id"],
			["exam", "child_id"],
			["reward", "child_id"],
			["group_member", "child_id"],
			["access_log", "child_id"],
		] as const) {
			expect(await remaining(table, col, c.id), table).toBe(0);
		}
		for (const [table, col, value] of [
			["session", "user_id", c.userId],
			["account", "user_id", c.userId],
			["user", "id", c.userId],
			["user", "id", g],
			["consent", "user_id", g],
		] as const) {
			expect(await remaining(table, col, value), table).toBe(0);
		}
		expect(await remaining("exam_subject", "exam_id", e.id)).toBe(0);
		// Öğretmen hesabı ve grubu duruyor (çocuk üyeliği gitti)
		expect(await remaining("user", "id", teacherId)).toBe(1);
		expect(await remaining("study_group", "id", grp.id)).toBe(1);
	});

	it("başka velinin çocuğuna dokunmaz", async () => {
		const g1 = await makeGuardian();
		const g2 = await makeGuardian();
		const c2 = await makeChild(g2);
		await makeChild(g1);
		await deleteGuardianAccount(t.db, g1);
		const rows = await t.db.select().from(child).where(eq(child.id, c2.id));
		expect(rows).toHaveLength(1);
	});
});
