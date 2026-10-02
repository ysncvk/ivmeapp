import {
	checkBlockMinutes,
	checkDailyBudget,
	type Subject,
} from "@ivmeapp/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	Chip,
	ErrorText,
	errorMessage,
	Field,
	GhostButton,
	Modal,
	PrimaryButton,
	Select,
	TextInput,
} from "@/components/kit";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";

const SUBJECT_KEYS = Object.keys(SUBJECTS) as Subject[];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/** Hukuk incelemesi tamamlanana kadar taslak metin (docs/hukuk-sorulari.md). */
export const CONSENT_VERSION = "taslak-1";

export function ConsentDialog({
	onClose,
	onAccepted,
}: {
	onClose: () => void;
	onAccepted: () => void;
}) {
	const [checked, setChecked] = useState(false);
	const mutation = useMutation(
		orpc.account.acceptConsent.mutationOptions({
			onSuccess: onAccepted,
		}),
	);
	const accept = async () => {
		await mutation.mutateAsync({
			kind: "privacy_notice",
			version: CONSENT_VERSION,
		});
		await mutation.mutateAsync({
			kind: "parental_consent",
			version: CONSENT_VERSION,
		});
	};
	return (
		<Modal title="Açık rıza ve aydınlatma" onClose={onClose}>
			<p className="text-sm leading-relaxed">
				İvme, çocuğunuzun adını, çalışma planını, ödev ve deneme sonuçlarını
				yalnızca çalışma planı ve ödev takibi için işler. Çocuktan e-posta,
				kimlik numarası ya da doğum tarihi istenmez. Verileri istediğiniz an
				hesabınızı silerek kaldırabilirsiniz. Öğretmen yalnızca ödev tamamlama
				durumunu ve son deneme netlerini görür.
			</p>
			<p className="rounded-xl bg-muted px-3 py-2 text-muted-foreground text-xs">
				Bu metin taslaktır; yayına çıkmadan önce hukuki inceleme gerekir.
			</p>
			<label className="flex items-start gap-3 text-sm">
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => setChecked(e.target.checked)}
					className="mt-1 size-5"
				/>
				<span>
					Veli olarak çocuğum adına bu verilerin işlenmesine açık rıza
					veriyorum.
				</span>
			</label>
			<ErrorText>
				{mutation.error ? errorMessage(mutation.error) : undefined}
			</ErrorText>
			<PrimaryButton disabled={!checked || mutation.isPending} onClick={accept}>
				Onaylıyorum
			</PrimaryButton>
		</Modal>
	);
}

export function AddChildDialog({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: (childId: string) => void;
}) {
	const qc = useQueryClient();
	const suggestion = useQuery(orpc.children.suggestUsername.queryOptions());
	const [name, setName] = useState("");
	const [username, setUsername] = useState<string>();
	const [password, setPassword] = useState("");
	const create = useMutation(
		orpc.children.create.mutationOptions({
			onSuccess: async (c) => {
				await qc.invalidateQueries();
				onCreated(c.id);
			},
		}),
	);
	const effectiveUsername = username ?? suggestion.data?.username ?? "";
	return (
		<Modal title="Çocuk ekle" onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					create.mutate({
						displayName: name,
						username: effectiveUsername,
						password,
					});
				}}
			>
				<Field label="Çocuğun adı">
					<TextInput
						value={name}
						onChange={(e) => setName(e.target.value)}
						maxLength={40}
						required
					/>
				</Field>
				<Field
					label="Kullanıcı adı"
					hint="Çocuk bununla giriş yapar. Küçük harf, rakam, nokta, tire."
				>
					<TextInput
						value={effectiveUsername}
						onChange={(e) => setUsername(e.target.value.toLowerCase())}
						autoCapitalize="none"
						required
					/>
				</Field>
				<Field
					label="Şifre"
					hint="En az 6 karakter. Çocuğun hatırlayacağı bir şifre seç."
				>
					<TextInput
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="text"
						minLength={6}
						required
					/>
				</Field>
				<ErrorText>
					{create.error ? errorMessage(create.error) : undefined}
				</ErrorText>
				<PrimaryButton type="submit" disabled={create.isPending}>
					Ekle
				</PrimaryButton>
			</form>
		</Modal>
	);
}

