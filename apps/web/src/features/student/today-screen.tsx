import type { PlanTask, rewardProgress, Subject } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import {
	BookMarked,
	Check,
	Clock,
	Gift,
	LogOut,
	PartyPopper,
	Sparkles,
} from "lucide-react";

import type { ReactNode } from "react";

import { Brand } from "@/components/kit";

import { SUBJECTS } from "./subjects";

export type TodayTask = PlanTask & { done: boolean };

export interface TodayHomework {
	id: string;
	subject: Subject;
	title: string;
	dueDate: string | null;
	source: "teacher" | "guardian" | "student";
	done: boolean;
}

export interface TodayReward {
	title: string;
	tier: "daily" | "weekly" | "milestone";
	progress: ReturnType<typeof rewardProgress>;
}

interface Props {
	studentName: string;
	tasks: TodayTask[];
	homework?: TodayHomework[];
	reward: TodayReward | null;
	/** Diğer seviyelerdeki ödüller: kısa satır olarak ana ödülün altında görünür. */
	otherRewards?: TodayReward[];
	/** Ücretli plan yok: yalnızca ödevler gösterilir (ADR-0014). */
	locked?: boolean;
	/** Basit mod: günlük soru hedefi kartları. Plan görevi yoksa "0 görev" başlığı yerine selam gösterilir. */
	questions?: ReactNode;
	/** Soru hedefleri: hepsi tamam mı (hedef yoksa null). Plan görevi olmasa da "bugünlük bu kadar" der. */
	goalsDone?: boolean | null;
	/** Soru kartında gösterilen derslerin testleri ana listede tekrarlanmaz (ödevler hep listede kalır). */
	groupedSubjects?: readonly Subject[];
	onToggleTask: (id: string, done: boolean) => void;
	onToggleHomework?: (id: string, done: boolean) => void;
	onSignOut?: () => void;
}

const TIER_LABEL = {
	daily: "Günlük ödül",
	weekly: "Haftalık ödül",
	milestone: "Büyük ödül",
} as const;

/** Süre bilinçli olarak gösterilmez: ekranda görev sayısı ve konu adı durur (ADR-0009). */
export function TodayScreen({
	studentName,
	tasks,
	homework = [],
	reward,
	otherRewards = [],
	locked = false,
	questions,
	groupedSubjects = [],
	goalsDone = null,
	onToggleTask,
	onToggleHomework,
	onSignOut,
}: Props) {
	const doneCount = tasks.filter((t) => t.done).length;
	const tasksDone = tasks.length === 0 || doneCount === tasks.length;
	const allDone =
		(tasks.length > 0 || goalsDone === true) &&
		tasksDone &&
		goalsDone !== false;
	const topics = [...new Set(tasks.map((t) => t.topic))];
	const questionsOnly = questions != null && tasks.length === 0;
	const looseTasks = tasks.filter(
		(t) =>
			t.reason.source === "homework" || !groupedSubjects.includes(t.subject),
	);

	return (
		<div className="min-h-svh bg-[radial-gradient(60rem_40rem_at_50%_-10%,color-mix(in_oklch,var(--ivme-violet)_16%,transparent),transparent)]">
			<header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-2.5 sm:max-w-xl md:max-w-2xl">
					<Brand />
					{onSignOut && (
						<button
							type="button"
							onClick={onSignOut}
							className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
						>
							<LogOut aria-hidden className="size-4" />
							Çıkış yap
						</button>
					)}
				</div>
			</header>
			<main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-6 pb-20 sm:max-w-xl sm:pt-10 md:max-w-2xl">
				{questionsOnly ? (
					<header className="rounded-3xl bg-gradient-to-br from-ivme-indigo-deep via-[oklch(0.42_0.18_280)] to-ivme-violet p-6 text-white shadow-primary/25 shadow-xl">
						<p className="font-semibold text-sm text-white/80">
							Merhaba, {studentName}
						</p>
						<h1 className="mt-1 font-extrabold text-4xl tracking-tight">
							Bugün
						</h1>
					</header>
				) : (
					<Hero
						name={studentName}
						total={tasks.length}
						done={doneCount}
						topics={topics}
					/>
				)}

				{reward && <RewardCard reward={reward} />}
				{otherRewards.length > 0 && (
					<ul
						aria-label="Diğer ödüller"
						className="-mt-2 flex flex-col gap-1.5 px-1"
					>
						{otherRewards.map((r) => (
							<li
								key={r.tier}
								className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3 py-2 text-sm"
							>
								<span className="min-w-0 truncate font-bold">
									{TIER_LABEL[r.tier]}: {r.title}
								</span>
								<span className="shrink-0 font-semibold text-muted-foreground">
									{r.progress.unlocked
										? "🎉 Kazandın"
										: `${r.progress.remaining} kaldı`}
								</span>
							</li>
						))}
					</ul>
				)}

				{questions}

				{locked && !questionsOnly && (
					<p className="rounded-2xl bg-muted px-4 py-3 text-center font-semibold text-muted-foreground text-sm">
						Günlük planın için velinle konuş. Ödevlerin aşağıda.
					</p>
				)}

				<section aria-label="Bugünün görevleri" className="flex flex-col gap-3">
					{looseTasks.map((task, i) => (
						<TaskCard
							key={task.id}
							task={task}
							checked={task.done}
							onToggle={() => onToggleTask(task.id, !task.done)}
							index={i}
						/>
					))}
				</section>

				{allDone && <DoneCard />}

				{homework.length > 0 && (
					<section aria-label="Ödevler" className="flex flex-col gap-3">
						<h2 className="font-extrabold text-xl">Ödevler</h2>
						{homework.map((h, i) => (
							<TaskCard
								key={h.id}
								task={homeworkAsTask(h)}
								checked={h.done}
								onToggle={() => onToggleHomework?.(h.id, !h.done)}
								index={i}
							/>
						))}
					</section>
				)}
			</main>
		</div>
	);
}

