import type { ExamResult } from "@ivmeapp/core";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { useMe } from "@/lib/me";
import { orpc } from "@/utils/orpc";
import {
	AddChildDialog,
	ConsentDialog,
	ExamDialog,
	HomeworkDialog,
	QuestionGoalsDialog,
	RewardsDialog,
} from "./dialogs";
import { type GuardianActions, GuardianScreen } from "./guardian-screen";
import type { ChildData, DayStat, HomeworkItem, RewardTier } from "./mock";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const dueFmt = new Intl.DateTimeFormat("tr-TR", {
	day: "numeric",
	month: "long",
});

type Dialog =
	| { kind: "consent" }
	| { kind: "add-child" }
	| { kind: "homework"; childId: string }
	| { kind: "exam"; childId: string }
	| { kind: "rewards"; childId: string }
	| { kind: "questions"; childId: string };

export function GuardianApp() {
	const me = useMe();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [activeId, setActiveId] = useState<string>();
	const [dialog, setDialog] = useState<Dialog | null>(null);

	const children = me.data?.children ?? [];
	const id = activeId ?? children[0]?.id;
	const enabled = !!id;
	const input = { childId: id ?? "" };

	const [week, diagnosis, homework, rewards, sub, questions, history] =
		useQueries({
			queries: [
				{ ...orpc.plan.week.queryOptions({ input }), enabled },
				{ ...orpc.exam.diagnosis.queryOptions({ input }), enabled },
				{
					...orpc.homework.list.queryOptions({
						input: { childId: id ?? "", includeDone: true },
					}),
					enabled,
				},
				{ ...orpc.rewards.list.queryOptions({ input }), enabled },
				{ ...orpc.subscription.status.queryOptions({ input }), enabled },
				{ ...orpc.questions.overview.queryOptions({ input }), enabled },
				{ ...orpc.rewards.history.queryOptions({ input }), enabled },
			],
		});

	const refresh = () => qc.invalidateQueries();
	const startTrial = useMutation(
		orpc.subscription.startTrial.mutationOptions({ onSuccess: refresh }),
	);
	const toggleHw = useMutation(
		orpc.homework.toggle.mutationOptions({ onSuccess: refresh }),
	);
	const grant = useMutation(
		orpc.rewards.grant.mutationOptions({ onSuccess: refresh }),
	);
	const ungrant = useMutation(
		orpc.rewards.ungrant.mutationOptions({ onSuccess: refresh }),
	);

	if (me.isPending) return <Loader />;

	const today = new Date().toLocaleDateString("sv", {
		timeZone: "Europe/Istanbul",
	});

	const profiles: ChildData[] = children.map((c) => {
		if (c.id !== id) return emptyChild(c.id, c.displayName);
		const days: DayStat[] =
			week.data?.plan?.days.map((d) => ({
				label: DAY_LABELS[d.day - 1] ?? "",
				done: d.tasks.filter((t) => t.done).length,
				total: d.tasks.length,
				state: d.date < today ? "past" : d.date === today ? "today" : "future",
			})) ?? [];
		const latest = diagnosis.data?.latest;
		return {
			id: c.id,
			name: c.displayName,
			week: week.data?.plan
				? {
						done: days.reduce((n, d) => n + d.done, 0),
						total: days.reduce((n, d) => n + d.total, 0),
						days,
					}
				: null,
			subscription: sub.data
				? {
						hasAccess: sub.data.hasPlanAccess,
						canStartTrial: sub.data.canStartTrial,
						status: sub.data.status,
					}
				: undefined,
			questions: questions.data,
			rewardHistory: history.data,
			exam: latest ? (latest as unknown as ExamResult) : null,
			weakTopics: diagnosis.data?.weakTopics ?? [],
			homework: (homework.data ?? [])
				.filter((h) => !h.done || (h.dueDate ?? "") >= today)
				.map(
					(h): HomeworkItem => ({
						id: h.id,
						subject: h.subject,
						title: h.title,
						due: h.dueDate ? dueFmt.format(new Date(h.dueDate)) : "Tarihsiz",
						source: h.source,
						done: h.done,
					}),
				),
			rewards: (rewards.data ?? []).map(
				(r): RewardTier => ({
					tier: r.tier,
					title: r.title,
					completed: r.progress.completed,
					total: 0,
					threshold: r.threshold,
					given: r.granted,
					progress: r.progress,
				}),
			),
		};
	});

	const hasConsent = me.data?.consents.some(
		(x) => x.kind === "parental_consent",
	);

	const actions: GuardianActions = {
		onAddChild: () => setDialog({ kind: hasConsent ? "add-child" : "consent" }),
		onSettings: (childId) =>
			navigate({ to: "/veli/cocuk/$childId/ayarlar", params: { childId } }),
		onSignOut: async () => {
			await authClient.signOut();
			qc.clear();
			navigate({ to: "/giris", search: { next: undefined } });
		},
		onStartTrial: (childId) => startTrial.mutate({ childId }),
		onAddHomework: (childId) => setDialog({ kind: "homework", childId }),
		onToggleHomework: (childId, homeworkId, done) =>
			toggleHw.mutate({ childId, homeworkId, done }),
		onAddExam: (childId) => setDialog({ kind: "exam", childId }),
		onEditRewards: (childId) => setDialog({ kind: "rewards", childId }),
		onEditQuestions: (childId) => setDialog({ kind: "questions", childId }),
		onGrant: (childId, tier, given) =>
			(given ? grant : ungrant).mutate({ childId, tier }),
	};

	const close = () => setDialog(null);

	return (
		<>
			<GuardianScreen
				childProfiles={profiles}
				actions={actions}
				activeId={id}
				onSelect={setActiveId}
			/>
			{dialog?.kind === "consent" && (
				<ConsentDialog
					onClose={close}
					onAccepted={async () => {
						await qc.invalidateQueries();
						setDialog({ kind: "add-child" });
					}}
				/>
			)}
			{dialog?.kind === "add-child" && (
				<AddChildDialog
					onClose={close}
					onCreated={(childId) => {
						setActiveId(childId);
						setDialog(null);
						navigate({
							to: "/veli/cocuk/$childId/ayarlar",
							params: { childId },
						});
					}}
				/>
			)}
			{dialog?.kind === "homework" && (
				<HomeworkDialog childId={dialog.childId} onClose={close} />
			)}
			{dialog?.kind === "exam" && (
				<ExamDialog childId={dialog.childId} onClose={close} />
			)}
			{dialog?.kind === "questions" && (
				<QuestionGoalsDialog childId={dialog.childId} onClose={close} />
			)}
			{dialog?.kind === "rewards" && (
				<RewardsDialog childId={dialog.childId} onClose={close} />
			)}
		</>
	);
}

function emptyChild(id: string, name: string): ChildData {
	return {
		id,
		name,
		week: null,
		exam: null,
		weakTopics: [],
		homework: [],
		rewards: [],
	};
}
