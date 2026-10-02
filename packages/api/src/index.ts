import type { Role } from "@ivmeapp/auth";
import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

/** Rol kontrolü API katmanında yapılır; istemcide menüyü gizlemek yetkilendirme sayılmaz (ADR-0010). */
function requireRole(...roles: Role[]) {
	return o.middleware(async ({ context, next }) => {
		const role = context.session?.user.role as Role | undefined;
		if (!role || !roles.includes(role)) {
			throw new ORPCError("FORBIDDEN", {
				message: "Bu işlem için yetkiniz yok",
			});
		}
		return next();
	});
}

export const guardianProcedure = protectedProcedure.use(
	requireRole("guardian"),
);
export const teacherProcedure = protectedProcedure.use(requireRole("teacher"));
/** Veli ya da çocuğun kendisi: çocuğun verisine sahip olan taraflar. */
export const familyProcedure = protectedProcedure.use(
	requireRole("guardian", "student"),
);