function homeworkAsTask(h: TodayHomework): PlanTask {
	return {
		id: h.id,
		day: 0,
		block: 0,
		minutes: 0,
		subject: h.subject,
		topic: h.title,
		resource: "",
		work: h.dueDate ? `Teslim: ${h.dueDate}` : "Okul ödevi",
		reason: { source: "homework", detail: "Okul ödevi" },
	};
}

function Hero({
	name,
	total,
	done,
	topics,
}: {
	name: string;
	total: number;
	done: number;
	topics: string[];
}) {
	const ratio = total === 0 ? 0 : done / total;
	const R = 34;
	const C = 2 * Math.PI * R;
	return (
		<header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ivme-indigo-deep via-[oklch(0.42_0.18_280)] to-ivme-violet p-6 text-white shadow-primary/25 shadow-xl">
			<div
				aria-hidden
				className="absolute -top-10 -right-10 size-44 rounded-full bg-ivme-orange/35 blur-2xl"
			/>
			<div className="relative flex items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="font-semibold text-sm text-white/80">Merhaba, {name}</p>
					<h1 className="mt-2 leading-none">
						<span className="block font-bold text-lg text-white/85">Bugün</span>
						<span className="block font-extrabold text-5xl tracking-tight">
							{total} görev
						</span>
					</h1>
					<p className="mt-3 line-clamp-2 text-sm text-white/75">
						{topics.join(" · ")}
					</p>
				</div>
				<div className="relative grid size-24 shrink-0 place-items-center">
					<svg viewBox="0 0 80 80" className="size-24 -rotate-90" aria-hidden>
						<circle
							cx="40"
							cy="40"
							r={R}
							fill="none"
							strokeWidth="9"
							className="stroke-white/20"
						/>
						<circle
							cx="40"
							cy="40"
							r={R}
							fill="none"
							strokeWidth="9"
							strokeLinecap="round"
							strokeDasharray={C}
							strokeDashoffset={C * (1 - ratio)}
							className="stroke-ivme-orange transition-[stroke-dashoffset] duration-500"
						/>
					</svg>
					<span className="absolute font-extrabold text-xl">
						{done}/{total}
					</span>
				</div>
			</div>
		</header>
	);
}

