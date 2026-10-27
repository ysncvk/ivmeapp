import { rewardProgress } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import {
	CalendarDays,
	Check,
	GraduationCap,
	LogOut,
	Plus,
	Settings,
	Sparkles,
	Sun,
	Target,
	Trophy,
	UserRound,
} from "lucide-react";
import { useState } from "react";

import { SUBJECTS } from "../student/subjects";
import { DayColumns, ResultBars } from "./charts";
import type { ChildData, QuestionsData, RewardTier } from "./mock";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
	day: "numeric",
	month: "long",
});

export interface GuardianActions {
	onAddChild?: () => void;
	onSettings?: (childId: string) => void;
	onSignOut?: () => void;
	onStartTrial?: (childId: string) => void;
	onAddHomework?: (childId: string) => void;
	onToggleHomework?: (childId: string, id: string, done: boolean) => void;
	onAddExam?: (childId: string) => void;
	onEditRewards?: (childId: string) => void;
	onEditQuestions?: (childId: string) => void;
	onGrant?: (childId: string, tier: RewardTier["tier"], given: boolean) => void;
}

export function GuardianScreen({
	childProfiles,
	actions = {},
	activeId: controlledId,
	onSelect,
}: {
	childProfiles: ChildData[];
	actions?: GuardianActions;
	activeId?: string;
	onSelect?: (id: string) => void;
}) {
	const [localId, setLocalId] = useState(childProfiles[0]?.id);
	const activeId = controlledId ?? localId;
	const setActiveId = (id: string) => {
		setLocalId(id);
		onSelect?.(id);
	};
	const child =
		childProfiles.find((c) => c.id === activeId) ?? childProfiles[0];

	return (
		<div className="min-h-svh bg-[radial-gradient(60rem_30rem_at_50%_-10%,color-mix(in_oklch,var(--ivme-violet)_10%,transparent),transparent)]">
			<AppBar
				childProfiles={childProfiles}
				activeId={child?.id}
				onSelect={setActiveId}
				actions={actions}
			/>
			<main className="mx-auto w-full max-w-md px-4 pt-4 pb-20 sm:max-w-xl md:max-w-4xl md:pt-6 lg:max-w-5xl">
				{child ? (
					<div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-5">
						<div className="flex flex-col gap-4 md:gap-5">
							<QuestionsCard
								key={`q-${child.id}`}
								childId={child.id}
								data={child.questions}
								actions={actions}
							/>
							<WeekCard key={`w-${child.id}`} child={child} />
							<RewardsCard
								key={`r-${child.id}`}
								childId={child.id}
								rewards={child.rewards}
								actions={actions}
							/>
						</div>
						<div className="flex flex-col gap-4 md:gap-5">
							<DiagnosisCard child={child} actions={actions} />
							<PaywallCard child={child} actions={actions} />
							<HomeworkCard child={child} actions={actions} />
						</div>
					</div>
				) : (
					<EmptyChildren onAdd={actions.onAddChild} />
				)}
			</main>
		</div>
	);
}

function EmptyChildren({ onAdd }: { onAdd?: () => void }) {
	return (
		<section className="mx-auto mt-10 max-w-md rounded-3xl border bg-card p-6 text-center shadow-sm">
			<UserRound aria-hidden className="mx-auto size-10 text-primary" />
			<h2 className="mt-3 font-extrabold text-xl">Çocuğunu ekle</h2>
			<p className="mt-1 text-muted-foreground text-sm">
				Ad, kullanıcı adı ve şifre yeter. Çocuğun e-posta ya da kimlik bilgisi
				girmez.
			</p>
			<button
				type="button"
				onClick={onAdd}
				className="mt-4 min-h-12 rounded-2xl bg-primary px-6 font-extrabold text-primary-foreground"
			>
				Çocuk ekle
			</button>
		</section>
	);
}

