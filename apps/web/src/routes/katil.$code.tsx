import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
	Brand,
	ErrorText,
	errorMessage,
	Field,
	PrimaryButton,
	Select,
} from "@/components/kit";
import { useMe } from "@/lib/me";
import { client, orpc } from "@/utils/orpc";

/** Öğretmen davet bağlantısı: veli çocuğunu çalışma grubuna ekler. */
export const Route = createFileRoute("/katil/$code")({
	beforeLoad: async ({ params }) => {
		const { redirect } = await import("@tanstack/react-router");
		try {
			await client.account.me();
		} catch {
			throw redirect({
				to: "/kayit",
				search: { next: `/katil/${params.code}` },
			});
		}
	},
	component: JoinPage,
});

function JoinPage() {
	const { code } = Route.useParams();
	const me = useMe();
	const preview = useQuery({
		...orpc.groups.preview.queryOptions({ input: { code } }),
		retry: false,
	});
	const [childId, setChildId] = useState<string>();
	const join = useMutation(orpc.groups.join.mutationOptions());
	const children = me.data?.children ?? [];
	const chosen = childId ?? children[0]?.id;

	return (
		<main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-5 px-5 py-10">
			<Brand />
			{preview.isError ? (
				<>
					<h1 className="font-extrabold text-2xl">Davet bulunamadı</h1>
					<p className="text-muted-foreground">
						Bağlantı geçersiz ya da grup kapatılmış olabilir.
					</p>
				</>
			) : me.data?.user.role !== "guardian" ? (
				<p className="text-muted-foreground">
					Bu davet velilere özeldir. Veli hesabıyla giriş yapın.
				</p>
			) : join.isSuccess ? (
				<>
					<h1 className="font-extrabold text-2xl">Katıldı 🎉</h1>
					<p>
						Çocuğunuz <b>{join.data.groupName}</b> grubuna eklendi. Öğretmenin
						verdiği ödevler ödev listesinde görünür.
					</p>
					<Link to="/veli" className="font-bold text-primary">
						Veli paneline git
					</Link>
				</>
			) : (
				<>
					<h1 className="font-extrabold text-2xl">
						{preview.data?.teacherName} sizi davet etti
					</h1>
					<p>
						<b>{preview.data?.groupName}</b> çalışma grubuna çocuğunuzu ekleyin.
						Öğretmen yalnızca ödev tamamlama durumunu ve son deneme netlerini
						görür. Ödev takibi ücretsizdir.
					</p>
					{children.length === 0 ? (
						<Link to="/veli" className="font-bold text-primary">
							Önce çocuğunuzu ekleyin
						</Link>
					) : (
						<>
							<Field label="Hangi çocuk?">
								<Select
									value={chosen}
									onChange={(e) => setChildId(e.target.value)}
								>
									{children.map((c) => (
										<option key={c.id} value={c.id}>
											{c.displayName}
										</option>
									))}
								</Select>
							</Field>
							<ErrorText>
								{join.error ? errorMessage(join.error) : undefined}
							</ErrorText>
							<PrimaryButton
								disabled={!chosen || join.isPending}
								onClick={() => chosen && join.mutate({ code, childId: chosen })}
							>
								Gruba katıl
							</PrimaryButton>
						</>
					)}
				</>
			)}
		</main>
	);
}
