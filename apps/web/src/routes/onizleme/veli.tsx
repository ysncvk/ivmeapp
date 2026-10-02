import { createFileRoute, redirect } from "@tanstack/react-router";

import { GuardianScreen } from "@/features/guardian/guardian-screen";
import { mockChildren } from "@/features/guardian/mock";

/** Tasarım önizlemesi: yalnızca geliştirme ortamında, giriş gerektirmez. */
export const Route = createFileRoute("/onizleme/veli")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw redirect({ to: "/" });
	},
	component: () => <GuardianScreen childProfiles={mockChildren} />,
});
