import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export type Role = "guardian" | "teacher" | "student" | "admin";

export const roleHome = (role: string): string =>
	role === "student"
		? "/ogrenci"
		: role === "teacher"
			? "/ogretmen"
			: role === "admin"
				? "/giris"
				: "/veli";

/** Oturumdaki kullanıcı (rol, çocuklar, rızalar). Oturum yoksa UNAUTHORIZED hatası döner. */
export function useMe() {
	return useQuery({ ...orpc.account.me.queryOptions(), retry: false });
}

import { redirect } from "@tanstack/react-router";

import { client } from "@/utils/orpc";

/** Rota koruması: oturum yoksa girişe, yanlış rolse kendi ana ekranına yönlendirir. */
export async function requireRole(role: Role, next?: string) {
	let me: Awaited<ReturnType<typeof client.account.me>>;
	try {
		me = await client.account.me();
	} catch {
		throw redirect({ to: "/giris", search: { next } });
	}
	if (me.user.role !== role) throw redirect({ to: roleHome(me.user.role) });
	return me;
}
