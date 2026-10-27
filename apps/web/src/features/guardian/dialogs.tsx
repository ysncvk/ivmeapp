import type { Subject } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	Chip,
	ErrorText,
	errorMessage,
	Field,
	Modal,
	PrimaryButton,
	Select,
	TextInput,
} from "@/components/kit";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";

const SUBJECT_KEYS = Object.keys(SUBJECTS) as Subject[];
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
		ideas: ["30 dk ekstra oyun", "Sevdiği tatlı", "Akşam film izlemek"],
	},
	{
		tier: "weekly",
		label: "Haftalık ödül",
		hint: "Haftanın görevlerinin çoğu",
		pct: 80,
		ideas: [
			"Sevdiği menüde yemek",
			"Parkta ekstra saat",
			"Arkadaşıyla buluşmak",
		],
	},
	{
		tier: "milestone",
		label: "Büyük ödül",
		hint: "4 haftalık dönem",
		pct: 75,
		ideas: ["Sinema ya da maç", "Bisiklet gezisi", "Bir gün dilediği gezi"],
	},
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
				Ödülü sen seç ve sen ver. Hedef, görevlerin tamamlanma oranıdır; doğru
				sayısı ya da süre değil.
			</p>
			<ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
				<li>
					Ödül metnine çocuğu tanımlayan bilgi (soyadı, okul, adres) yazmayın.
				</li>
				<li>
					Küçük ve sık ödüller, büyük ve seyrek ödüllerden daha iyi çalışır.
					Ödülü kutlama olarak sunun, bir kez verdiğiniz ödülü geri almayın.
				</li>
			</ul>
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
						<div className="mt-2 flex flex-wrap gap-2">
							{m.ideas.map((idea) => (
								<Chip
									key={idea}
									active={v.title === idea}
									onClick={() =>
										setEdits({ ...edits, [m.tier]: { ...v, title: idea } })
									}
								>
									{idea}
								</Chip>
							))}
						</div>

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

const GOAL_STEP = 10;

/** Basit mod: ders başına günlük soru hedefi. 0 = o derste hedef yok. Sayfada ve pencerede ortak. */
export function QuestionGoalsEditor({
	childId,
	onSaved,
}: {
	childId: string;
	onSaved?: () => void;
}) {
	const qc = useQueryClient();
	const current = useQuery(
		orpc.questions.overview.queryOptions({ input: { childId } }),
	);
	const [edits, setEdits] = useState<Partial<Record<Subject, number>>>({});
	const save = useMutation(
		orpc.questions.setGoals.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				setEdits({});
				onSaved?.();
			},
		}),
	);
	const value = (s: Subject) =>
		edits[s] ?? current.data?.subjects.find((x) => x.subject === s)?.goal ?? 0;
	const setValue = (s: Subject, n: number) =>
		setEdits({ ...edits, [s]: Math.min(500, Math.max(0, n)) });
	return (
		<>
			<p className="text-muted-foreground text-sm">
				0 bıraktığın ders çocuğun ekranında görünmez. Çalışma günleri çocuk
				ayarlarındaki günlerdir.
			</p>
			<ul className="flex flex-col gap-2">
				{(Object.keys(SUBJECTS) as Subject[]).map((s) => {
					const meta = SUBJECTS[s];
					const Icon = meta.icon;
					const v = value(s);
					return (
						<li
							key={s}
							className="flex items-center gap-2 rounded-2xl border p-2 pl-3"
						>
							<span
								className={cn(
									"grid size-9 shrink-0 place-items-center rounded-xl text-white",
									meta.tile,
								)}
							>
								<Icon aria-hidden className="size-5" />
							</span>
							<span className="min-w-0 flex-1 truncate font-bold text-sm">
								{meta.label}
							</span>
							<button
								type="button"
								aria-label={`${meta.label} hedefini azalt`}
								disabled={v === 0}
								onClick={() => setValue(s, v - GOAL_STEP)}
								className="grid size-11 shrink-0 place-items-center rounded-full border font-extrabold text-lg outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-40"
							>
								−
							</button>
							<input
								type="number"
								inputMode="numeric"
								min={0}
								max={500}
								aria-label={`${meta.label} günlük soru hedefi`}
								value={v}
								onChange={(e) => setValue(s, Number(e.target.value) || 0)}
								className="h-11 w-16 shrink-0 rounded-xl border bg-background text-center font-extrabold text-base outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
							/>
							<button
								type="button"
								aria-label={`${meta.label} hedefini artır`}
								onClick={() => setValue(s, v + GOAL_STEP)}
								className="grid size-11 shrink-0 place-items-center rounded-full border font-extrabold text-lg outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
							>
								+
							</button>
						</li>
					);
				})}
			</ul>
			<ErrorText>
				{save.isError ? errorMessage(save.error) : undefined}
			</ErrorText>
			<PrimaryButton
				disabled={
					save.isPending || current.isPending || Object.keys(edits).length === 0
				}
				onClick={() =>
					save.mutate({
						childId,
						goals: (Object.keys(SUBJECTS) as Subject[]).map((s) => ({
							subject: s,
							questions: value(s),
						})),
					})
				}
			>
				Hedefleri kaydet
			</PrimaryButton>
		</>
	);
}

export function QuestionGoalsDialog({
	childId,
	onClose,
}: {
	childId: string;
	onClose: () => void;
}) {
	return (
		<Modal title="Günlük soru hedefi" onClose={onClose}>
			<QuestionGoalsEditor childId={childId} onSaved={onClose} />
		</Modal>
	);
}
