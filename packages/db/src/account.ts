import { eq, inArray } from "drizzle-orm";

import type { Database } from "./index";
import { user } from "./schema/auth";
import { child } from "./schema/domain";

/**
 * ADR-0010 madde 3: veli hesabını silmek, çocuğa ait TÜM veriyi siler ("pasife alma" silme
 * sayılmaz). Çocuğun kendi kullanıcı kaydı (giriş bilgisi) önce silinir; geri kalan her şey
 * (profil, plan, görev, ödev, deneme, ödül, kayıtlar, oturumlar) zincirleme silinir.
 */
export async function deleteGuardianAccount(
	db: Database,
	guardianId: string,
): Promise<void> {
	await db.transaction(async (tx) => {
		const kids = await tx
			.select({ userId: child.userId })
			.from(child)
			.where(eq(child.guardianId, guardianId));
		const childUserIds = kids.map((k) => k.userId);
		if (childUserIds.length > 0) {
			await tx.delete(user).where(inArray(user.id, childUserIds));
		}
		await tx.delete(user).where(eq(user.id, guardianId));
	});
}
