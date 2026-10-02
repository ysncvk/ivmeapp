import type { Subject } from "@ivmeapp/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, LogOut, Plus, X } from "lucide-react";
import { useState } from "react";
import {
	Brand,
	ErrorText,
	errorMessage,
	Field,
	GhostButton,
	Modal,
	PrimaryButton,
	Select,
	TextInput,
} from "@/components/kit";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { SUBJECTS } from "../student/subjects";

const SUBJECT_KEYS = Object.keys(SUBJECTS) as Subject[];

export function TeacherApp() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const groups = useQuery(orpc.teacher.groups.list.queryOptions());
	const [activeId, setActiveId] = useState<string>();
	const [dialog, setDialog] = useState<"group" | "assignment" | null>(null);
	const list = (groups.data ?? []).filter((g) => !g.archived);
	const id = activeId ?? list[0]?.id;

	return (
		<div className="min-h-svh">
			<header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
				<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
					<Brand sub="Öğretmen paneli" />
					<button
						type="button"
						aria-label="Çıkış yap"
						className="grid size-10 place-items-center rounded-full hover:bg-muted"
						onClick={async () => {
							await authClient.signOut();
							qc.clear();
							navigate({ to: "/giris", search: { next: undefined } });
						}}
					>
						<LogOut className="size-5" />
					</button>
				</div>
			</header>
			<main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pt-5 pb-20">
				<nav aria-label="Gruplar" className="flex flex-wrap items-center gap-2">
					{list.map((g) => (
						<button
							key={g.id}
							type="button"
							aria-pressed={g.id === id}
							onClick={() => setActiveId(g.id)}
							className={`min-h-10 rounded-full px-4 font-bold text-sm ${
								g.id === id
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{g.name} · {g.memberCount}
						</button>
					))}
					<GhostButton onClick={() => setDialog("group")}>
						<Plus className="size-4" /> Yeni grup
					</GhostButton>
				</nav>

				{id ? (
					<GroupPanel
						key={id}
						groupId={id}
						onAssign={() => setDialog("assignment")}
					/>
				) : (
					<section className="rounded-3xl border bg-card p-6 text-center">
						<h2 className="font-extrabold text-xl">İlk çalışma grubunu aç</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Veliler davet bağlantısıyla çocuklarını gruba ekler. Ödev takibi
							velilere ücretsizdir.
						</p>
					</section>
				)}
			</main>
			{dialog === "group" && (
				<GroupDialog
					onClose={() => setDialog(null)}
					onCreated={(gid) => {
						setActiveId(gid);
						setDialog(null);
					}}
				/>
			)}
			{dialog === "assignment" && id && (
				<AssignmentDialog groupId={id} onClose={() => setDialog(null)} />
			)}
		</div>
	);
}

function GroupDialog({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: (id: string) => void;
}) {
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const create = useMutation(
		orpc.teacher.groups.create.mutationOptions({
			onSuccess: async (g) => {
				await qc.invalidateQueries();
				onCreated(g.id);
			},
		}),
	);
	return (
		<Modal title="Yeni çalışma grubu" onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					create.mutate({ name });
				}}
			>
				<Field label="Grup adı">
					<TextInput
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Örn. 6-A Fen"
						required
					/>
				</Field>
				<ErrorText>
					{create.error ? errorMessage(create.error) : undefined}
				</ErrorText>
				<PrimaryButton type="submit" disabled={create.isPending}>
					Oluştur
				</PrimaryButton>
			</form>
		</Modal>
	);
}

function AssignmentDialog({
	groupId,
	onClose,
}: {
	groupId: string;
	onClose: () => void;
}) {
	const qc = useQueryClient();
	const [subject, setSubject] = useState<Subject>("fen");
	const [title, setTitle] = useState("");
	const [dueDate, setDueDate] = useState("");
	const create = useMutation(
		orpc.teacher.assignments.create.mutationOptions({
			onSuccess: async () => {
				await qc.invalidateQueries();
				onClose();
			},
		}),
	);
	return (
		<Modal title="Ödev ver" onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					create.mutate({
						groupId,
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
					Tüm gruba ver
				</PrimaryButton>
			</form>
		</Modal>
	);
}

function GroupPanel({
	groupId,
	onAssign,
}: {
	groupId: string;
	onAssign: () => void;
}) {
	const roster = useQuery(
		orpc.teacher.groups.roster.queryOptions({ input: { groupId } }),
	);
	const invite = useQuery(
		orpc.teacher.groups.invite.queryOptions({ input: { groupId } }),
	);
	const assignments = useQuery(
		orpc.teacher.assignments.list.queryOptions({ input: { groupId } }),
	);
	const [openAssignment, setOpenAssignment] = useState<string>();
	const [copied, setCopied] = useState(false);

	const link = invite.data
		? `${window.location.origin}${invite.data.joinPath}`
		: "";
	const message = invite.data ? `${invite.data.message}${link}` : "";

	return (
		<div className="grid gap-5 md:grid-cols-2 md:items-start">
			<section className="rounded-3xl border bg-card p-5 shadow-sm md:col-span-2">
				<h2 className="font-extrabold text-lg">Veli daveti</h2>
				<p className="mt-1 whitespace-pre-wrap text-muted-foreground text-sm">
					{message}
				</p>
				<GhostButton
					className="mt-3"
					disabled={!message}
					onClick={async () => {
						await navigator.clipboard?.writeText(message);
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					}}
				>
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
					{copied ? "Kopyalandı" : "Mesajı kopyala"}
				</GhostButton>
			</section>

			<section className="rounded-3xl border bg-card p-5 shadow-sm">
				<h2 className="font-extrabold text-lg">Öğrenciler</h2>
				<p className="text-muted-foreground text-sm">
					Ödev tamamlama ve son deneme netleri
				</p>
				{roster.data?.members.length === 0 && (
					<p className="mt-3 text-muted-foreground text-sm">
						Henüz katılan yok. Daveti velilere gönderin.
					</p>
				)}
				<ul className="mt-3 flex flex-col gap-2">
					{roster.data?.members.map((m) => (
						<li key={m.childId} className="rounded-2xl border p-3">
							<div className="flex items-center justify-between gap-2">
								<b>{m.displayName}</b>
								<span className="text-sm">
									{m.homework.done}/{m.homework.total} ödev
									{m.homework.overdue > 0 && (
										<span className="ml-2 font-bold text-destructive">
											{m.homework.overdue} gecikmiş
										</span>
									)}
								</span>
							</div>
							{m.latestExam && (
								<p className="mt-1 text-muted-foreground text-xs">
									{m.latestExam.name}:{" "}
									{m.latestExam.nets
										.map((n) => `${SUBJECTS[n.subject].label} ${n.net}`)
										.join(" · ")}
								</p>
							)}
						</li>
					))}
				</ul>
			</section>

			<section className="rounded-3xl border bg-card p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="font-extrabold text-lg">Ödevler</h2>
					<GhostButton onClick={onAssign}>
						<Plus className="size-4" /> Ödev ver
					</GhostButton>
				</div>
				<ul className="mt-3 flex flex-col gap-2">
					{assignments.data?.map((a) => (
						<li key={a.id} className="rounded-2xl border p-3">
							<button
								type="button"
								className="flex w-full items-center justify-between gap-2 text-left"
								onClick={() =>
									setOpenAssignment(openAssignment === a.id ? undefined : a.id)
								}
							>
								<span>
									<b>{a.title}</b>
									<span className="block text-muted-foreground text-xs">
										{SUBJECTS[a.subject].label}
										{a.dueDate ? ` · ${a.dueDate}` : ""}
									</span>
								</span>
								<span className="font-bold text-sm">
									{a.done}/{a.total}
								</span>
							</button>
							{openAssignment === a.id && <AssignmentStatus id={a.id} />}
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

function AssignmentStatus({ id }: { id: string }) {
	const status = useQuery(
		orpc.teacher.assignments.status.queryOptions({
			input: { assignmentId: id },
		}),
	);
	return (
		<ul className="mt-2 flex flex-wrap gap-1.5">
			{status.data?.children.map((c) => (
				<li
					key={c.childId}
					className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold text-xs ${
						c.done
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground"
					}`}
				>
					{c.done ? <Check className="size-3" /> : <X className="size-3" />}
					{c.displayName}
				</li>
			))}
		</ul>
	);
}
