/**
 * Yerel geliştirme verisi: veli, öğretmen, çocuk, abonelik, çalışma grubu ve ödev.
 * Yalnızca geliştirme ortamında çalışır. Tekrar çalıştırmak güvenlidir (var olanı atlar).
 */
import "varlock/auto-load";
import type { Context } from "@ivmeapp/api/context";
import { appRouter } from "@ivmeapp/api/routers/index";
import { activateSubscription } from "@ivmeapp/api/routers/subscription";
import { user } from "@ivmeapp/db/schema/auth";
import { call } from "@orpc/server";
import { eq } from "drizzle-orm";

import { ENV } from "./env.server";
import { auth, db } from "./services";

if (ENV.NODE_ENV === "production") {
	console.error("seed üretimde çalışmaz");
	process.exit(1);
}

const PASSWORD = "Sifre12345";
const ctx = async (userId: string): Promise<Context> => {
	const [u] = await db.select().from(user).where(eq(user.id, userId));
	return {
		db,
		auth,
		session: {
			user: u,
			session: { id: "seed", userId, token: "seed", expiresAt: new Date() },
		},
	} as unknown as Context;
};

async function ensureUser(
	email: string,
	name: string,
	role: "guardian" | "teacher",
) {
	const [existing] = await db.select().from(user).where(eq(user.email, email));
	if (existing) return existing.id;
	const res = await auth.api.signUpEmail({
		body: { email, password: PASSWORD, name, role },
	});
	return res.user.id;
}

const guardianId = await ensureUser("veli@ivme.test", "Veli Örnek", "guardian");
const teacherId = await ensureUser(
	"ogretmen@ivme.test",
	"Ayşe Öğretmen",
	"teacher",
);
const g = await ctx(guardianId);
const t = await ctx(teacherId);

const existing = await call(appRouter.children.list, undefined, { context: g });
if (existing.length === 0) {
	await call(
		appRouter.account.acceptConsent,
		{ kind: "parental_consent", version: "seed" },
		{ context: g },
	);
	const child = await call(
		appRouter.children.create,
		{ displayName: "Deniz", username: "deniz", password: "123456" },
		{ context: g },
	);
	await call(
		appRouter.children.settings.update,
		{
			childId: child.id,
			sources: [
				"fenomen-6-paragraf-a",
				"fenomen-6-matematik-a",
				"fenomen-6-fen-a",
			],
		},
		{ context: g },
	);
	await activateSubscription(
		db,
		child.id,
		new Date(Date.now() + 365 * 86_400_000),
	);
	await call(
		appRouter.rewards.upsert,
		{
			childId: child.id,
			tier: "weekly",
			title: "McDonald's menüsü",
			threshold: 0.8,
		},
		{ context: g },
	);
	const group = await call(
		appRouter.teacher.groups.create,
		{ name: "6-A" },
		{ context: t },
	);
	await call(
		appRouter.groups.join,
		{ code: group.joinCode, childId: child.id },
		{ context: g },
	);
	await call(
		appRouter.teacher.assignments.create,
		{ groupId: group.id, subject: "fen", title: "Kuvvet ve hareket, s.42-44" },
		{ context: t },
	);
}

console.log(`Hazır.
  Veli:     veli@ivme.test / ${PASSWORD}
  Öğretmen: ogretmen@ivme.test / ${PASSWORD}
  Öğrenci:  kullanıcı adı "deniz" / 123456`);
process.exit(0);
