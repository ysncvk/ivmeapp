import { cn } from "@ivmeapp/ui/lib/utils";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

/** Ekranlarda ortak kullanılan, dokunmatik dostu (min 44px) form ve düğme parçaları. */

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-ring/40";

export function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="font-bold text-sm">{label}</span>
			{children}
			{hint && <span className="text-muted-foreground text-xs">{hint}</span>}
		</label>
	);
}

export function TextInput({
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			className={cn(
				"min-h-12 w-full rounded-2xl border bg-background px-4 text-base",
				focus,
				className,
			)}
		/>
	);
}

export function Select({
	className,
	...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			{...props}
			className={cn(
				"min-h-12 w-full rounded-2xl border bg-background px-3 text-base",
				focus,
				className,
			)}
		/>
	);
}

export function PrimaryButton({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			{...props}
			className={cn(
				"inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50",
				focus,
				className,
			)}
		/>
	);
}

export function GhostButton({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			{...props}
			className={cn(
				"inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 font-bold text-sm hover:bg-muted disabled:opacity-50",
				focus,
				className,
			)}
		/>
	);
}

export function Chip({
	active,
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			{...props}
			className={cn(
				"min-h-10 rounded-full px-4 font-bold text-sm transition-colors",
				active
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:text-foreground",
				focus,
				className,
			)}
		/>
	);
}

export function ErrorText({ children }: { children?: ReactNode }) {
	if (!children) return null;
	return (
		<p role="alert" className="font-semibold text-destructive text-sm">
			{children}
		</p>
	);
}

/** Yerel <dialog>: odak yönetimi ve Esc tarayıcıdan gelir. */
export function Modal({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (el && !el.open) el.showModal();
	}, []);
	return (
		<dialog
			ref={ref}
			onClose={onClose}
			onClick={(e) => {
				if (e.target === ref.current) onClose();
			}}
			className="m-auto max-h-[92svh] w-[min(36rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50"
		>
			<div className="flex items-center justify-between gap-3 border-b px-5 py-4">
				<h2 className="font-extrabold text-xl">{title}</h2>
				<button
					type="button"
					aria-label="Kapat"
					onClick={onClose}
					className={cn("grid size-10 place-items-center rounded-full", focus)}
				>
					<X className="size-5" />
				</button>
			</div>
			<div className="flex flex-col gap-4 p-5">{children}</div>
		</dialog>
	);
}

export function errorMessage(error: unknown): string {
	const m = (error as { message?: string } | null)?.message;
	const map: Record<string, string> = {
		consent_required: "Önce açık rızayı onaylamalısınız.",
		trial_already_used: "Deneme bu çocuk için daha önce kullanıldı.",
		has_progress: "Bu haftada işaretlenmiş görev var, plan yeniden kurulamaz.",
		no_capacity: "Hedef günde yer yok.",
		not_unlocked: "Hedefe henüz ulaşılmadı.",
		plan_locked: "Bu özellik için Bireysel Koçluk gerekir.",
	};
	return (m && map[m]) || m || "Bir sorun oluştu, tekrar dene.";
}

export function Brand({ sub }: { sub?: string }) {
	return (
		<div className="flex items-center gap-2.5">
			<div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-ivme-orange to-ivme-orange-deep font-extrabold text-white">
				İ
			</div>
			<div className="leading-tight">
				<p className="font-extrabold text-lg">İvme</p>
				{sub && (
					<p className="font-semibold text-muted-foreground text-xs">{sub}</p>
				)}
			</div>
		</div>
	);
}
