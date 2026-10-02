import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { TodayScreen } from "@/features/student/today-screen";
import { authClient } from "@/lib/auth-client";
import { requireRole } from "@/lib/me";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/ogrenci")({
	beforeLoad: () => requireRole("student"),
	component: StudentPage,
});

function StudentPage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const today = useQuery(orpc.plan.today.queryOptions({ input: {} }));
	const refresh = () => qc.invalidateQueries({ queryKey: orpc.plan.key() });
	const toggleTask = useMutation(
		orpc.plan.toggleTask.mutationOptions({ onSuccess: refresh }),
	);
	const toggleHw = useMutation(
		orpc.homework.toggle.mutationOptions({ onSuccess: refresh }),
	);

	if (!today.data) return <Loader />;
	const d = today.data;
	// Çocuğa en yakın ödül: günlük > haftalık > büyük
	const r =
		d.rewards.find((x) => x.tier === "daily") ??
		d.rewards.find((x) => x.tier === "weekly") ??
		d.rewards[0];

	return (
		<TodayScreen
			studentName={d.child.displayName}
			tasks={d.tasks.map((t) => ({ ...t, day: t.day, reason: t.reason }))}
			homework={d.homework.map((h) => ({ ...h }))}
			locked={d.locked}
			reward={r ? { title: r.title, tier: r.tier, progress: r.progress } : null}
			onToggleTask={(taskId, done) => toggleTask.mutate({ taskId, done })}
			onToggleHomework={(homeworkId, done) =>
				toggleHw.mutate({ homeworkId, done })
			}
			onSignOut={async () => {
				await authClient.signOut();
				qc.clear();
				navigate({ to: "/giris", search: { next: undefined } });
			}}
		/>
	);
}