function RewardCard({ reward }: { reward: TodayReward }) {
	const { title, progress } = reward;
	return (
		<section
			aria-label={TIER_LABEL[reward.tier]}
			className={cn(
				"rounded-3xl border bg-card p-4 shadow-sm",
				progress.unlocked &&
					"border-transparent bg-gradient-to-br from-ivme-orange/15 to-ivme-orange/5 motion-safe:animate-rise",
			)}
		>
			<div className="flex items-center gap-3">
				<div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-ivme-orange-deep">
					{progress.unlocked ? (
						<PartyPopper className="size-6" />
					) : (
						<Gift className="size-6" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-bold text-muted-foreground text-xs uppercase tracking-wide">
						{TIER_LABEL[reward.tier]}
					</p>
					<p className="truncate font-extrabold text-lg">{title}</p>
				</div>
			</div>
			<div
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={progress.target}
				aria-valuenow={Math.min(progress.completed, progress.target)}
				className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
			>
				<div
					className="h-full rounded-full bg-gradient-to-r from-ivme-orange to-ivme-orange-deep transition-[width] duration-500"
					style={{ width: `${progress.ratio * 100}%` }}
				/>
			</div>
			<p className="mt-2 font-semibold text-sm">
				{progress.unlocked ? (
					<span className="text-ivme-orange-deep">
						Ödülünü kazandın! Velinle konuş 🎉
					</span>
				) : (
					<span className="text-muted-foreground">
						Ödülüne{" "}
						<b className="text-foreground">{progress.remaining} görev</b> kaldı
					</span>
				)}
			</p>
		</section>
	);
}

function TaskCard({
	task,
	checked,
	onToggle,
	index,
}: {
	task: PlanTask;
	checked: boolean;
	onToggle: () => void;
	index: number;
}) {
	const meta = SUBJECTS[task.subject];
	const Icon = meta.icon;
	const isHomework = task.reason.source === "homework";
	return (
		<label
			style={{ animationDelay: `${index * 60}ms` }}
			className={cn(
				"group flex min-h-20 w-full cursor-pointer items-center gap-4 rounded-3xl border bg-card p-3 pr-4 text-left shadow-sm transition-all motion-safe:animate-rise",
				"active:scale-[0.985] has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-ring/40",
				checked && "bg-muted/60 shadow-none",
			)}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={onToggle}
				className="sr-only"
			/>
			<span
				className={cn(
					"grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-sm transition-opacity",
					meta.tile,
					checked && "opacity-50",
				)}
			>
				<Icon className="size-7" strokeWidth={2.4} />
			</span>
			<span className="min-w-0 flex-1">
				<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span
						className={cn(
							"font-bold text-xs",
							meta.text,
							checked && "opacity-60",
						)}
					>
						{isHomework ? `${meta.label} · Okul ödevi` : meta.label}
					</span>
					{/* Küçük bilgi etiketi: manşet değil, toplam süre hiçbir yerde gösterilmez (ADR-0009). */}
					<span
						hidden={task.minutes === 0}
						className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 font-bold text-[0.7rem] text-muted-foreground"
					>
						<Clock aria-hidden className="size-3" />
						{task.minutes} dk
					</span>
				</span>
				<span
					className={cn(
						"block font-extrabold text-lg leading-tight",
						checked && "text-muted-foreground line-through decoration-2",
					)}
				>
					{task.topic}
				</span>
				<span
					className={cn(
						"mt-0.5 block font-bold text-[0.95rem] text-foreground/85 leading-snug",
						checked && "text-muted-foreground",
					)}
				>
					{task.work}
				</span>
				{!isHomework && (
					<span className="mt-1 flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
						<BookMarked aria-hidden className="size-4 shrink-0" />
						<span className="min-w-0">{task.resource}</span>
					</span>
				)}
			</span>
			<span
				className={cn(
					"grid size-12 shrink-0 place-items-center rounded-full border-2 transition-colors",
					checked
						? "border-transparent bg-ivme-orange text-white motion-safe:animate-pop"
						: "border-border text-transparent group-hover:border-ivme-orange",
				)}
			>
				<Check className="size-6" strokeWidth={3.2} />
			</span>
		</label>
	);
}

function DoneCard() {
	return (
		<div
			role="status"
			className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ivme-orange to-ivme-orange-deep p-6 text-center text-white shadow-ivme-orange/30 shadow-xl motion-safe:animate-rise"
		>
			<Sparkles aria-hidden className="mx-auto size-8" />
			<p className="mt-2 font-extrabold text-2xl">Bugünlük bu kadar!</p>
			<p className="mt-1 text-sm text-white/90">
				Harika iş çıkardın, yarın görüşürüz.
			</p>
		</div>
	);
}
