import { createFileRoute, redirect } from "@tanstack/react-router";

import { roleHome } from "@/lib/me";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		let role: string | null = null;
		try {
			role = (await client.account.me()).user.role;
		} catch {
			role = null;
		}
		throw redirect({ to: role ? roleHome(role) : "/giris" });
	},
});
