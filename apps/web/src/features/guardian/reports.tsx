import { addDays, type Subject, weekLabel } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Copy, Lock, Share2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { GhostButton } from "@/components/kit";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const shortDate = new Intl.DateTimeFormat("tr-TR", {
	day: "numeric",
	month: "short",
});

function Card({
	title,
	hint,
	children,
}: {
	title: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<section className="rounded-3xl border bg-card p-5 shadow-sm">
			<h2 className="font-extrabold text-lg leading-tight">{title}</h2>
			{hint && <p className="mt-0.5 text-muted-foreground text-sm">{hint}</p>}
			{children}
		</section>
	);
}

/** ADR-0006/0008: veli raporları. Ücretsiz katman "ne oldu", konu haritası ücretli "ne yapmalı". */
export function ReportsView({ childId }: { childId: string }) {
	const [weekStart, setWeekStart] = useState<string>();
	const week = useReportWeek(childId, weekStart);
	const history = useQuery(
		orpc.report.history.queryOptions({ input: { childId } }),
	);
	const map = useQuery(
		orpc.library.topicMap.queryOptions({ input: { childId } }),
	);
	const diagnosis = useQuery(
		orpc.exam.diagnosis.queryOptions({ input: { childId } }),
	);
	const thisWeek = history.data?.weeks.at(-1)?.weekStart;
	const qc = useQueryClient();
	const removeExam = useMutation(
		orpc.exam.remove.mutationOptions({
			onSuccess: () => qc.invalidateQueries(),
		}),
	);

	return (
		<div className="mt-4 flex flex-col gap-4 md:gap-5">
			<WeekSummary
				data={week.data}
				pending={week.isPending}
				canGoNext={!!week.data && !!thisWeek && week.data.weekStart < thisWeek}
				onPrev={() =>
					week.data && setWeekStart(addDays(week.data.weekStart, -7))
				}
				onNext={() =>
					week.data && setWeekStart(addDays(week.data.weekStart, 7))
				}
			/>
			<div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-5">
				<TrendCard weeks={history.data?.weeks} />
				<ExamTrendCard
					exams={history.data?.exams}
					onDelete={(examId) => removeExam.mutate({ childId, examId })}
				/>
			</div>
			<WeakTopicsCard
				topics={(diagnosis.data?.weakTopics ?? []).map((w) => ({
					subject: w.subject as Subject,
					topic: w.topic,
					count: w.exams,
				}))}
			/>
			<TopicMapCard data={map.data} />
		</div>
	);
}

function useReportWeek(childId: string, weekStart?: string) {
	return useQuery(
		orpc.report.week.queryOptions({ input: { childId, weekStart } }),
	);
}
type WeekData = NonNullable<ReturnType<typeof useReportWeek>["data"]>;

