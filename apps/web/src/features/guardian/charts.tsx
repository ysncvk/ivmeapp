import type { SubjectResult } from "@ivmeapp/core";
import { cn } from "@ivmeapp/ui/lib/utils";

import { SUBJECTS } from "../student/subjects";
import type { DayStat } from "./mock";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

/**
 * Gün bazlı tamamlama sütunları: tek ton (büyüklük), değer sütunun üstünde metinle.
 * Sütun kalınlığı 24px'i geçmez, veri ucu 4px yuvarlak, taban düz.
 */
export function DayColumns({ days }: { days: DayStat[] }) {
	const summary = days.map((d) => `${d.label} ${d.done}/${d.total}`).join(", ");
	return (
		<figure aria-label={`Günlük tamamlama: ${summary}`} className="mt-5">
			<div className="grid grid-cols-6 gap-2">
				{days.map((d) => {
					const ratio = d.total === 0 ? 0 : d.done / d.total;
					const future = d.state === "future";
					return (
						<div key={d.label} className="flex flex-col items-center gap-1.5">
							<span
								className={cn(
									"font-bold text-xs tabular-nums",
									future ? "text-muted-foreground/70" : "text-foreground",
								)}
							>
								{future ? "·" : `${d.done}/${d.total}`}
							</span>
							<div className="relative flex h-24 w-6 items-end overflow-hidden rounded-t-[4px] bg-muted">
								<div
									className="w-full rounded-t-[4px] bg-primary transition-[height] duration-500"
									style={{ height: `${ratio * 100}%` }}
								/>
							</div>
							<span
								className={cn(
									"text-xs",
									d.state === "today"
										? "font-extrabold text-foreground"
										: "font-semibold text-muted-foreground",
								)}
							>
								{d.label}
							</span>
							{d.state === "today" && (
								<span className="-mt-1 font-bold text-[0.6rem] text-ivme-orange-deep">
									Bugün
								</span>
							)}
						</div>
					);
				})}
			</div>
		</figure>
	);
}

const SEGMENTS = [
	{ key: "correct", label: "Doğru", cls: "bg-primary" },
	{ key: "wrong", label: "Yanlış", cls: "bg-ivme-orange" },
	{ key: "blank", label: "Boş", cls: "bg-muted-foreground/30" },
] as const;

/**
 * Ders bazında doğru/yanlış/boş: yığılmış yatay çubuk, segmentler arası 2px boşluk.
 * Her değer çubuğun altındaki metinde yazılıdır, renk tek başına taşıyıcı değildir.
 */
export function ResultBars({ subjects }: { subjects: SubjectResult[] }) {
	return (
		<figure
			aria-label="Ders bazında doğru, yanlış ve boş sayıları"
			className="mt-4"
		>
			<ul className="flex flex-col gap-4">
				{subjects.map((s) => (
					<li key={s.subject}>
						<div className="flex items-baseline justify-between gap-3">
							<span className="font-bold text-sm">
								{SUBJECTS[s.subject].label}
							</span>
							<span className="font-extrabold text-sm tabular-nums">
								{nf.format(s.net)} net
							</span>
						</div>
						<div className="mt-1.5 flex h-4 gap-0.5">
							{SEGMENTS.map((seg, i) => {
								const n = s[seg.key];
								if (n === 0) return null;
								return (
									<div
										key={seg.key}
										title={`${seg.label}: ${n}`}
										className={cn(
											"h-full",
											seg.cls,
											i === 0 && "rounded-l-[4px]",
											"last:rounded-r-[4px]",
										)}
										style={{ flexGrow: n, flexBasis: 0 }}
									/>
								);
							})}
						</div>
						<p className="mt-1 text-muted-foreground text-xs tabular-nums">
							{s.correct} doğru · {s.wrong} yanlış · {s.blank} boş
						</p>
					</li>
				))}
			</ul>
			<figcaption className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
				{SEGMENTS.map((seg) => (
					<span key={seg.key} className="inline-flex items-center gap-1.5">
						<span className={cn("size-2.5 rounded-sm", seg.cls)} />
						{seg.label}
					</span>
				))}
			</figcaption>
		</figure>
	);
}