export function HomeworkDialog({
	childId,
	onClose,
}: {
	childId: string;
	onClose: () => void;
}) {
	const qc = useQueryClient();
	const [subject, setSubject] = useState<Subject>("matematik");
	const [title, setTitle] = useState("");
	const [dueDate, setDueDate] = useState("");
	const create = useMutation(
		orpc.homework.create.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				onClose();
			},
		}),
	);
	return (
		<Modal title="Ödev ekle" onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					create.mutate({
						childId,
						subject,
						title,
						dueDate: dueDate || undefined,
					});
				}}
			>
				<Field label="Ders">
					<Select
						value={subject}
						onChange={(e) => setSubject(e.target.value as Subject)}
					>
						{SUBJECT_KEYS.map((s) => (
							<option key={s} value={s}>
								{SUBJECTS[s].label}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Ödev">
					<TextInput
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Örn. s.58 soruları"
						maxLength={120}
						required
					/>
				</Field>
				<Field label="Teslim tarihi (isteğe bağlı)">
					<TextInput
						type="date"
						value={dueDate}
						onChange={(e) => setDueDate(e.target.value)}
					/>
				</Field>
				<ErrorText>
					{create.error ? errorMessage(create.error) : undefined}
				</ErrorText>
				<PrimaryButton type="submit" disabled={create.isPending}>
					Kaydet
				</PrimaryButton>
			</form>
		</Modal>
	);
}

interface ExamRow {
	enabled: boolean;
	questions: string;
	correct: string;
	wrong: string;
}

const DEFAULT_QUESTIONS: Record<Subject, string> = {
	matematik: "20",
	turkce: "20",
	fen: "20",
	sosyal: "10",
	ingilizce: "10",
};

export function ExamDialog({
	childId,
	onClose,
}: {
	childId: string;
	onClose: () => void;
}) {
	const qc = useQueryClient();
	const today = new Date().toLocaleDateString("sv", {
		timeZone: "Europe/Istanbul",
	});
	const [name, setName] = useState("");
	const [date, setDate] = useState(today);
	const [rows, setRows] = useState<Record<Subject, ExamRow>>(
		() =>
			Object.fromEntries(
				SUBJECT_KEYS.map((s) => [
					s,
					{
						enabled: ["matematik", "turkce", "fen"].includes(s),
						questions: DEFAULT_QUESTIONS[s],
						correct: "",
						wrong: "",
					},
				]),
			) as Record<Subject, ExamRow>,
	);
	const [weak, setWeak] = useState<{ subject: Subject; topic: string }[]>([]);
	const [topicSubject, setTopicSubject] = useState<Subject>("matematik");
	const topics = useQuery(
		orpc.exam.topics.queryOptions({
			input: { childId, subject: topicSubject },
		}),
	);
	const create = useMutation(
		orpc.exam.create.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				onClose();
			},
		}),
	);
	const patch = (s: Subject, p: Partial<ExamRow>) =>
		setRows((prev) => ({ ...prev, [s]: { ...prev[s], ...p } }));

	return (
		<Modal title="Deneme ekle" onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					create.mutate({
						childId,
						name,
						date,
						subjects: SUBJECT_KEYS.filter((s) => rows[s].enabled).map((s) => ({
							subject: s,
							questions: Number(rows[s].questions),
							correct: Number(rows[s].correct || 0),
							wrong: Number(rows[s].wrong || 0),
						})),
						weakTopics: weak,
					});
				}}
			>
				<Field label="Deneme adı">
					<TextInput
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Örn. Eylül Denemesi 1"
						required
					/>
				</Field>
				<Field label="Tarih">
					<TextInput
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
					/>
				</Field>
				<div className="flex flex-col gap-2">
					{SUBJECT_KEYS.map((s) => {
						const r = rows[s];
						return (
							<div key={s} className="rounded-2xl border p-3">
								<label className="flex items-center gap-2 font-bold">
									<input
										type="checkbox"
										checked={r.enabled}
										onChange={(e) => patch(s, { enabled: e.target.checked })}
										className="size-5"
									/>
									{SUBJECTS[s].label}
								</label>
								{r.enabled && (
									<div className="mt-2 grid grid-cols-3 gap-2">
										{(
											[
												["questions", "Soru"],
												["correct", "Doğru"],
												["wrong", "Yanlış"],
											] as const
										).map(([key, label]) => (
											<Field key={key} label={label}>
												<TextInput
													inputMode="numeric"
													value={r[key]}
													onChange={(e) =>
														patch(s, {
															[key]: e.target.value.replace(/\D/g, ""),
														})
													}
												/>
											</Field>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="rounded-2xl border p-3">
					<p className="font-bold">Zayıf konular (isteğe bağlı)</p>
					<div className="mt-2 flex gap-2">
						<Select
							value={topicSubject}
							onChange={(e) => setTopicSubject(e.target.value as Subject)}
							aria-label="Ders"
						>
							{SUBJECT_KEYS.map((s) => (
								<option key={s} value={s}>
									{SUBJECTS[s].label}
								</option>
							))}
						</Select>
						<Select
							value=""
							aria-label="Konu ekle"
							onChange={(e) => {
								const topic = e.target.value;
								if (
									topic &&
									!weak.some(
										(w) => w.subject === topicSubject && w.topic === topic,
									)
								)
									setWeak([...weak, { subject: topicSubject, topic }]);
							}}
						>
							<option value="">Konu seç…</option>
							{(topics.data ?? []).map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</Select>
					</div>
					<div className="mt-2 flex flex-wrap gap-2">
						{weak.map((w) => (
							<Chip
								key={`${w.subject}-${w.topic}`}
								active
								onClick={() => setWeak(weak.filter((x) => x !== w))}
								aria-label={`${w.topic} kaldır`}
							>
								{w.topic} ✕
							</Chip>
						))}
					</div>
				</div>
				<ErrorText>
					{create.error ? errorMessage(create.error) : undefined}
				</ErrorText>
				<PrimaryButton type="submit" disabled={create.isPending}>
					Kaydet
				</PrimaryButton>
			</form>
		</Modal>
	);
}

const TIER_META = [
	{
		tier: "daily",
		label: "Günlük ödül",
		hint: "Günün görevlerinin tamamı",
		pct: 100,
	},
	{
		tier: "weekly",
		label: "Haftalık ödül",
		hint: "Haftanın görevlerinin çoğu",
		pct: 80,
	},
	{ tier: "milestone", label: "Büyük ödül", hint: "4 haftalık dönem", pct: 75 },
] as const;

export function RewardsDialog({
	childId,
	onClose,
}: {
	childId: string;
	onClose: () => void;
}) {
	const qc = useQueryClient();
	const current = useQuery(
		orpc.rewards.list.queryOptions({ input: { childId } }),
	);
	const [edits, setEdits] = useState<
		Record<string, { title: string; pct: number } | undefined>
	>({});
	const upsert = useMutation(orpc.rewards.upsert.mutationOptions());
	const remove = useMutation(orpc.rewards.remove.mutationOptions());

	const value = (tier: string, pct: number) => {
		const existing = current.data?.find((r) => r.tier === tier);
		return (
			edits[tier] ?? {
				title: existing?.title ?? "",
				pct: existing ? Math.round(existing.threshold * 100) : pct,
			}
		);
	};
	const save = async () => {
		for (const m of TIER_META) {
			const v = value(m.tier, m.pct);
			const existing = current.data?.find((r) => r.tier === m.tier);
			if (v.title.trim()) {
				await upsert.mutateAsync({
					childId,
					tier: m.tier,
					title: v.title.trim(),
					threshold: v.pct / 100,
				});
			} else if (existing) {
				await remove.mutateAsync({ childId, tier: m.tier });
			}
		}
		await qc.invalidateQueries();
		onClose();
	};
	return (
		<Modal title="Ödülleri düzenle" onClose={onClose}>
			<p className="text-muted-foreground text-sm">
				Ödülü sen seç ve sen ver. Hedef, planın tamamlama oranıdır; doğru sayısı
				ya da süre değil.
			</p>
			{TIER_META.map((m) => {
				const v = value(m.tier, m.pct);
				return (
					<div key={m.tier} className="rounded-2xl border p-3">
						<Field label={m.label} hint={m.hint}>
							<TextInput
								value={v.title}
								maxLength={60}
								placeholder="Boş bırakırsan ödül yok"
								onChange={(e) =>
									setEdits({
										...edits,
										[m.tier]: { ...v, title: e.target.value },
									})
								}
							/>
						</Field>
						<Field label={`Hedef: görevlerin %${v.pct}'i`}>
							<input
								type="range"
								min={50}
								max={100}
								step={5}
								value={v.pct}
								onChange={(e) =>
									setEdits({
										...edits,
										[m.tier]: { ...v, pct: Number(e.target.value) },
									})
								}
							/>
						</Field>
					</div>
				);
			})}
			<ErrorText>
				{upsert.error ? errorMessage(upsert.error) : undefined}
			</ErrorText>
			<PrimaryButton onClick={save} disabled={upsert.isPending}>
				Kaydet
			</PrimaryButton>
		</Modal>
	);
}

export function SettingsDialog({
	childId,
	childName,
	username,
	onClose,
	onChildRemoved,
	onAccountDeleted,
}: {
	childId: string;
	childName: string;
	username: string | null;
	onClose: () => void;
	onChildRemoved: () => void;
	onAccountDeleted: () => void;
}) {
	const qc = useQueryClient();
	const settings = useQuery(
		orpc.children.settings.get.queryOptions({ input: { childId } }),
	);
	const books = useQuery(
		orpc.children.books.queryOptions({ input: { childId } }),
	);
	const status = useQuery(
		orpc.library.curriculumStatus.queryOptions({ input: { childId } }),
	);
	const [draft, setDraft] = useState<NonNullable<typeof settings.data>>();
	const [message, setMessage] = useState<string>();
	const [newPassword, setNewPassword] = useState("");

	const s = draft ?? settings.data;
	const update = useMutation(
		orpc.children.settings.update.mutationOptions({
			onSuccess: async (res) => {
				await qc.invalidateQueries();
				setMessage(
					`Kaydedildi. Yeni ayarlar ${res.effectiveFrom} haftasından itibaren geçerli.`,
				);
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
	const rebuild = useMutation(
		orpc.plan.rebuild.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				setMessage("Bu haftanın planı yeni ayarlarla yeniden kuruldu.");
			},
		}),
	);
	const remove = useMutation(
		orpc.children.remove.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				onChildRemoved();
			},
		}),
	);

	const deleteAccount = useMutation(
		orpc.account.deleteAccount.mutationOptions({ onSuccess: onAccountDeleted }),
	);

	if (!s) {
		return (
			<Modal title="Ayarlar" onClose={onClose}>
				<p>Yükleniyor…</p>
			</Modal>
		);
	}
	const set = (p: Partial<typeof s>) => setDraft({ ...s, ...p });
	const budget = checkDailyBudget(s.dailyBudgetMinutes);
	const block = checkBlockMinutes(s.blockMinutes);

	return (
		<Modal title={`${childName} · Ayarlar`} onClose={onClose}>
			{username && (
				<p className="text-sm">
					Giriş kullanıcı adı: <b>{username}</b>
				</p>
			)}

			<section className="flex flex-col gap-3">
				<h3 className="font-extrabold">Çalışma düzeni</h3>
				<Field label="Günlük süre (dk)">
					<TextInput
						inputMode="numeric"
						value={s.dailyBudgetMinutes}
						onChange={(e) =>
							set({
								dailyBudgetMinutes: Number(e.target.value.replace(/\D/g, "")),
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
				<Field
					label="Blok süresi (dk)"
					hint="Kesintisiz çalışma. 25–30 dk önerilir."
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
			</section>

			<section className="flex flex-col gap-3">
				<h3 className="font-extrabold">Dersler ve okulun temposu</h3>
				{s.subjects.map((row) => {
					const info = status.data?.find((x) => x.subject === row.subject);
					const current =
						info?.hasCurriculum && info.week
							? `Şu an: ${info.week.number}. hafta · ${info.week.unitTitles.join(", ")}`
							: info?.hasCurriculum && info.onBreak
								? `Tatil: ${info.onBreak}`
								: "Müfredat verisi yok";
					return (
						<div key={row.subject} className="rounded-2xl border p-3">
							<label className="flex items-center gap-2 font-bold">
								<input
									type="checkbox"
									className="size-5"
									checked={row.enabled}
									onChange={(e) =>
										set({
											subjects: s.subjects.map((x) =>
												x.subject === row.subject
													? { ...x, enabled: e.target.checked }
													: x,
											),
										})
									}
								/>
								{SUBJECTS[row.subject].label}
							</label>
							<p className="mt-1 text-muted-foreground text-xs">{current}</p>
							<div className="mt-2 flex items-center gap-2">
								<span className="text-sm">Okul bizden</span>
								<GhostButton
									aria-label="Bir hafta ileri"
									onClick={() =>
										set({
											subjects: s.subjects.map((x) =>
												x.subject === row.subject
													? { ...x, weekOffset: x.weekOffset + 1 }
													: x,
											),
										})
									}
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
									onClick={() =>
										set({
											subjects: s.subjects.map((x) =>
												x.subject === row.subject
													? { ...x, weekOffset: x.weekOffset - 1 }
													: x,
											),
										})
									}
								>
									−
								</GhostButton>
							</div>
						</div>
					);
				})}
			</section>

			<section className="flex flex-col gap-2">
				<h3 className="font-extrabold">Kaynaklar</h3>
				{(books.data ?? []).map((b) => (
					<label key={b.id} className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							className="size-5"
							checked={s.sources.includes(b.id)}
							onChange={(e) =>
								set({
									sources: e.target.checked
										? [...s.sources, b.id]
										: s.sources.filter((x) => x !== b.id),
								})
							}
						/>
						<span>
							{b.title}{" "}
							<span className="text-muted-foreground">
								· {SUBJECTS[b.subject].label} · {b.testCount} test
							</span>
						</span>
					</label>
				))}
			</section>

			<ErrorText>
				{update.error ? errorMessage(update.error) : undefined}
			</ErrorText>
			{message && (
				<p role="status" className="font-semibold text-primary text-sm">
					{message}
				</p>
			)}
			<PrimaryButton
				disabled={!draft || update.isPending}
				onClick={() => {
					if (!draft) return;
					update.mutate({
						childId,
						dailyBudgetMinutes: draft.dailyBudgetMinutes,
						blockMinutes: draft.blockMinutes,
						studyDays: draft.studyDays,
						idleTime: draft.idleTime,
						subjects: draft.subjects,
						sources: draft.sources,
					});
				}}
			>
				Kaydet
			</PrimaryButton>
			<GhostButton
				disabled={rebuild.isPending}
				onClick={() => rebuild.mutate({ childId })}
			>
				Bu haftanın planını yeniden kur
			</GhostButton>
			<ErrorText>
				{rebuild.error ? errorMessage(rebuild.error) : undefined}
			</ErrorText>

			<section className="flex flex-col gap-3 border-t pt-4">
				<h3 className="font-extrabold">Hesap</h3>
				<Field label="Yeni şifre (çocuk için)">
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
			</section>
		</Modal>
	);
}