function WeekSummary({
	data,
	pending,
	canGoNext,
	onPrev,
	onNext,
}: {
	data?: WeekData;
	pending: boolean;
	canGoNext: boolean;
	onPrev: () => void;
	onNext: () => void;
}) {
	const [status, setStatus] = useState<string>();
	if (pending || !data) {
		return (
			<Card title="Haftalık özet">
				<p className="mt-3 text-muted-foreground text-sm">Yükleniyor…</p>
			</Card>
		);
	}
	const share = async () => {
		try {
			if (navigator.share) {
				await navigator.share({ text: data.shareText });
				return;
			}
			await navigator.clipboard.writeText(data.shareText);
			setStatus("Kopyalandı. WhatsApp'a yapıştırabilirsiniz.");
		} catch {
			setStatus("Kopyalanamadı; metni aşağıdan seçip kopyalayın.");
		}
	};
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(data.shareText);
			setStatus("Kopyalandı.");
		} catch {
			setStatus("Kopyalanamadı; metni aşağıdan seçip kopyalayın.");
		}
	};
	const max = Math.max(1, ...data.days.map((d) => Math.max(d.goal, d.solved)));
	return (
		<Card title="Haftalık özet">
			<div className="mt-2 flex items-center justify-between gap-2">
				<button
					type="button"
					aria-label="Önceki hafta"
					onClick={onPrev}
					className="grid size-11 place-items-center rounded-full border outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
				>
					<ChevronLeft className="size-5" />
				</button>
				<p className="font-bold text-sm">{data.label}</p>
				<button
					type="button"
					aria-label="Sonraki hafta"
					disabled={!canGoNext}
					onClick={onNext}
					className="grid size-11 place-items-center rounded-full border outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-40"
				>
					<ChevronRight className="size-5" />
				</button>
			</div>
			<p className="mt-3 font-extrabold text-lg leading-snug">
				{data.headline}
			</p>
			{data.ratio !== null && (
				<div
					role="progressbar"
					aria-label="Hedef tamamlanma oranı"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.min(100, Math.round(data.ratio * 100))}
					className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
				>
					<div
						className={cn(
							"h-full rounded-full transition-[width] duration-500",
							data.level === "on_target"
								? "bg-primary"
								: "bg-gradient-to-r from-ivme-orange to-ivme-orange-deep",
						)}
						style={{ width: `${Math.min(1, data.ratio) * 100}%` }}
					/>
				</div>
			)}
			<figure
				aria-label={`Günlük çözülen soru: ${data.days.map((d) => `${WEEKDAYS[d.weekday - 1]} ${d.solved}`).join(", ")}`}
				className="mt-4"
			>
				<div className="grid grid-cols-7 gap-1.5">
					{data.days.map((d) => (
						<div key={d.date} className="flex flex-col items-center gap-1">
							<span className="font-bold text-xs tabular-nums">{d.solved}</span>
							<div className="relative flex h-16 w-6 items-end overflow-hidden rounded-t-[4px] bg-muted">
								<div
									className="w-full rounded-t-[4px] bg-primary"
									style={{ height: `${(d.solved / max) * 100}%` }}
								/>
								{d.goal > 0 && (
									<div
										aria-hidden
										className="absolute inset-x-0 border-ivme-orange-deep border-t-2 border-dashed"
										style={{ bottom: `${(d.goal / max) * 100}%` }}
									/>
								)}
							</div>
							<span
								className={cn(
									"text-xs",
									d.studyDay
										? "font-semibold text-muted-foreground"
										: "text-muted-foreground/50",
								)}
							>
								{WEEKDAYS[d.weekday - 1]}
							</span>
						</div>
					))}
				</div>
				<figcaption className="mt-2 text-muted-foreground text-xs">
					Kesikli çizgi günlük hedefi gösterir.
				</figcaption>
			</figure>
			<ul className="mt-4 flex flex-col gap-1.5 text-sm">
				{data.lines.map((l) => (
					<li key={l} className="leading-snug">
						{l}
					</li>
				))}
			</ul>
			<div className="mt-4 flex flex-wrap gap-2">
				<GhostButton onClick={share}>
					<Share2 aria-hidden className="size-4" />
					Paylaş
				</GhostButton>
				<GhostButton onClick={copy}>
					<Copy aria-hidden className="size-4" />
					Metni kopyala
				</GhostButton>
			</div>
			{status && (
				<p role="status" className="mt-2 text-muted-foreground text-sm">
					{status}
				</p>
			)}
			<details className="mt-2">
				<summary className="min-h-9 cursor-pointer text-muted-foreground text-sm">
					Paylaşılacak metni göster
				</summary>
				<textarea
					readOnly
					value={data.shareText}
					rows={Math.min(12, data.lines.length + 3)}
					className="mt-1 w-full rounded-2xl border bg-background p-3 text-sm"
				/>
			</details>
		</Card>
	);
}