function AppBar({
	childProfiles,
	activeId,
	onSelect,
	actions,
}: {
	childProfiles: ChildData[];
	activeId?: string;
	onSelect: (id: string) => void;
	actions: GuardianActions;
}) {
	return (
		<header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
			<div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 sm:max-w-xl md:max-w-4xl lg:max-w-5xl">
				<div className="flex items-center gap-2.5">
					<div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-ivme-orange to-ivme-orange-deep font-extrabold text-white">
						İ
					</div>
					<div className="leading-tight">
						<p className="font-extrabold text-lg">İvme</p>
						<p className="font-semibold text-muted-foreground text-xs">
							Veli paneli
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1.5">
					<nav
						aria-label="Çocuk seç"
						className="flex gap-1.5 rounded-full bg-muted p-1"
					>
						{childProfiles.map((c) => (
							<button
								key={c.id}
								type="button"
								aria-pressed={c.id === activeId}
								onClick={() => onSelect(c.id)}
								className={cn(
									"min-h-9 rounded-full px-4 font-bold text-sm transition-colors",
									"outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
									c.id === activeId
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{c.name}
							</button>
						))}
					</nav>
					{actions.onAddChild && (
						<button
							type="button"
							aria-label="Çocuk ekle"
							onClick={actions.onAddChild}
							className="grid size-10 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
						>
							<Plus className="size-5" />
						</button>
					)}
					{actions.onSignOut && (
						<button
							type="button"
							aria-label="Çıkış yap"
							onClick={actions.onSignOut}
							className="grid size-10 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
						>
							<LogOut className="size-5" />
						</button>
					)}
					<button
						type="button"
						aria-label="Ayarlar"
						onClick={() => activeId && actions.onSettings?.(activeId)}
						className="grid size-10 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
					>
						<Settings className="size-5" />
					</button>
				</div>
			</div>
		</header>
	);
}

function Card({
	title,
	hint,
	children,
	className,
}: {
	title: string;
	hint?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn("rounded-3xl border bg-card p-5 shadow-sm", className)}
		>
			<h2 className="font-extrabold text-lg leading-tight">{title}</h2>
			{hint && <p className="mt-0.5 text-muted-foreground text-sm">{hint}</p>}
			{children}
		</section>
	);
}

function WeekCard({ child }: { child: ChildData }) {
	if (!child.week) {
		return (
			<Card
				title={`${child.name}, bu hafta`}
				hint="Haftalık plan Bireysel Koçluk ile açılır"
			>
				<p className="mt-3 text-muted-foreground text-sm">
					Ödev takibi ücretsiz çalışır. Gün gün plan için aşağıdaki denemeyi
					başlatabilirsiniz.
				</p>
			</Card>
		);
	}
	const { done, total } = child.week;
	const pct = total === 0 ? 0 : Math.round((done / total) * 100);
	return (
		<Card title={`${child.name}, bu hafta`} hint="Tamamlanan görevler">
			<div className="mt-3 flex items-end gap-2">
				<span className="font-extrabold text-6xl leading-none tracking-tight">
					{done}
				</span>
				<span className="pb-1 font-bold text-2xl text-muted-foreground">
					/ {total} görev
				</span>
				<span className="ml-auto rounded-full bg-accent px-3 py-1 font-extrabold text-accent-foreground text-sm">
					%{pct}
				</span>
			</div>
			<DayColumns days={child.week.days} />
		</Card>
	);
}

function DiagnosisCard({
	child,
	actions,
}: {
	child: ChildData;
	actions: GuardianActions;
}) {
	const { exam, weakTopics } = child;
	if (!exam) {
		return (
			<Card
				title="Deneme sonucu"
				hint="Deneme girin, zayıf konuları birlikte görelim"
			>
				<button
					type="button"
					onClick={() => actions.onAddExam?.(child.id)}
					className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
				>
					<Plus className="size-4" />
					Deneme ekle
				</button>
			</Card>
		);
	}
	return (
		<Card
			title="Son deneme"
			hint={`${exam.name} · ${dateFmt.format(new Date(exam.date))}`}
		>
			<ResultBars subjects={exam.subjects} />
			<div className="mt-6 border-t pt-4">
				<h3 className="font-extrabold">Zayıf konular</h3>
				{weakTopics.length === 0 ? (
					<p className="mt-2 text-muted-foreground text-sm">
						Son denemede belirgin bir zayıf konu görünmüyor.
					</p>
				) : (
					<ul className="mt-2 flex flex-col gap-2">
						{weakTopics.map((w) => (
							<li
								key={`${w.subject}-${w.topic}`}
								className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5"
							>
								<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-ivme-orange-deep">
									<Target className="size-5" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block font-bold leading-tight">
										{w.topic}
									</span>
									<span className="block text-muted-foreground text-xs">
										{SUBJECTS[w.subject].label}
									</span>
								</span>
								<span className="shrink-0 font-bold text-muted-foreground text-xs">
									{w.exams} denemedir
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<button
				type="button"
				onClick={() => actions.onAddExam?.(child.id)}
				className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
			>
				<Plus className="size-4" />
				Deneme ekle
			</button>
		</Card>
	);
}

/** ADR-0006/0014: ücretsiz teşhisten ücretli plana şeffaf geçiş, ödev takibi ücretsiz kalır. */
function PaywallCard({
	child,
	actions,
}: {
	child: ChildData;
	actions: GuardianActions;
}) {
	// Plan erişimi varsa ya da önizlemede abonelik bilgisi yoksa kart gösterilmez
	if (!child.subscription || child.subscription.hasAccess) return null;
	const topics = child.weakTopics.slice(0, 2).map((w) => w.topic);
	const lead =
		topics.length === 0
			? "için haftalık plan hazırlayalım."
			: topics.length === 1
				? `${topics[0]} konusunda zayıf görünüyor.`
				: `${topics.join(" ve ")} konularında zayıf görünüyor.`;
	const canTrial = child.subscription.canStartTrial;
	return (
		<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ivme-indigo-deep via-[oklch(0.42_0.18_280)] to-ivme-violet p-5 text-white shadow-lg shadow-primary/20">
			<div
				aria-hidden
				className="absolute -top-8 -right-8 size-32 rounded-full bg-ivme-orange/35 blur-2xl"
			/>
			<div className="relative">
				<Sparkles aria-hidden className="size-6 text-ivme-orange" />
				<p className="mt-2 font-extrabold text-xl leading-snug">
					{child.name} {lead}
				</p>
				<p className="mt-1 text-sm text-white/80">
					Bu konular için haftalık program oluştur: kitap, sayfa ve test
					numarasıyla, gün gün.
				</p>
				{canTrial ? (
					<button
						type="button"
						onClick={() => actions.onStartTrial?.(child.id)}
						className="mt-4 min-h-12 w-full rounded-2xl bg-white px-5 font-extrabold text-ivme-indigo-deep outline-none transition-transform focus-visible:ring-4 focus-visible:ring-white/50 active:scale-[0.98]"
					>
						Bireysel Koçluk'u bir hafta dene
					</button>
				) : (
					<p className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-center font-bold text-sm">
						Deneme süresi bitti. Abonelik seçenekleri yakında.
					</p>
				)}
				<p className="mt-2 text-center text-white/70 text-xs">
					Kart bilgisi gerekmez. Ödev takibi her zaman ücretsizdir.
				</p>
			</div>
		</section>
	);
}

function HomeworkCard({
	child,
	actions,
}: {
	child: ChildData;
	actions: GuardianActions;
}) {
	return (
		<Card title="Ödevler" hint="Öğretmenin verdiği ve senin eklediğin ödevler">
			{child.homework.length === 0 && (
				<p className="mt-3 text-muted-foreground text-sm">Açık ödev yok.</p>
			)}
			<ul className="mt-3 flex flex-col gap-2">
				{child.homework.map((h) => {
					const meta = SUBJECTS[h.subject];
					const Icon = meta.icon;
					return (
						<li
							key={h.id}
							className="flex items-center gap-3 rounded-2xl border px-3 py-2.5"
						>
							<span
								className={cn(
									"grid size-10 shrink-0 place-items-center rounded-xl text-white",
									meta.tile,
									h.done && "opacity-50",
								)}
							>
								<Icon className="size-5" strokeWidth={2.4} />
							</span>
							<span className="min-w-0 flex-1">
								<span
									className={cn(
										"block font-bold leading-tight",
										h.done && "text-muted-foreground line-through",
									)}
								>
									{h.title}
								</span>
								<span className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
									{h.source === "teacher" ? (
										<GraduationCap aria-hidden className="size-3.5" />
									) : (
										<UserRound aria-hidden className="size-3.5" />
									)}
									{h.source === "teacher"
										? "Öğretmen"
										: h.source === "guardian"
											? "Veli"
											: "Öğrenci"}{" "}
									· {h.due}
								</span>
							</span>
							<button
								type="button"
								aria-pressed={h.done}
								onClick={() =>
									actions.onToggleHomework?.(child.id, h.id, !h.done)
								}
								className={cn(
									"min-h-9 shrink-0 rounded-full px-3 font-bold text-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
									h.done
										? "bg-primary/10 text-primary"
										: "bg-muted text-muted-foreground",
								)}
							>
								{h.done ? "Yapıldı" : "Bekliyor"}
							</button>
						</li>
					);
				})}
			</ul>
			<button
				type="button"
				onClick={() => actions.onAddHomework?.(child.id)}
				className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
			>
				<Plus className="size-4" />
				Ödev ekle
			</button>
		</Card>
	);
}

const TIERS = {
	daily: { label: "Günlük", icon: Sun },
	weekly: { label: "Haftalık", icon: CalendarDays },
	milestone: { label: "Büyük ödül", icon: Trophy },
} as const;

/** ADR-0016: ödülü veli tanımlar ve teslim eder; hedef tamamlama oranıdır. */
function RewardsCard({
	childId,
	rewards,
	actions,
}: {
	childId: string;
	rewards: RewardTier[];
	actions: GuardianActions;
}) {
	const [given, setGiven] = useState<ReadonlySet<string>>(
		new Set(rewards.filter((r) => r.given).map((r) => r.tier)),
	);
	return (
		<Card title="Ödüller" hint="Hedef: planın tamamlama oranı">
			{rewards.length === 0 && (
				<p className="mt-3 text-muted-foreground text-sm">
					Henüz ödül tanımlanmadı. Çocuğun sevdiği bir ödül seç.
				</p>
			)}
			<ul className="mt-3 flex flex-col gap-3">
				{rewards.map((r) => {
					const p =
						r.progress ??
						rewardProgress({
							completed: r.completed,
							total: r.total,
							threshold: r.threshold,
						});
					const t = TIERS[r.tier];
					const Icon = t.icon;
					const isGiven = given.has(r.tier);
					return (
						<li key={r.tier} className="rounded-2xl border p-3">
							<div className="flex items-center gap-3">
								<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-ivme-orange-deep">
									<Icon className="size-5" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block font-bold text-muted-foreground text-xs uppercase tracking-wide">
										{t.label}
									</span>
									<span className="block truncate font-extrabold leading-tight">
										{r.title}
									</span>
								</span>
							</div>
							<div
								role="progressbar"
								aria-valuemin={0}
								aria-valuemax={p.target}
								aria-valuenow={Math.min(p.completed, p.target)}
								className="mt-3 h-3 overflow-hidden rounded-full bg-muted"
							>
								<div
									className="h-full rounded-full bg-gradient-to-r from-ivme-orange to-ivme-orange-deep"
									style={{ width: `${p.ratio * 100}%` }}
								/>
							</div>
							<div className="mt-2 flex items-center justify-between gap-3">
								<p className="font-semibold text-muted-foreground text-sm">
									{p.unlocked ? (
										<span className="text-ivme-orange-deep">Hedefe ulaştı</span>
									) : (
										<>
											<b className="text-foreground">{p.remaining} görev</b>{" "}
											kaldı
										</>
									)}
								</p>
								{p.unlocked && (
									<button
										type="button"
										aria-pressed={isGiven}
										onClick={() => {
											actions.onGrant?.(childId, r.tier, !isGiven);
											setGiven((prev) => {
												const next = new Set(prev);
												if (!next.delete(r.tier)) next.add(r.tier);
												return next;
											});
										}}
										className={cn(
											"inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-bold text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
											isGiven
												? "bg-muted text-muted-foreground"
												: "bg-primary text-primary-foreground",
										)}
									>
										<Check className="size-4" strokeWidth={3} />
										{isGiven ? "Verildi" : "Verildi olarak işaretle"}
									</button>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			<button
				type="button"
				onClick={() => actions.onEditRewards?.(childId)}
				className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
			>
				<Settings className="size-4" />
				Ödülleri düzenle
			</button>
		</Card>
	);
}

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/** Basit mod: ders başına günlük soru hedefi ve haftalık gidişat. */
function QuestionsCard({
	childId,
	data,
	actions,
}: {
	childId: string;
	data?: QuestionsData;
	actions: GuardianActions;
}) {
	const edit = (
		<button
			type="button"
			onClick={() => actions.onEditQuestions?.(childId)}
			className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
		>
			<Settings className="size-4" />
			{data && data.subjects.length > 0 ? "Hedefleri düzenle" : "Hedef belirle"}
		</button>
	);
	if (!data || data.subjects.length === 0) {
		return (
			<Card title="Günlük soru hedefi" hint="Basit takip">
				<p className="mt-3 text-muted-foreground text-sm">
					Her ders için günde kaç soru çözüleceğini belirle. Çocuk kendi
					ekranından çözdüğü soru sayısını yazar, sen buradan görürsün.
				</p>
				{edit}
			</Card>
		);
	}
	const { week } = data;
	const pct = week.goal === 0 ? 0 : Math.round((week.solved / week.goal) * 100);
	return (
		<Card title="Günlük soru hedefi" hint="Bu hafta çözülen soru">
			<div className="mt-3 flex items-end gap-2">
				<span className="font-extrabold text-6xl leading-none tracking-tight">
					{week.solved}
				</span>
				<span className="pb-1 font-bold text-2xl text-muted-foreground">
					/ {week.goal} soru
				</span>
				<span className="ml-auto rounded-full bg-accent px-3 py-1 font-extrabold text-accent-foreground text-sm">
					%{pct}
				</span>
			</div>
			<figure
				aria-label={`Günlük çözülen soru: ${data.days
					.map((d) => `${WEEKDAYS[d.day - 1]} ${d.solved}`)
					.join(", ")}`}
				className="mt-5"
			>
				<div className="grid grid-cols-7 gap-1.5">
					{data.days.map((d) => {
						const ratio =
							d.goal === 0
								? d.solved > 0
									? 1
									: 0
								: Math.min(1, d.solved / d.goal);
						const future = d.date > data.date;
						return (
							<div key={d.date} className="flex flex-col items-center gap-1.5">
								<span
									className={cn(
										"font-bold text-xs tabular-nums",
										future ? "text-muted-foreground/70" : "text-foreground",
									)}
								>
									{future ? "·" : d.solved}
								</span>
								<div className="flex h-20 w-6 items-end overflow-hidden rounded-t-[4px] bg-muted">
									<div
										className="w-full rounded-t-[4px] bg-primary transition-[height] duration-500"
										style={{ height: `${ratio * 100}%` }}
									/>
								</div>
								<span
									className={cn(
										"text-xs",
										d.date === data.date
											? "font-extrabold text-foreground"
											: "font-semibold text-muted-foreground",
										!d.studyDay && "opacity-50",
									)}
								>
									{WEEKDAYS[d.day - 1]}
								</span>
							</div>
						);
					})}
				</div>
			</figure>
			<ul className="mt-4 flex flex-col gap-2">
				{data.subjects.map((s) => {
					const meta = SUBJECTS[s.subject];
					return (
						<li
							key={s.subject}
							className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2"
						>
							<span className={cn("font-bold text-sm", meta.text)}>
								{meta.label}
							</span>
							<span className="font-semibold text-sm tabular-nums">
								Bugün <b>{s.solvedToday}</b> / {s.goal}
								{s.tests !== null && (
									<span className="text-muted-foreground">
										{" "}
										(~{s.tests} test)
									</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
			{edit}
		</Card>
	);
}
