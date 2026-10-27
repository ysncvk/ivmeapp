import { describe, expect, it } from "vitest";
import { type ReportDay, weekLabel, weekReport } from "./report";

const days = (rows: Partial<ReportDay>[]): ReportDay[] =>
	rows.map((r, i) => ({
		date: `2026-10-${String(5 + i).padStart(2, "0")}`,
		studyDay: i < 6,
		goal: i < 6 ? 80 : 0,
		solved: 0,
		tasksDone: 0,
		tasksTotal: 0,
		...r,
	}));

const base = {
	name: "Deniz",
	weekStart: "2026-10-05",
	today: "2026-10-08",
	subjects: [],
	previousSolved: null,
	homework: { done: 0, open: 0, overdue: 0 },
} as const;

describe("weekReport", () => {
	it("hedefe göre oran ve çalışılan günü hesaplar; bugünden sonrası sayılmaz", () => {
		const r = weekReport({
			...base,
			days: days([
				{ solved: 80 },
				{ solved: 60 },
				{},
				{ solved: 20 },
				{ solved: 999 },
			]),
		});
		// 08 Ekim Perşembe: 4 gün geçti (Pzt-Per), Cuma verisi yok sayılır
		expect(r.studyDaysSoFar).toBe(4);
		expect(r.activeDays).toBe(3);
		expect(r.solved).toBe(160);
		expect(r.goalSoFar).toBe(320);
		expect(r.ratio).toBe(0.5);
		expect(r.level).toBe("starting");
		expect(r.headline).toBe(
			"Deniz bu hafta 3 gün çalıştı (bugüne kadar 4 çalışma günü), 160 soru çözdü.",
		);
		expect(r.lines.join(" ")).toContain("tamamlanma oranı: %50 (160/320 soru)");
	});

	it("hedefte olan hafta için tavsiye metni verir", () => {
		const r = weekReport({
			...base,
			days: days([
				{ solved: 80 },
				{ solved: 80 },
				{ solved: 80 },
				{ solved: 80 },
			]),
		});
		expect(r.level).toBe("on_target");
		expect(r.lines.at(-1)).toContain("Tempo çok iyi");
	});

	it("kayıt yoksa nazik başlık; hedef de görev de yoksa seviye yok", () => {
		const r = weekReport({
			...base,
			days: days([{ goal: 0 }, { goal: 0 }, { goal: 0 }, { goal: 0 }]),
		});
		expect(r.level).toBe("none");
		expect(r.ratio).toBeNull();
		expect(r.headline).toBe("Deniz için bu hafta henüz çalışma kaydı yok.");
	});

	it("önceki hafta, ders kıyası, test, ödev ve deneme satırlarını ekler", () => {
		const r = weekReport({
			...base,
			previousSolved: 100,
			days: days([{ solved: 80, tasksDone: 3, tasksTotal: 7 }, {}, {}, {}]),
			subjects: [
				{ subject: "matematik", goal: 200, solved: 190 },
				{ subject: "fen", goal: 120, solved: 40 },
			],
			homework: { done: 2, open: 3, overdue: 1 },
			exam: { name: "Deneme 1", netTotal: 54.5, netDelta: -2 },
		});
		const text = r.lines.join("\n");
		expect(r.deltaVsPrevious).toBe(-20);
		expect(text).toContain("Geçen haftaya göre -20 soru.");
		expect(r.strongest).toBe("matematik");
		expect(r.weakest).toBe("fen");
		expect(text).toContain(
			"En çok ilerleyen ders: Matematik (%95). Geride kalan: Fen Bilimleri (%33).",
		);
		expect(text).toContain("Önerilen testlerden 3/7 yapıldı.");
		expect(text).toContain("Ödev: 2 tamamlandı, 3 açık, 1 gecikmiş.");
		expect(text).toContain(
			"Son deneme (Deneme 1): toplam net 54.5 (öncekine göre -2).",
		);
		expect(
			r.shareText.startsWith("İvme haftalık özet (5 Ekim – 11 Ekim)\n"),
		).toBe(true);
	});

	it("oranlar birbirine yakınsa ders kıyası yapılmaz", () => {
		const r = weekReport({
			...base,
			days: days([{ solved: 80 }]),
			subjects: [
				{ subject: "matematik", goal: 100, solved: 60 },
				{ subject: "fen", goal: 100, solved: 55 },
			],
		});
		expect(r.strongest).toBeUndefined();
		expect(r.lines.join(" ")).not.toContain("En çok ilerleyen ders");
	});

	it("tek hedefli derste ders kıyası yapılmaz", () => {
		const r = weekReport({
			...base,
			days: days([{ solved: 10 }]),
			subjects: [{ subject: "matematik", goal: 80, solved: 10 }],
		});
		expect(r.strongest).toBeUndefined();
		expect(r.weakest).toBeUndefined();
	});
});

describe("weekLabel", () => {
	it("ay sınırını aşan haftayı yazar", () => {
		expect(weekLabel("2026-10-26")).toBe("26 Ekim – 1 Kasım");
	});
});