function TrendCard({
	weeks,
}: {
	weeks?: {
		weekStart: string;
		solved: number;
		goal: number;
		tasksDone: number;
		tasksTotal: number;
	}[];
}) {
	const has = (weeks ?? []).some((w) => w.solved > 0 || w.goal > 0);
	const max = Math.max(
		1,
		...(weeks ?? []).map((w) => Math.max(w.solved, w.goal)),
	);
	return (
		<Card title="Son 8 hafta" hint="Her haftada çözülen soru ve hedef">
			{!weeks || !has ? (
				<p className="mt-3 text-muted-foreground text-sm">
					Soru hedefi koyup çözülen soruları girdikçe gidişat burada görünür.
				</p>
			) : (
				<figure
					aria-label={`Haftalık çözülen soru: ${weeks.map((w) => `${shortDate.format(new Date(w.weekStart))} ${w.solved}`).join(", ")}`}
					className="mt-4"
				>
					<div className="grid grid-cols-8 gap-1.5">
						{weeks.map((w, i) => (
							<div
								key={w.weekStart}
								className="flex flex-col items-center gap-1"
							>
								<span className="font-bold text-[0.65rem] tabular-nums">
									{w.solved}
								</span>
								<div className="relative flex h-24 w-5 items-end overflow-hidden rounded-t-[4px] bg-muted">
									<div
										className={cn(
											"w-full rounded-t-[4px]",
											i === weeks.length - 1 ? "bg-primary" : "bg-primary/60",
										)}
										style={{ height: `${(w.solved / max) * 100}%` }}
									/>
									{w.goal > 0 && (
										<div
											aria-hidden
											className="absolute inset-x-0 border-ivme-orange-deep border-t-2 border-dashed"
											style={{ bottom: `${(w.goal / max) * 100}%` }}
										/>
									)}
								</div>
								<span className="text-[0.6rem] text-muted-foreground">
									{shortDate.format(new Date(w.weekStart))}
								</span>
							</div>
						))}
					</div>
				</figure>
			)}
		</Card>
	);
}

function ExamTrendCard({
	exams,
	onDelete,
}: {
	onDelete?: (examId: string) => void;
	exams?: {
		id: string;
		name: string;
		date: string;
		netTotal: number;
		subjects: { subject: Subject; net: number }[];
	}[];
}) {
	const list = exams ?? [];
	const W = 280;
	const H = 100;
	const nets = list.map((e) => e.netTotal);
	const min = Math.min(0, ...nets);
	const max = Math.max(1, ...nets);
	const x = (i: number) =>
		list.length === 1 ? W / 2 : (i / (list.length - 1)) * W;
	const y = (n: number) => H - ((n - min) / (max - min)) * H;
	const last = list.at(-1);
	return (
		<Card title="Deneme trendi" hint="Toplam net, denemeden denemeye">
			{list.length === 0 ? (
				<p className="mt-3 text-muted-foreground text-sm">
					Deneme sonuçlarını girdikçe net değişimi burada görünür.
				</p>
			) : (
				<>
					<figure
						aria-label={`Deneme netleri: ${list.map((e) => `${e.name} ${e.netTotal}`).join(", ")}`}
						className="mt-4"
					>
						<svg
							viewBox={`-8 -12 ${W + 16} ${H + 28}`}
							className="h-32 w-full overflow-visible"
							role="img"
							aria-hidden
						>
							<polyline
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinejoin="round"
								className="text-primary"
								points={list
									.map((e, i) => `${x(i)},${y(e.netTotal)}`)
									.join(" ")}
							/>
							{list.map((e, i) => (
								<g key={e.id}>
									<circle
										cx={x(i)}
										cy={y(e.netTotal)}
										r="4"
										className="fill-primary"
									/>
									<text
										x={x(i)}
										y={y(e.netTotal) - 8}
										textAnchor="middle"
										className="fill-foreground font-bold text-[10px]"
									>
										{e.netTotal}
									</text>
								</g>
							))}
						</svg>
					</figure>
					<details className="mt-3 rounded-2xl border px-3 py-2">
						<summary className="min-h-9 cursor-pointer font-bold text-sm">
							Girilen denemeler ({list.length})
						</summary>
						<ul className="mt-2 flex flex-col gap-1.5 text-sm">
							{[...list].reverse().map((e) => (
								<li
									key={e.id}
									className="flex items-center justify-between gap-2"
								>
									<span className="min-w-0 truncate">
										<b>{e.name}</b>{" "}
										<span className="text-muted-foreground">
											· {shortDate.format(new Date(e.date))} · {e.netTotal} net
										</span>
									</span>
									<button
										type="button"
										aria-label={`${e.name} denemesini sil`}
										onClick={() => {
											if (window.confirm(`"${e.name}" denemesi silinsin mi?`))
												onDelete?.(e.id);
										}}
										className="min-h-9 shrink-0 rounded-full px-3 font-bold text-destructive text-xs outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
									>
										Sil
									</button>
								</li>
							))}
						</ul>
					</details>
					{last && (
						<ul className="mt-2 flex flex-col gap-1 text-sm">
							{last.subjects.map((s) => (
								<li key={s.subject} className="flex justify-between gap-3">
									<span className={SUBJECTS[s.subject].text}>
										{SUBJECTS[s.subject].label}
									</span>
									<b className="tabular-nums">{s.net} net</b>
								</li>
							))}
						</ul>
					)}
				</>
			)}
		</Card>
	);
}

