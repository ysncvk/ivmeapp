import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { QuestionGoals } from "@/features/student/question-goals";
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
	const questions = useQuery(
		orpc.questions.overview.queryOptions({ input: {} }),
	);
	// Test işaretlemek soru sayacını da değiştirir
	const refresh = () =>
		Promise.all([
			qc.invalidateQueries({ queryKey: orpc.plan.key() }),
			qc.invalidateQueries({ queryKey: orpc.questions.key() }),
		]);
	const questionsKey = orpc.questions.overview.queryKey({ input: {} });
	const logQuestions = useMutation(
		orpc.questions.log.mutationOptions({
			// Hızlı arka arkaya tıklamada eski değerden hesap yapılmasın: önce ekranı güncelle
			onMutate: ({ subject, solved }) => {
				qc.setQueryData(questionsKey, (prev) =>
					prev
						? {
								...prev,
								subjects: prev.subjects.map((x) =>
									x.subject === subject ? { ...x, solvedToday: solved } : x,
								),
							}
						: prev,
				);
			},
			onSettled: () => qc.invalidateQueries({ queryKey: orpc.questions.key() }),
		}),
	);
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
			groupedSubjects={questions.data?.subjects.map((x) => x.subject)}
			questions={
				questions.data && questions.data.subjects.length > 0 ? (
					<QuestionGoals
						goals={questions.data.subjects}
						tasks={d.tasks.filter((t) => t.reason.source !== "homework")}
						onToggleTask={(taskId, done) => toggleTask.mutate({ taskId, done })}
						onChange={(subject, solved) =>
							logQuestions.mutate({ subject, solved })
						}
					/>
				) : undefined
			}
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
