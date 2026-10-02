/**
 * ADR-0010: çocuğa ait veriyi gösteren her yordam, görmeye yetkili rolün kontrolünden geçer.
 * Yetkisiz erişimde varlık sızdırılmaz: bulunamayan ile yetkisiz aynı hatayı (NOT_FOUND) verir.
 */
import type { Role } from "@ivmeapp/auth";
import {
	accessLog,
	child,
	groupMember,
	studyGroup,
} from "@ivmeapp/db/schema/domain";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import type { Context } from "./context";

export type ChildRow = typeof child.$inferSelect;

export interface Viewer {
	userId: string;
	role: Role;
}

export function viewerOf(context: Context): Viewer {
	const user = context.session?.user;
	if (!user) throw new ORPCError("UNAUTHORIZED");
	return { userId: user.id, role: user.role as Role };
}

const notFound = () => new ORPCError("NOT_FOUND", { message: "Bulunamadı" });

/** Veli: kendi çocuğu. Çocuk: yalnızca kendisi (childId verilse bile başkası olamaz). */
export async function resolveFamilyChild(
	context: Context,
	childId?: string,
): Promise<{ child: ChildRow; viewer: Viewer }> {
	const viewer = viewerOf(context);
	if (viewer.role === "guardian") {
		if (!childId)
			throw new ORPCError("BAD_REQUEST", { message: "childId gerekli" });
		const [row] = await context.db
			.select()
			.from(child)
			.where(and(eq(child.id, childId), eq(child.guardianId, viewer.userId)));
		if (!row) throw notFound();
		return { child: row, viewer };
	}
	if (viewer.role === "student") {
		const [row] = await context.db
			.select()
			.from(child)
			.where(eq(child.userId, viewer.userId));
		if (!row || (childId && childId !== row.id)) throw notFound();
		return { child: row, viewer };
	}
	throw new ORPCError("FORBIDDEN");
}

/** Yalnızca veli (ayar, abonelik, deneme girişi, ödül tanımı gibi veliye ait işler). */
export async function resolveGuardianChild(
	context: Context,
	childId: string,
): Promise<ChildRow> {
	const viewer = viewerOf(context);
	if (viewer.role !== "guardian") throw new ORPCError("FORBIDDEN");
	const [row] = await context.db
		.select()
		.from(child)
		.where(and(eq(child.id, childId), eq(child.guardianId, viewer.userId)));
	if (!row) throw notFound();
	return row;
}

export async function requireOwnGroup(context: Context, groupId: string) {
	const viewer = viewerOf(context);
	const [row] = await context.db
		.select()
		.from(studyGroup)
		.where(
			and(eq(studyGroup.id, groupId), eq(studyGroup.teacherId, viewer.userId)),
		);
	if (!row) throw notFound();
	return row;
}

/** Çocuk, öğretmenin (arşivlenmemiş) bir grubunun üyesi mi? */
export async function teacherCanSeeChild(
	context: Context,
	teacherId: string,
	childId: string,
): Promise<boolean> {
	const rows = await context.db
		.select({ id: groupMember.groupId })
		.from(groupMember)
		.innerJoin(studyGroup, eq(studyGroup.id, groupMember.groupId))
		.where(
			and(
				eq(groupMember.childId, childId),
				eq(studyGroup.teacherId, teacherId),
			),
		);
	return rows.length > 0;
}

/** Erişim kaydı (ADR-0010): öğretmenin çocuk verisine baktığı her işlem kaydedilir. */
export async function logAccess(
	context: Context,
	viewer: Viewer,
	childId: string,
	action: string,
): Promise<void> {
	await context.db.insert(accessLog).values({
		actorUserId: viewer.userId,
		actorRole: viewer.role,
		childId,
		action,
	});
}