function WeakTopicsCard({
	topics,
}: {
	topics: { subject: Subject; topic: string; count: number }[];
}) {
	return (
		<Card title="Zayıf konular" hint="Denemelerde en çok zorlandığı konular">
			{topics.length === 0 ? (
				<p className="mt-3 text-muted-foreground text-sm">
					Deneme girişinde zorlandığı konuları işaretleyin; en sık görülenler
					burada listelenir.
				</p>
			) : (
				<ul className="mt-3 flex flex-col gap-2">
					{topics.slice(0, 6).map((t) => (
						<li
							key={`${t.subject}-${t.topic}`}
							className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2"
						>
							<span className="min-w-0">
								<span
									className={cn(
										"block font-bold text-xs",
										SUBJECTS[t.subject].text,
									)}
								>
									{SUBJECTS[t.subject].label}
								</span>
								<span className="block font-semibold leading-tight">
									{t.topic}
								</span>
							</span>
							<span className="shrink-0 text-muted-foreground text-xs">
								{t.count} denemede
							</span>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}

function TopicMapCard({
	data,
}: {
	data?: {
		locked: boolean;
		weeks: {
			weekStart: string;
			subjects: {
				subject: Subject;
				topics: string[];
				units: string[];
				onBreak: string | null;
			}[];
		}[];
	};
}) {
	if (!data) return null;
	if (data.locked) {
		return (
			<Card
				title="Aylık konu haritası"
				hint="Önümüzdeki 4 haftada okulda işlenecek konular"
			>
				<p className="mt-3 flex items-start gap-2 rounded-2xl bg-accent px-3 py-2 text-sm">
					<Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
					Konu haritası Bireysel Koçluk ile açılır. Ödev takibi ve soru hedefi
					ücretsiz kalır.
				</p>
			</Card>
		);
	}
	return (
		<Card
			title="Aylık konu haritası"
			hint="Önümüzdeki 4 haftada okulda işlenecek konular"
		>
			<ol className="mt-3 flex flex-col gap-3">
				{data.weeks.map((w, i) => (
					<li key={w.weekStart} className="rounded-2xl border p-3">
						<p className="font-extrabold text-sm">
							{i === 0 ? "Bu hafta" : `${i}. hafta sonra`}{" "}
							<span className="font-semibold text-muted-foreground">
								· {weekLabel(w.weekStart)}
							</span>
						</p>
						{w.subjects.length === 0 ? (
							<p className="mt-1 text-muted-foreground text-sm">
								Müfredat verisi yok.
							</p>
						) : (
							<ul className="mt-2 flex flex-col gap-1.5">
								{w.subjects.map((s) => (
									<li key={s.subject} className="text-sm leading-snug">
										<b className={SUBJECTS[s.subject].text}>
											{SUBJECTS[s.subject].label}:
										</b>{" "}
										{s.onBreak
											? `${s.onBreak} (tatil)`
											: s.topics.length > 0
												? s.topics.join(", ")
												: s.units.length > 0
													? s.units.join(", ")
													: "—"}
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ol>
			<p className="mt-3 text-muted-foreground text-xs">
				Somut görevler (kaynak, sayfa, test) her hafta başında son denemeye göre
				üretilir; harita yalnızca konuları gösterir.
			</p>
		</Card>
	);
}
