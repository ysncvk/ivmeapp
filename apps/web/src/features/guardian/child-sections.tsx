import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	ErrorText,
	errorMessage,
	Field,
	GhostButton,
	PrimaryButton,
	Select,
	TextInput,
} from "@/components/kit";
import { useMe } from "@/lib/me";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";
import { CONSENT_VERSION } from "./dialogs";

const dateFmt = new Intl.DateTimeFormat("tr-TR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", {
	day: "numeric",
	month: "long",
	hour: "2-digit",
	minute: "2-digit",
});

/** ADR-0014: abonelik durumu, kartsız deneme ve iptal. Ödev takibi ve soru hedefi her zaman ücretsiz. */
export function SubscriptionSection({ childId }: { childId: string }) {
	const qc = useQueryClient();
	const status = useQuery(
		orpc.subscription.status.queryOptions({ input: { childId } }),
	);
	const refresh = () => qc.invalidateQueries();
	const start = useMutation(
		orpc.subscription.startTrial.mutationOptions({ onSuccess: refresh }),
	);
	const cancel = useMutation(
		orpc.subscription.cancel.mutationOptions({ onSuccess: refresh }),
	);
	const s = status.data;
	if (!s) return <p className="text-muted-foreground text-sm">Yükleniyor…</p>;

	let text: string;
	if (s.status === "trial") {
		text = `Deneme sürüyor${s.trialEndsAt ? `, ${dateFmt.format(s.trialEndsAt)} tarihine kadar` : ""}. Kart bilgisi alınmadı, deneme kendiliğinden ücretlendirmeye dönmez.`;
	} else if (s.status === "active") {
		text = `Bireysel Koçluk aktif${s.currentPeriodEnd ? `, ${dateFmt.format(s.currentPeriodEnd)} tarihine kadar` : ""}.`;
	} else if (s.status === "canceled") {
		text = `İptal edildi.${s.currentPeriodEnd ? ` Erişim ${dateFmt.format(s.currentPeriodEnd)} tarihine kadar sürer.` : ""}${s.retainUntil ? ` Plan ayarlarınız ve geçmişiniz ${dateFmt.format(s.retainUntil)} tarihine kadar saklanır; o tarihe kadar yeniden abone olursanız kaldığınız yerden devam edersiniz.` : ""}`;
	} else {
		text =
			"Bireysel Koçluk açık değil. Soru hedefi, ödev takibi ve raporlar her zaman ücretsizdir.";
	}
	return (
		<>
			<p className="text-sm leading-relaxed">{text}</p>
			{s.canStartTrial && (
				<PrimaryButton
					disabled={start.isPending}
					onClick={() => start.mutate({ childId })}
				>
					Bireysel Koçluk'u bir hafta dene
				</PrimaryButton>
			)}
			{(s.status === "trial" || s.status === "active") && (
				<GhostButton
					disabled={cancel.isPending}
					onClick={() => {
						if (
							window.confirm(
								"Abonelik iptal edilsin mi? Erişim ödenmiş dönemin sonunda biter; plan ayarlarınız ve geçmişiniz 6 ay saklanır. Soru hedefi ve ödev takibi ücretsiz sürer.",
							)
						)
							cancel.mutate({ childId });
					}}
				>
					Aboneliği iptal et
				</GhostButton>
			)}
			<ErrorText>
				{start.error
					? errorMessage(start.error)
					: cancel.error
						? errorMessage(cancel.error)
						: undefined}
			</ErrorText>
		</>
	);
}

/** ADR-0012: veli çocuğu çalışma grubundan çıkarabilir; öğretmen o andan sonra görmez. */
export function GroupsSection({ childId }: { childId: string }) {
	const qc = useQueryClient();
	const groups = useQuery(
		orpc.groups.forChild.queryOptions({ input: { childId } }),
	);
	const leave = useMutation(
		orpc.groups.leave.mutationOptions({
			onSuccess: () => qc.invalidateQueries(),
		}),
	);
	if (!groups.data)
		return <p className="text-muted-foreground text-sm">Yükleniyor…</p>;
	if (groups.data.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				Çocuk hiçbir çalışma grubunda değil. Öğretmeninizin gönderdiği davet
				bağlantısını açarak katılabilirsiniz.
			</p>
		);
	}
	return (
		<>
			<p className="text-muted-foreground text-sm">
				Gruptaki öğretmen yalnızca ödev tamamlama durumunu ve deneme netlerini
				görür; plan görevlerini, ayarları ve aboneliği göremez.
			</p>
			<ul className="flex flex-col gap-2">
				{groups.data.map((g) => (
					<li
						key={g.groupId}
						className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2"
					>
						<span className="min-w-0 truncate font-bold">{g.name}</span>
						<GhostButton
							disabled={leave.isPending}
							onClick={() => {
								if (
									window.confirm(
										`Çocuk "${g.name}" grubundan çıkarılsın mı? Öğretmen artık verilerini göremez.`,
									)
								)
									leave.mutate({ childId, groupId: g.groupId });
							}}
						>
							Gruptan çıkar
						</GhostButton>
					</li>
				))}
			</ul>
		</>
	);
}

