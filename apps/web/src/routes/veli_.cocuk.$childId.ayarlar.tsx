import { createFileRoute } from "@tanstack/react-router";

import { ChildSettingsPage } from "@/features/guardian/child-pages";
import { requireRole } from "@/lib/me";

export const Route = createFileRoute("/veli_/cocuk/$childId/ayarlar")({
	beforeLoad: ({ params }) =>
		requireRole("guardian", `/veli/cocuk/${params.childId}/ayarlar`),
	component: () => {
		const { childId } = Route.useParams();
		return <ChildSettingsPage childId={childId} />;
	},
});
