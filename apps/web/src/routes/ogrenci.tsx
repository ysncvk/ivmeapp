import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { toast } from "sonner";

import { errorMessage } from "@/components/kit";
import Loader from "@/components/loader";
import { CONSENT_VERSION } from "@/features/guardian/dialogs";
import { ChildNotice } from "@/features/student/child-notice";
import { QuestionGoals } from "@/features/student/question-goals";
import { TodayScreen } from "@/features/student/today-screen";
import { authClient } from "@/lib/auth-client";
import { requireRole, useMe } from "@/lib/me";
import { orpc } from "@/utils/orpc";

const WEEKDAY_LABEL = [
	"Pazartesi",
	"Salı",
	"Çarşamba",
	"Perşembe",
	"Cuma",
	"Cumartesi",
	"Pazar",
];

export const Route = createFileRoute("/ogrenci")({
	beforeLoad: () => requireRole("student"),
	component: StudentPage,
});

function StudentPage() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const me = useMe();
	const accept = useMutation(
		orpc.account.acceptConsent.mutationOptions({
			onSuccess: () => qc.invalidateQueries({ queryKey: orpc.account.key() }),
		}),
	);
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
	const moveTask = useMutation(
		orpc.plan.moveTask.mutationOptions({
			onSuccess: refresh,
			onError: (e) => toast.error(errorMessage(e)),
		}),
	);
	const toggleHw = useMutation(
		orpc.homework.toggle.mutationOptions({ onSuccess: refresh }),
	);

	if (!today.data || !me.data) return <Loader />;
	// ADR-0012: ilk girişte çocuğa sade aydınlatma
	if (!me.data.consents.some((c) => c.kind === "child_notice")) {
		return (
			<ChildNotice
				name={me.data.user.name}
				pending={accept.isPending}
				onAccept={() =>
					accept.mutate({ kind: "child_notice", version: CONSENT_VERSION })
				}
			/>
		);
	}
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
						onMoveTask={(taskId, toDay) => moveTask.mutate({ taskId, toDay })}
						moveDays={(questions.data?.days ?? [])
							.filter((x) => x.studyDay && x.day > d.weekday)
							.map((x) => ({
								day: x.day,
								label: WEEKDAY_LABEL[x.day - 1] ?? "",
							}))}
						onChange={(subject, solved) =>
							logQuestions.mutate({ subject, solved })
						}
					/>
				) : undefined
			}
			reward={r ? { title: r.title, tier: r.tier, progress: r.progress } : null}
			otherRewards={d.rewards
				.filter((x) => x !== r)
				.map((x) => ({ title: x.title, tier: x.tier, progress: x.progress }))}
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
