import { Brand, PrimaryButton } from "@/components/kit";

/**
 * ADR-0012: çocuk ilk girişte yaşa uygun, sade bir aydınlatma görür. Metin taslaktır, yayından önce
 * hukuki inceleme gerekir (docs/hukuk-sorulari.md).
 */
export function ChildNotice({
	name,
	onAccept,
	pending,
}: {
	name: string;
	onAccept: () => void;
	pending?: boolean;
}) {
	return (
		<div className="min-h-svh bg-[radial-gradient(60rem_40rem_at_50%_-10%,color-mix(in_oklch,var(--ivme-violet)_16%,transparent),transparent)]">
			<main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-8 pb-16 sm:max-w-xl">
				<Brand />
				<h1 className="font-extrabold text-3xl leading-tight">
					Merhaba {name}! Başlamadan önce kısa bir bilgi
				</h1>
				<ul className="flex flex-col gap-3">
					{ITEMS.map((i) => (
						<li
							key={i.title}
							className="flex items-start gap-3 rounded-3xl border bg-card p-4 shadow-sm"
						>
							<span aria-hidden className="text-3xl leading-none">
								{i.icon}
							</span>
							<span>
								<span className="block font-extrabold">{i.title}</span>
								<span className="block text-muted-foreground text-sm">
									{i.text}
								</span>
							</span>
						</li>
					))}
				</ul>
				<PrimaryButton onClick={onAccept} disabled={pending}>
					Anladım, başlayalım
				</PrimaryButton>
				<p className="text-center text-muted-foreground text-xs">
					Bir şey anlamadıysan velinle konuş.
				</p>
			</main>
		</div>
	);
}

const ITEMS = [
	{
		icon: "📒",
		title: "Neyi kaydediyoruz?",
		text: "Adını, çözdüğün soru sayısını ve işaretlediğin görevleri. Başka bilgin istenmez.",
	},
	{
		icon: "👪",
		title: "Kimler görebilir?",
		text: "Sen, ailen ve varsa öğretmenin. Öğretmenin yalnızca ödevi yapıp yapmadığını ve deneme sonuçlarını görür.",
	},
	{
		icon: "🔒",
		title: "Başkasına verir miyiz?",
		text: "Hayır. Reklam göstermeyiz ve bilgilerini başkalarıyla paylaşmayız.",
	},
	{
		icon: "🗑️",
		title: "Silinir mi?",
		text: "Velin hesabı silerse senin bilgilerin de silinir.",
	},
] as const;
