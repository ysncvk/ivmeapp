/**
 * Ödeme sağlayıcısı olmadan aboneliği elle açar (K-009): `pnpm sub:activate <çocuğun kullanıcı adı> [ay]`.
 * Ev kurulumu ve test içindir; ödeme entegrasyonu gelince webhook aynı `activateSubscription`ı çağırır.
 */
import "varlock/auto-load";
import { activateSubscription } from "@ivmeapp/api/routers/subscription";
import { user } from "@ivmeapp/db/schema/auth";
import { child } from "@ivmeapp/db/schema/domain";
import { eq } from "drizzle-orm";

import { db } from "./services";

const [username, monthsArg] = process.argv.slice(2);
const months = Number(monthsArg ?? 12);
if (!username || !Number.isInteger(months) || months < 1) {
	console.error("Kullanım: pnpm sub:activate <çocuğun-kullanıcı-adı> [ay=12]");
	process.exit(1);
}

const [row] = await db
	.select({ id: child.id, name: child.displayName })
	.from(child)
	.innerJoin(user, eq(user.id, child.userId))
	.where(eq(user.username, username.toLowerCase()));
if (!row) {
	console.error(`"${username}" kullanıcı adlı çocuk bulunamadı.`);
	process.exit(1);
}

const end = new Date();
end.setMonth(end.getMonth() + months);
await activateSubscription(db, row.id, end);
console.log(
	`${row.name} için plan erişimi ${end.toISOString().slice(0, 10)} tarihine kadar açıldı.`,
);
process.exit(0);