const ACTION_LABEL: Record<string, string> = {
	teacher_view_roster: "Grup listesinde ödev ve deneme özetine baktı",
	teacher_view_assignment_status: "Ödev durumuna baktı",
};
const ROLE_LABEL: Record<string, string> = {
	teacher: "Öğretmen",
	admin: "Yönetici",
};

/** ADR-0010 erişim şeffaflığı: çocuğun verisine kimler baktı. Kendi (veli/çocuk) erişimleri kaydedilmez. */
export function AccessLogSection({ childId }: { childId: string }) {
	const log = useQuery(
		orpc.children.accessLog.queryOptions({ input: { childId } }),
	);
	if (!log.data)
		return <p className="text-muted-foreground text-sm">Yükleniyor…</p>;
	if (log.data.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				Henüz kimse çocuğun verisine bakmadı.
			</p>
		);
	}
	return (
		<ul className="flex flex-col gap-2">
			{log.data.slice(0, 10).map((l) => (
				<li
					key={`${l.createdAt.toString()}-${l.action}-${l.actorName}`}
					className="rounded-2xl border px-3 py-2 text-sm"
				>
					<b>
						{ROLE_LABEL[l.actorRole] ?? l.actorRole}
						{l.actorName ? ` (${l.actorName})` : ""}
					</b>
					<span className="block text-muted-foreground">
						{ACTION_LABEL[l.action] ?? l.action} ·{" "}
						{dateTimeFmt.format(l.createdAt)}
					</span>
				</li>
			))}
		</ul>
	);
}

/** ADR-0014 madde 8: pazarlama bildirimi ayrı, isteğe bağlı ve geri alınabilir onaydır. */
export function NotificationSection() {
	const qc = useQueryClient();
	const me = useMe();
	const on = !!me.data?.consents.some((c) => c.kind === "marketing");
	const accept = useMutation(
		orpc.account.acceptConsent.mutationOptions({
			onSuccess: () => qc.invalidateQueries({ queryKey: orpc.account.key() }),
		}),
	);
	const revoke = useMutation(
		orpc.account.revokeMarketing.mutationOptions({
			onSuccess: () => qc.invalidateQueries({ queryKey: orpc.account.key() }),
		}),
	);
	return (
		<label className="flex min-h-12 items-start gap-3 text-sm">
			<input
				type="checkbox"
				className="mt-1 size-5"
				checked={on}
				disabled={accept.isPending || revoke.isPending || me.isPending}
				onChange={(e) =>
					e.target.checked
						? accept.mutate({ kind: "marketing", version: CONSENT_VERSION })
						: revoke.mutate()
				}
			/>
			<span>
				İvme'den haber ve kampanya iletileri almak istiyorum. Bu, hizmetin şartı
				değildir; istediğin an kapatabilirsin.
			</span>
		</label>
	);
}

/** ADR-0004: listede olmayan kaynak için talep; talebe göre kütüphane büyür. */
export function BookRequestSection() {
	const [title, setTitle] = useState("");
	const [subject, setSubject] = useState("");
	const [note, setNote] = useState("");
	const [sent, setSent] = useState(false);
	const send = useMutation(
		orpc.library.requestBook.mutationOptions({
			onSuccess: () => {
				setSent(true);
				setTitle("");
				setNote("");
				setSubject("");
			},
		}),
	);
	return (
		<>
			<p className="text-muted-foreground text-sm">
				Listede olmayan bir kitap mı kullanıyorsunuz? Adını yazın; çok istenen
				kaynakları sırayla kütüphaneye ekleriz.
			</p>
			<Field label="Kitabın adı">
				<TextInput
					value={title}
					maxLength={120}
					placeholder="Örn. Yeni Nesil Fen Bilimleri 6 Soru Bankası"
					onChange={(e) => {
						setSent(false);
						setTitle(e.target.value);
					}}
				/>
			</Field>
			<Field label="Ders (isteğe bağlı)">
				<Select value={subject} onChange={(e) => setSubject(e.target.value)}>
					<option value="">Seçiniz</option>
					{(Object.keys(SUBJECTS) as (keyof typeof SUBJECTS)[]).map((s) => (
						<option key={s} value={s}>
							{SUBJECTS[s].label}
						</option>
					))}
				</Select>
			</Field>
			<Field label="Not (isteğe bağlı)">
				<TextInput
					value={note}
					maxLength={300}
					onChange={(e) => setNote(e.target.value)}
				/>
			</Field>
			{sent && (
				<p role="status" className="font-semibold text-primary text-sm">
					İsteğiniz alındı, teşekkürler.
				</p>
			)}
			<ErrorText>
				{send.error
					? send.error.message === "too_many_requests"
						? "Çok fazla istek gönderdiniz."
						: errorMessage(send.error)
					: undefined}
			</ErrorText>
			<PrimaryButton
				disabled={title.trim().length < 2 || send.isPending}
				onClick={() =>
					send.mutate({
						title,
						subject: (subject || undefined) as
							| keyof typeof SUBJECTS
							| undefined,
						note: note || undefined,
					})
				}
			>
				İstek gönder
			</PrimaryButton>
		</>
	);
}
