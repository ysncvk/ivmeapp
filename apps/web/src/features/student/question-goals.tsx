import type { Subject } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import { Check } from "lucide-react";

import { SUBJECTS } from "./subjects";

export interface QuestionTask {
	id: string;
	subject: Subject;
	topic: string;
	work: string;
	done: boolean;
}

export interface QuestionGoal {
	subject: Subject;
	goal: number;
	solvedToday: number;
	/** Kitap seçiliyse hedefin yaklaşık test karşılığı. */
	tests: number | null;
}

interface Props {
	goals: QuestionGoal[];
	/** Koçluk açıkken hedefin test karşılığı: bugünün testleri ilgili dersin kartında listelenir. */
	tasks?: QuestionTask[];
	onChange: (subject: Subject, solved: number) => void;
	onToggleTask?: (id: string, done: boolean) => void;
}

const STEPS = [-5, 5, 10] as const;

/** Basit mod: ders başına "bugün kaç soru çözdüm". Süre ya da doğru sayısı sorulmaz. */
export function QuestionGoals({
	goals,
	tasks = [],
	onChange,
	onToggleTask,
}: Props) {
	if (goals.length === 0) return null;
	return (
		<section aria-label="Bugünün soru hedefi" className="flex flex-col gap-3">
			<h2 className="font-extrabold text-xl">Bugünün soruları</h2>
			{goals.map((g) => (
				<GoalCard
					key={g.subject}
					goal={g}
					tasks={tasks.filter((t) => t.subject === g.subject)}
					onChange={onChange}
					onToggleTask={onToggleTask}
				/>
			))}
		</section>
	);
}

function GoalCard({
	goal,
	tasks,
	onChange,
	onToggleTask,
}: {
	goal: QuestionGoal;
	tasks: QuestionTask[];
	onChange: Props["onChange"];
	onToggleTask?: Props["onToggleTask"];
}) {
	const meta = SUBJECTS[goal.subject];
	const Icon = meta.icon;
	const { solvedToday: solved } = goal;
	const done = solved >= goal.goal;
	const ratio = Math.min(1, solved / goal.goal);
	const set = (n: number) => onChange(goal.subject, Math.max(0, n));
	return (
		<div
			className={cn(
				"rounded-3xl border bg-card p-4 shadow-sm",
				done && "bg-muted/60 shadow-none",
			)}
		>
			<div className="flex items-center gap-3">
				<span
					className={cn(
						"grid size-12 shrink-0 place-items-center rounded-2xl text-white",
						meta.tile,
						done && "opacity-60",
					)}
				>
					<Icon className="size-6" strokeWidth={2.4} />
				</span>
				<div className="min-w-0 flex-1">
					<p className={cn("font-bold text-xs", meta.text)}>{meta.label}</p>
					<p className="font-extrabold text-2xl tabular-nums leading-tight">
						{solved}
						<span className="font-bold text-lg text-muted-foreground">
							{" "}
							/ {goal.goal} soru
						</span>
					</p>
					{goal.tests !== null && (
						<p className="font-semibold text-muted-foreground text-xs">
							Yaklaşık {goal.tests} test
						</p>
					)}
				</div>
				{done && (
					<span
						role="img"
						aria-label="Hedef tamam"
						className="grid size-10 shrink-0 place-items-center rounded-full bg-ivme-orange text-white motion-safe:animate-pop"
					>
						<Check className="size-5" strokeWidth={3.2} />
					</span>
				)}
			</div>
			<div
				role="progressbar"
				aria-label={`${meta.label} soru hedefi`}
				aria-valuemin={0}
				aria-valuemax={goal.goal}
				aria-valuenow={Math.min(solved, goal.goal)}
				className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
			>
				<div
					className="h-full rounded-full bg-gradient-to-r from-ivme-orange to-ivme-orange-deep transition-[width] duration-500"
					style={{ width: `${ratio * 100}%` }}
				/>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				{STEPS.map((s) => (
					<button
						key={s}
						type="button"
						disabled={s < 0 && solved === 0}
						onClick={() => set(solved + s)}
						className="min-h-11 min-w-16 rounded-full border px-4 font-extrabold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-40"
					>
						{s > 0 ? `+${s}` : s}
					</button>
				))}
				{!done && (
					<button
						type="button"
						onClick={() => set(goal.goal)}
						className="ml-auto min-h-11 rounded-full bg-primary px-4 font-extrabold text-primary-foreground text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
					>
						Hedefi bitirdim
					</button>
				)}
			</div>
			{tasks.length > 0 && (
				<ul
					aria-label={`${meta.label} için önerilen testler`}
					className="mt-3 flex flex-col gap-2 border-t pt-3"
				>
					{tasks.map((t) => (
						<li key={t.id}>
							<label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-1 has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-ring/40">
								<input
									type="checkbox"
									checked={t.done}
									onChange={() => onToggleTask?.(t.id, !t.done)}
									className="sr-only"
								/>
								<span
									className={cn(
										"grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
										t.done
											? "border-transparent bg-ivme-orange text-white"
											: "border-border text-transparent",
									)}
								>
									<Check className="size-4" strokeWidth={3.2} />
								</span>
								<span className="min-w-0">
									<span
										className={cn(
											"block font-bold leading-tight",
											t.done && "text-muted-foreground line-through",
										)}
									>
										{t.work}
									</span>
									<span className="block truncate text-muted-foreground text-xs">
										{t.topic}
									</span>
								</span>
							</label>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
