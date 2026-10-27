import {
	checkBlockMinutes,
	checkDailyBudget,
	type Subject,
} from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Check, Settings } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
	Brand,
	Chip,
	ErrorText,
	errorMessage,
	Field,
	GhostButton,
	PrimaryButton,
	Select,
	TextInput,
} from "@/components/kit";
import { authClient } from "@/lib/auth-client";
import { useMe } from "@/lib/me";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";
import { QuestionGoalsEditor } from "./dialogs";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const SUBJECT_ORDER = Object.keys(SUBJECTS) as Subject[];
/** Ders başına önerilen kaynak sayısı: fazlası planı seyreltir (uyarı, engel değil). */
const SOURCE_SOFT_LIMIT = 3;

const KIND_LABEL = {
	ders_kitabi: "Ders kitabı",
	yardimci: "Soru bankası",
} as const;

function Section({
	title,
	hint,
	icon,
	children,
	className,
}: {
	title: string;
	hint?: string;
	icon?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"flex flex-col gap-3 rounded-3xl border bg-card p-5 shadow-sm",
				className,
			)}
		>
			<div className="flex items-center gap-3">
				{icon}
				<div className="min-w-0">
					<h2 className="font-extrabold text-lg leading-tight">{title}</h2>
					{hint && (
						<p className="mt-0.5 text-muted-foreground text-sm">{hint}</p>
					)}
				</div>
			</div>
			{children}
		</section>
	);
}

/** Çocuğa ait ayar sayfalarının ortak kabuğu: geri bağlantısı, çocuk adı ve sekmeler. */
export function ChildPageShell({
	childId,
	active,
	children,
}: {
	childId: string;
	active: "ayarlar" | "kaynaklar";
	children: ReactNode;
}) {
	const me = useMe();
	const name = me.data?.children.find((c) => c.id === childId)?.displayName;
	return (
		<div className="min-h-svh bg-[radial-gradient(60rem_30rem_at_50%_-10%,color-mix(in_oklch,var(--ivme-violet)_10%,transparent),transparent)]">
			<header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:max-w-xl md:max-w-3xl">
					<Link
						to="/veli"
						className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 font-bold text-sm outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
					>
						<ArrowLeft aria-hidden className="size-5" />
						Veli paneli
					</Link>
					<Brand sub={name} />
				</div>
				<nav
					aria-label="Çocuk sayfaları"
					className="mx-auto flex w-full max-w-md gap-2 px-4 pb-3 sm:max-w-xl md:max-w-3xl"
				>
					<TabLink
						to="/veli/cocuk/$childId/ayarlar"
						childId={childId}
						current={active === "ayarlar"}
						icon={<Settings aria-hidden className="size-4" />}
					>
						Ayarlar
					</TabLink>
					<TabLink
						to="/veli/cocuk/$childId/kaynaklar"
						childId={childId}
						current={active === "kaynaklar"}
						icon={<BookOpen aria-hidden className="size-4" />}
					>
						Kaynaklar
					</TabLink>
				</nav>
			</header>
			<main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-4 pb-28 sm:max-w-xl md:max-w-3xl">
				{children}
			</main>
		</div>
	);
}

function TabLink({
	to,
	childId,
	current,
	icon,
	children,
}: {
	to: "/veli/cocuk/$childId/ayarlar" | "/veli/cocuk/$childId/kaynaklar";
	childId: string;
	current: boolean;
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<Link
			to={to}
			params={{ childId }}
			aria-current={current ? "page" : undefined}
			className={cn(
				"inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
				current
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:text-foreground",
			)}
		>
			{icon}
			{children}
		</Link>
	);
}

