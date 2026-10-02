import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
	Brand,
	Chip,
	ErrorText,
	Field,
	PrimaryButton,
	TextInput,
} from "@/components/kit";
import { authClient } from "@/lib/auth-client";
import { roleHome } from "@/lib/me";
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/kayit")({
	validateSearch: (s: Record<string, unknown>) => ({
		next: typeof s.next === "string" ? s.next : undefined,
	}),
	component: RegisterPage,
});

function RegisterPage() {
	const { next } = Route.useSearch();
	const navigate = useNavigate();
	const [role, setRole] = useState<"guardian" | "teacher">("guardian");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string>();
	const [busy, setBusy] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(undefined);
		if (password.length < 8) {
			setError("Şifre en az 8 karakter olmalı.");
			return;
		}
		setBusy(true);
		try {
			const res = await authClient.signUp.email({
				name: name.trim(),
				email: email.trim(),
				password,
				role,
			} as Parameters<typeof authClient.signUp.email>[0]);
			if (res.error) {
				setError(res.error.message ?? "Kayıt oluşturulamadı.");
				return;
			}
			await queryClient.invalidateQueries();
			const me = await client.account.me();
			navigate({ to: next ?? roleHome(me.user.role) });
		} finally {
			setBusy(false);
		}
	}

	return (
		<main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
			<Brand />
			<h1 className="font-extrabold text-3xl">Kayıt ol</h1>
			{/* biome-ignore lint/a11y/useSemanticElements: düğme grubu, fieldset değil */}
			<div className="flex gap-2" role="group" aria-label="Hesap türü">
				<Chip active={role === "guardian"} onClick={() => setRole("guardian")}>
					Veliyim
				</Chip>
				<Chip active={role === "teacher"} onClick={() => setRole("teacher")}>
					Öğretmenim
				</Chip>
			</div>
			<p className="text-muted-foreground text-sm">
				{role === "guardian"
					? "Çocuğun için hesabı sen açarsın; ödev takibi ücretsizdir."
					: "Çalışma grubu açıp öğrencilerine ödev verirsin. Ücretsizdir."}
			</p>
			<form onSubmit={submit} className="flex flex-col gap-4">
				<Field label="Adın">
					<TextInput
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
						required
					/>
				</Field>
				<Field label="E-posta">
					<TextInput
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						autoComplete="email"
						required
					/>
				</Field>
				<Field label="Şifre" hint="En az 8 karakter">
					<TextInput
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						autoComplete="new-password"
						required
					/>
				</Field>
				<ErrorText>{error}</ErrorText>
				<PrimaryButton type="submit" disabled={busy}>
					{busy ? "Kaydediliyor…" : "Hesap oluştur"}
				</PrimaryButton>
			</form>
			<p className="text-center text-muted-foreground text-sm">
				Zaten hesabın var mı?{" "}
				<Link to="/giris" search={{ next }} className="font-bold text-primary">
					Giriş yap
				</Link>
			</p>
		</main>
	);
}
