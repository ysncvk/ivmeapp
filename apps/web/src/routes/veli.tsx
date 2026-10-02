import { createFileRoute } from "@tanstack/react-router";

import { GuardianApp } from "@/features/guardian/guardian-app";
import { requireRole } from "@/lib/me";

export const Route = createFileRoute("/veli")({
	beforeLoad: () => requireRole("guardian", "/veli"),
	component: GuardianApp,
});