/** Sayfa altında yapışık kaydet çubuğu: uzun sayfada da kaydet düğmesi hep ulaşılabilir. */
function SaveBar({
	dirty,
	pending,
	message,
	error,
	onSave,
}: {
	dirty: boolean;
	pending: boolean;
	message?: string;
	error?: unknown;
	onSave: () => void;
}) {
	return (
		<div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
			<div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 sm:max-w-xl md:max-w-3xl">
				<p
					role="status"
					className={cn(
						"min-w-0 flex-1 text-sm",
						error ? "font-semibold text-destructive" : "text-muted-foreground",
					)}
				>
					{error
						? errorMessage(error)
						: (message ?? (dirty ? "Kaydedilmemiş değişiklik var" : ""))}
				</p>
				<PrimaryButton disabled={!dirty || pending} onClick={onSave}>
					{pending ? "Kaydediliyor…" : "Kaydet"}
				</PrimaryButton>
			</div>
		</div>
	);
}

/** Çocuk ayarları: çalışma düzeni, dersler, soru hedefi, hesap. (Eski açılır pencerenin yerine.) */
export function ChildSettingsPage({ childId }: { childId: string }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const me = useMe();
	const childName =
		me.data?.children.find((c) => c.id === childId)?.displayName ?? "Çocuk";
	const settings = useQuery(
		orpc.children.settings.get.queryOptions({ input: { childId } }),
	);
	const status = useQuery(
		orpc.library.curriculumStatus.queryOptions({ input: { childId } }),
	);
	const list = useQuery(orpc.children.list.queryOptions());
	const username = list.data?.find((c) => c.id === childId)?.username ?? null;
	const goalsSet =
		useQuery(orpc.questions.overview.queryOptions({ input: { childId } })).data
			?.subjects.length ?? 0;

	const [draft, setDraft] = useState<NonNullable<typeof settings.data>>();
	const [message, setMessage] = useState<string>();
	const [newPassword, setNewPassword] = useState("");
	const s = draft ?? settings.data;

	const update = useMutation(
		orpc.children.settings.update.mutationOptions({
			onSuccess: async (res) => {
				await qc.invalidateQueries();
				setDraft(undefined);
				setMessage(
					`Kaydedildi. Yeni ayarlar ${res.effectiveFrom} haftasından itibaren geçerli.`,
				);
			},
		}),
	);
	const rebuild = useMutation(
		orpc.plan.rebuild.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				setMessage("Bu haftanın planı yeni ayarlarla yeniden kuruldu.");
			},
		}),
	);
	const resetPw = useMutation(
		orpc.children.resetPassword.mutationOptions({
			onSuccess: () => {
				setNewPassword("");
				setMessage("Şifre değişti, çocuğun açık oturumları kapatıldı.");
			},
		}),
	);
	const signOutAll = useMutation(
		orpc.children.signOutEverywhere.mutationOptions({
			onSuccess: () =>
				setMessage("Çocuğun tüm cihazlardaki oturumu kapatıldı."),
		}),
	);
	const remove = useMutation(
		orpc.children.remove.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				navigate({ to: "/veli" });
			},
		}),
	);
	const deleteAccount = useMutation(
		orpc.account.deleteAccount.mutationOptions({
			onSuccess: async () => {
				await authClient.signOut();
				qc.clear();
				navigate({ to: "/giris", search: { next: undefined } });
			},
		}),
	);

	if (!s) {
		return (
			<ChildPageShell childId={childId} active="ayarlar">
				<p>Yükleniyor…</p>
			</ChildPageShell>
		);
	}
	const set = (p: Partial<typeof s>) => {
		setMessage(undefined);
		setDraft({ ...s, ...p });
	};
	const budget = checkDailyBudget(s.dailyBudgetMinutes);
	const block = checkBlockMinutes(s.blockMinutes);

	return (
		<ChildPageShell childId={childId} active="ayarlar">
			<Section
				title="Günlük soru hedefi"
				hint="Her ders için günde kaç soru? Koçluk açıkken hedef, günlük test sayısına çevrilir."
			>
				<QuestionGoalsEditor childId={childId} />
			</Section>

			<Section
				title="Çalışma düzeni"
				hint="Değişiklikler bir sonraki haftanın planında geçerli olur."
			>
				{goalsSet > 0 ? (
					<p className="rounded-xl bg-accent px-3 py-2 text-sm">
						Soru hedefi belirlediğiniz için günlük yük hedeften hesaplanır;
						günlük süre kullanılmaz.
					</p>
				) : (
					<>
						<Field label="Günlük süre (dk)">
							<TextInput
								inputMode="numeric"
								value={s.dailyBudgetMinutes}
								onChange={(e) =>
									set({
										dailyBudgetMinutes: Number(
											e.target.value.replace(/\D/g, ""),
										),
									})
								}
							/>
						</Field>
						{budget.level !== "ok" && (
							<p className="rounded-xl bg-accent px-3 py-2 text-sm">
								{budget.level === "strong_warn"
									? "Bu süre 11 yaş için çok yüksek; dinlenme ve oyun zamanını kısabilir."
									: "Günde 2 saatin üzeri bu yaşta önerilmez."}{" "}
								Yine de kaydedebilirsiniz.
							</p>
						)}
					</>
				)}
				<Field
					label="Blok süresi (dk)"
					hint="Kesintisiz dikkatle çalışabildiği süre. 25–30 dk önerilir."
				>
					<TextInput
						inputMode="numeric"
						value={s.blockMinutes}
						onChange={(e) =>
							set({ blockMinutes: Number(e.target.value.replace(/\D/g, "")) })
						}
					/>
				</Field>
				{block.level !== "ok" && (
					<p className="rounded-xl bg-accent px-3 py-2 text-sm">
						Bu blok süresi önerilen aralığın dışında.
					</p>
				)}
				<div>
					<p className="mb-1.5 font-bold text-sm">Çalışma günleri</p>
					<div className="flex flex-wrap gap-2">
						{DAYS.map((label, i) => {
							const day = i + 1;
							const on = s.studyDays.includes(day);
							return (
								<Chip
									key={label}
									active={on}
									onClick={() => {
										const next = on
											? s.studyDays.filter((d) => d !== day)
											: [...s.studyDays, day].sort();
										if (next.length > 0) set({ studyDays: next });
									}}
								>
									{label}
								</Chip>
							);
						})}
					</div>
					{s.studyDays.length >= 7 && (
						<p className="mt-2 text-muted-foreground text-sm">
							Haftada bir gün dinlenme önerilir.
						</p>
					)}
				</div>
				<Field label="Boş kalan zaman">
					<Select
						value={s.idleTime}
						onChange={(e) =>
							set({ idleTime: e.target.value as typeof s.idleTime })
						}
					>
						<option value="review">Tekrar</option>
						<option value="reading">Kitap okuma</option>
						<option value="free">Serbest</option>
					</Select>
				</Field>
			</Section>

			<Section
				title="Dersler ve okulun temposu"
				hint="Okul planın gerisindeyse ya da ilerisindeyse haftayı kaydırın."
			>
				{s.subjects.map((row) => {
					const info = status.data?.find((x) => x.subject === row.subject);
					const current =
						info?.hasCurriculum && info.week
							? `Şu an: ${info.week.number}. hafta · ${info.week.unitTitles.join(", ")}`
							: info?.hasCurriculum && info.onBreak
								? `Tatil: ${info.onBreak}`
								: "Müfredat verisi yok";
					const patch = (p: Partial<typeof row>) =>
						set({
							subjects: s.subjects.map((x) =>
								x.subject === row.subject ? { ...x, ...p } : x,
							),
						});
					return (
						<div key={row.subject} className="rounded-2xl border p-3">
							<label className="flex min-h-11 items-center gap-3 font-bold">
								<input
									type="checkbox"
									className="size-5"
									checked={row.enabled}
									onChange={(e) => patch({ enabled: e.target.checked })}
								/>
								{SUBJECTS[row.subject].label}
							</label>
							<p className="mt-1 text-muted-foreground text-xs">{current}</p>
							<div className="mt-2 flex items-center gap-2">
								<span className="text-sm">Okul bizden</span>
								<GhostButton
									aria-label="Bir hafta ileri"
									onClick={() => patch({ weekOffset: row.weekOffset + 1 })}
								>
									+
								</GhostButton>
								<b className="min-w-16 text-center">
									{row.weekOffset === 0
										? "aynı"
										: row.weekOffset > 0
											? `${row.weekOffset} hf geride`
											: `${-row.weekOffset} hf ileride`}
								</b>
								<GhostButton
									aria-label="Bir hafta geri"
									onClick={() => patch({ weekOffset: row.weekOffset - 1 })}
								>
									−
								</GhostButton>
							</div>
						</div>
					);
				})}
			</Section>

			<Section title="Kaynaklar" hint={`${s.sources.length} kaynak seçili`}>
				<Link
					to="/veli/cocuk/$childId/kaynaklar"
					params={{ childId }}
					className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 font-extrabold outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
				>
					<BookOpen aria-hidden className="size-5" />
					Kaynakları seç
				</Link>
			</Section>

			<Section title="Plan">
				<GhostButton
					disabled={rebuild.isPending}
					onClick={() => rebuild.mutate({ childId })}
				>
					Bu haftanın planını yeniden kur
				</GhostButton>
				<ErrorText>
					{rebuild.error ? errorMessage(rebuild.error) : undefined}
				</ErrorText>
			</Section>

			<Section title={`${childName} hesabı`}>
				{username && (
					<p className="text-sm">
						Giriş kullanıcı adı: <b>{username}</b>
					</p>
				)}
				<Field
					label="Yeni şifre"
					hint="En az 6 karakter. Açık oturumlar kapanır."
				>
					<TextInput
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						minLength={6}
					/>
				</Field>
				<GhostButton
					disabled={newPassword.length < 6 || resetPw.isPending}
					onClick={() => resetPw.mutate({ childId, password: newPassword })}
				>
					Şifreyi değiştir
				</GhostButton>
				<ErrorText>
					{resetPw.error ? errorMessage(resetPw.error) : undefined}
				</ErrorText>
				<GhostButton
					disabled={signOutAll.isPending}
					onClick={() => signOutAll.mutate({ childId })}
				>
					Tüm cihazlardaki oturumu kapat
				</GhostButton>
			</Section>

			<Section title="Silme işlemleri" className="border-destructive/30">
				<GhostButton
					className="text-destructive"
					onClick={() => {
						if (
							window.confirm(
								`${childName} ve tüm verileri kalıcı olarak silinecek. Emin misin?`,
							)
						)
							remove.mutate({ childId, confirm: "SİL" });
					}}
				>
					Çocuğu ve verilerini sil
				</GhostButton>
				<GhostButton
					className="text-destructive"
					onClick={() => {
						if (
							window.confirm(
								"Hesabın, çocukların ve tüm verileri kalıcı olarak silinecek. Emin misin?",
							)
						)
							deleteAccount.mutate({ confirm: "SİL" });
					}}
				>
					Hesabımı ve tüm verileri sil
				</GhostButton>
			</Section>

			<SaveBar
				dirty={!!draft}
				pending={update.isPending}
				message={message}
				error={update.error}
				onSave={() => {
					if (!draft) return;
					update.mutate({
						childId,
						dailyBudgetMinutes: draft.dailyBudgetMinutes,
						blockMinutes: draft.blockMinutes,
						studyDays: draft.studyDays,
						idleTime: draft.idleTime,
						subjects: draft.subjects,
					});
				}}
			/>
		</ChildPageShell>
	);
}

