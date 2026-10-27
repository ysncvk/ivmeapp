import { createFileRoute } from "@tanstack/react-router";

import { ChildSourcesPage } from "@/features/guardian/child-pages";
import { requireRole } from "@/lib/me";

export const Route = createFileRoute("/veli_/cocuk/$childId/kaynaklar")({
	beforeLoad: ({ params }) =>
		requireRole("guardian", `/veli/cocuk/${params.childId}/kaynaklar`),
	component: () => {
		const { childId } = Route.useParams();
		return <ChildSourcesPage childId={childId} />;
	},
});
