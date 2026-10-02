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

export const Route = createFileRoute("/giris")({
	validateSearch: (s: Record<string, unknown>) => ({
		next: typeof s.next === "string" ? s.next : undefined,
	}),
	component: LoginPage,
});

function LoginPage() {
	const { next } = Route.useSearch();
	const navigate = useNavigate();
	const [who, setWho] = useState<"student" | "adult">("adult");
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string>();
	const [busy, setBusy] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(undefined);
		setBusy(true);
		try {
			const res =
				who === "student"
					? await authClient.signIn.username({
							username: id.trim().toLowerCase(),
							password,
						})
					: await authClient.signIn.email({ email: id.trim(), password });
			if (res.error) {
				setError(
					who === "student"
						? "Kullanıcı adı ya da şifre yanlış."
						: "E-posta ya da şifre yanlış.",
				);
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
			<h1 className="font-extrabold text-3xl">Giriş yap</h1>
			<div className="flex gap-2" role="group" aria-label="Kim giriyor?">
				<Chip active={who === "adult"} onClick={() => setWho("adult")}>
					Veli / Öğretmen
				</Chip>
				<Chip active={who === "student"} onClick={() => setWho("student")}>
					Öğrenci
				</Chip>
			</div>
			<form onSubmit={submit} className="flex flex-col gap-4">
				<Field label={who === "student" ? "Kullanıcı adı" : "E-posta"}>
					<TextInput
						value={id}
						onChange={(e) => setId(e.target.value)}
						type={who === "student" ? "text" : "email"}
						autoComplete={who === "student" ? "username" : "email"}
						autoCapitalize="none"
						required
					/>
				</Field>
				<Field label="Şifre">
					<TextInput
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						autoComplete="current-password"
						required
					/>
				</Field>
				<ErrorText>{error}</ErrorText>
				<PrimaryButton type="submit" disabled={busy}>
					{busy ? "Giriş yapılıyor…" : "Giriş yap"}
				</PrimaryButton>
			</form>
			{who === "adult" ? (
				<p className="text-center text-muted-foreground text-sm">
					Hesabın yok mu?{" "}
					<Link
						to="/kayit"
						search={{ next }}
						className="font-bold text-primary"
					>
						Kayıt ol
					</Link>
				</p>
			) : (
				<p className="text-center text-muted-foreground text-sm">
					Şifreni unuttuysan velinden yenilemesini iste.
				</p>
			)}
		</main>
	);
}