/** Kaynak seçimi: ders başına 2-3 kitap. Seçim anında kaydedilir. */
export function ChildSourcesPage({ childId }: { childId: string }) {
	const qc = useQueryClient();
	const settings = useQuery(
		orpc.children.settings.get.queryOptions({ input: { childId } }),
	);
	const books = useQuery(
		orpc.children.books.queryOptions({ input: { childId } }),
	);
	const [saved, setSaved] = useState<string>();
	const [local, setLocal] = useState<string[]>();
	const selected = local ?? settings.data?.sources ?? [];

	const save = useMutation(
		orpc.children.settings.update.mutationOptions({
			onSuccess: async (res) => {
				await qc.invalidateQueries();
				setSaved(
					`Kaydedildi. Yeni seçim ${res.effectiveFrom} haftasından itibaren geçerli.`,
				);
			},
		}),
	);
	const rebuild = useMutation(
		orpc.plan.rebuild.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				setSaved("Bu haftanın planı yeni kaynaklarla yeniden kuruldu.");
			},
		}),
	);

	const toggle = (id: string) => {
		const next = selected.includes(id)
			? selected.filter((x) => x !== id)
			: [...selected, id];
		setLocal(next);
		setSaved(undefined);
		save.mutate({ childId, sources: next });
	};

	return (
		<ChildPageShell childId={childId} active="kaynaklar">
			<p className="text-muted-foreground text-sm">
				Çocuğun kullandığı kitapları seçin. Ders başına 2-3 kaynak yeterli:
				fazlası planı seyreltir. Seçtiğiniz kitaplardaki testler sırayla plana
				girer.
			</p>
			{books.isPending && <p>Yükleniyor…</p>}
			{SUBJECT_ORDER.map((subject) => {
				const list = (books.data ?? []).filter((b) => b.subject === subject);
				const count = list.filter((b) => selected.includes(b.id)).length;
				const meta = SUBJECTS[subject];
				const Icon = meta.icon;
				return (
					<Section
						key={subject}
						title={meta.label}
						icon={
							<span
								className={cn(
									"grid size-10 shrink-0 place-items-center rounded-xl text-white",
									meta.tile,
								)}
							>
								<Icon aria-hidden className="size-5" />
							</span>
						}
						hint={
							list.length === 0
								? "Bu ders için kaynak henüz kütüphanede yok"
								: `${count} seçili`
						}
					>
						{count > SOURCE_SOFT_LIMIT && (
							<p className="rounded-xl bg-accent px-3 py-1.5 text-sm">
								{SOURCE_SOFT_LIMIT}'ten fazla kaynak planı seyreltir.
							</p>
						)}
						{list.length === 0 && (
							<p className="text-muted-foreground text-sm">
								Bu derste yalnızca okul ödevleri plana girer. Kaynak eklendikçe
								buradan seçebilirsiniz.
							</p>
						)}
						<ul className="flex flex-col gap-2">
							{list.map((b) => {
								const on = selected.includes(b.id);
								return (
									<li key={b.id}>
										<button
											type="button"
											aria-pressed={on}
											onClick={() => toggle(b.id)}
											className={cn(
												"flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/40",
												on ? "border-primary bg-primary/5" : "hover:bg-muted",
											)}
										>
											<span
												className={cn(
													"grid size-8 shrink-0 place-items-center rounded-full border-2",
													on
														? "border-transparent bg-primary text-primary-foreground"
														: "border-border text-transparent",
												)}
											>
												<Check className="size-4" strokeWidth={3.2} />
											</span>
											<span className="min-w-0 flex-1">
												<span className="block font-extrabold leading-tight">
													{b.title}
												</span>
												<span className="block text-muted-foreground text-xs">
													{KIND_LABEL[b.kind]} · {b.testCount} test
												</span>
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</Section>
				);
			})}
			<Section title="Plan">
				<p
					role="status"
					className={cn(
						"text-sm",
						save.error
							? "font-semibold text-destructive"
							: "text-muted-foreground",
					)}
				>
					{save.error
						? errorMessage(save.error)
						: (saved ??
							"Seçimler anında kaydedilir. Yeni seçim, işaretlenmiş görev yoksa bu haftanın planına da yansıtılabilir.")}
				</p>
				<GhostButton
					disabled={rebuild.isPending}
					onClick={() => rebuild.mutate({ childId })}
				>
					Bu haftanın planını yeniden kur
				</GhostButton>
				<ErrorText>
					{rebuild.error ? errorMessage(rebuild.error) : undefined}
				</ErrorText>
			</Section>
		</ChildPageShell>
	);
}
