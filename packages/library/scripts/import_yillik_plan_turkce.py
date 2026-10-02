#!/usr/bin/env python3
"""
MEB Türkçe "ünitelendirilmiş yıllık plan" Word dosyasını ayrıştırır ve TypeScript üretir.

Kullanım: python3 import_yillik_plan_turkce.py <plan.docx> <çıktı.ts> [--year 2026]
Gereksinim: python-docx (yalnızca geliştirme zamanı aracı).

Bu plan hafta tabanlı değil, DÖNEM tabanlıdır: her dönem (~8 ders saati) bir tema ve bir
metne bağlıdır. Takvim haftaları (tatiller hariç), o haftayla en çok iş günü kesişen
dönem(ler)e bağlanır. Çıktı: weeks, breaks, texts (tema -> metin başlıkları).
"""
import json
import re
import sys
from datetime import date, timedelta

import docx

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from import_yillik_plan_docx import MONTHS, parse_range, tr_lower, unique_cells, year_of  # noqa: E402

TEMA_IDS = {
    "dilimizin zenginlikleri": ("tema-1", "Dilimizin Zenginliği"),
    "bağımsızlık yolu": ("tema-2", "Bağımsızlık Yolu"),
    "farklı dünyalar": ("tema-3", "Farklı Dünyalar"),
    "iletişim ve sosyal ilişikiler": ("tema-4", "İletişim ve Sosyal İlişkiler"),
    "iletişim ve sosyal ilişkiler": ("tema-4", "İletişim ve Sosyal İlişkiler"),
    "bilim ve teknoloji": ("tema-5", "Bilim ve Teknoloji"),
    "lider ruhlar": ("tema-6", "Lider Ruhlar"),
}


def upper_first(word: str) -> str:
    if not word:
        return word
    head = "İ" if word[0] == "i" else word[0].upper()
    return head + word[1:]


def title_case(text: str) -> str:
    """BÜYÜK HARFLİ metni Türkçe kurallarıyla Başlık Biçimine çevirir (tire, parantez, eğik çizgi sonrası dahil)."""
    low = tr_lower(re.sub(r"\s+", " ", text).strip())
    low = re.sub(r"\s*\(", " (", low)
    out = re.sub(r"(^|[\s\-/(:])([a-zçğıöşüâîû])", lambda m: m.group(1) + upper_first(m.group(2)), low)
    return re.sub(r"(?<=\S) Ve (?=\S)", " ve ", out)


def sentence_case(text: str) -> str:
    low = tr_lower(re.sub(r"\s+", " ", text).strip())
    return upper_first(low)


def parse_outcomes(cell: str):
    """T.D.6.1 gibi kodlara göre böler; başlık kodun hemen sonrasındaki ilk satırdır."""
    text = cell.replace("\r", "")
    matches = list(re.finditer(r"T\.[A-Z]\.6\.\d+\.?", text))
    out, seen = [], set()
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        title = text[m.end():end].split("\n")[0].strip()
        code = m.group(0).rstrip(".")
        if code in seen or not title:
            continue
        seen.add(code)
        out.append({"code": code, "title": re.sub(r"\s+", " ", title)})
    return out


def weekdays(start: date, end: date):
    d = start
    while d <= end:
        if d.weekday() < 5:
            yield d
        d += timedelta(days=1)


def main():
    src, out = sys.argv[1], sys.argv[2]
    first_year = int(sys.argv[sys.argv.index("--year") + 1]) if "--year" in sys.argv else 2026
    d = docx.Document(src)

    periods, breaks, otp_notes = [], [], []
    for table in d.tables:
        for row in table.rows:
            cells = unique_cells(row)
            if cells[0].strip() == "AY/HAFTA/SÜRE":
                continue
            joined = " ".join(cells)
            # Tatiller: "1. DÖNEM ARA TATİLİ (16-20 Kasım 2026)", "YARIYIL TATİLİ (25 OCAK-5 ŞUBAT 2027)"
            for m in re.finditer(
                r"((?:\d\.\s*)?(?:DÖNEM ARA TATİL[İI]?|YARIYIL TATİL[İI]?|KURBAN BAYRAMI))\s*\(([^)]+)\)",
                joined,
                re.I,
            ):
                span = parse_range(m.group(2), first_year)
                if span and not any(b["start"] == span[0] for b in breaks):
                    breaks.append({"title": title_case(m.group(1)), "start": span[0], "end": span[1]})
            if len(cells) == 12:
                span = parse_range(cells[0].split("/")[0], first_year)
                tema_text, metin = (cells[1].split("/", 1) + [""])[:2]
                tema = TEMA_IDS.get(tr_lower(tema_text.strip()))
                if not (span and tema):
                    continue
                periods.append(
                    {
                        "start": date.fromisoformat(span[0]),
                        "end": date.fromisoformat(span[1]),
                        "unit": tema[0],
                        "text": title_case(metin),
                        "outcomes": parse_outcomes(cells[4]),
                        # Kaynak dosyadaki yazım hatası: "ARARLIK"
                        "note": title_case(cells[11].replace("ARARLIK", "ARALIK")) if cells[11].strip() else "",
                        "otp": re.sub(r"\s+", " ", cells[10]).strip(),
                    }
                )
            elif len(cells) == 7 and cells[0].strip().startswith("21-25"):
                span = parse_range(cells[0], first_year)
                if span:
                    breaks.append({"title": "Sosyal Etkinlik Haftası", "start": span[0], "end": span[1]})

    # Tekrarlanan satırlar (aynı tarih ve metin) tek dönem sayılır; çıktısız olanlar atılır
    uniq = []
    for p in periods:
        if uniq and uniq[-1]["start"] == p["start"] and uniq[-1]["text"] == p["text"]:
            continue
        uniq.append(p)
    periods = uniq

    def in_break(day: date):
        return any(date.fromisoformat(b["start"]) <= day <= date.fromisoformat(b["end"]) for b in breaks)

    # Takvim haftaları: Eylül ortasından Haziran sonuna, tatil haftaları hariç
    first_monday = date(first_year, 9, 14)
    last_end = max(date.fromisoformat(b["end"]) for b in breaks if b["title"] == "Sosyal Etkinlik Haftası")
    mondays = []
    d0 = first_monday
    while d0 < last_end - timedelta(days=4):
        days = list(weekdays(d0, d0 + timedelta(days=4)))
        if not all(in_break(x) for x in days):
            mondays.append(d0)
        d0 += timedelta(days=7)

    weeks, texts = [], {}
    for i, mon in enumerate(mondays, 1):
        fri = mon + timedelta(days=4)
        wd = {x for x in weekdays(mon, fri) if not in_break(x)}
        scored = []
        for idx, p in enumerate(periods):
            overlap = len({x for x in weekdays(p["start"], p["end"])} & wd)
            if overlap:
                scored.append((overlap, idx))
        if not scored:
            # Dönemler arası boşluk: önceki dönem sürer
            prev = [idx for idx, p in enumerate(periods) if p["end"] < mon]
            scored = [(1, prev[-1])] if prev else [(1, 0)]
        best = max(s for s, _ in scored)
        chosen = [idx for s, idx in scored if s >= 2 or s == best]
        chosen.sort()
        sel = [periods[idx] for idx in chosen]
        unit_ids, tops, outs, notes = [], [], [], []
        for p in sel:
            if p["unit"] not in unit_ids:
                unit_ids.append(p["unit"])
            if p["text"] not in tops:
                tops.append(p["text"])
            texts.setdefault(p["unit"], [])
            if p["text"] not in texts[p["unit"]]:
                texts[p["unit"]].append(p["text"])
            for o in p["outcomes"]:
                if not any(x["code"] == o["code"] for x in outs):
                    outs.append(o)
            if p["note"] and p["note"] not in notes:
                notes.append(p["note"])
            if p["otp"] and "ÜRETİM" in p["otp"].upper():
                dm = re.search(r"([\d\- ]+[A-ZÇĞİÖŞÜ]+)\s+ÜRETİM ZAMANI", p["otp"].upper())
                n = f"Üretim zamanı (yazma ve konuşma): {title_case(dm.group(1))}" if dm else sentence_case(p["otp"])
                if n not in notes:
                    notes.append(n)
        weeks.append(
            {
                "week": i,
                "start": mon.isoformat(),
                "end": fri.isoformat(),
                "hours": "6",
                "unitIds": unit_ids,
                "topics": tops,
                "outcomes": outs,
                **({"note": " · ".join(notes)} if notes else {}),
            }
        )
    dump = lambda v: json.dumps(v, ensure_ascii=False, indent=1)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "// Otomatik üretildi: packages/library/scripts/import_yillik_plan_turkce.py. Elle düzenlemeyin.\n"
            'import type { CurriculumPeriod, CurriculumWeek } from "@ivmeapp/core";\n\n'
            f"export const weeks: CurriculumWeek[] = {dump(weeks)};\n\n"
            f"export const breaks: CurriculumPeriod[] = {dump(breaks)};\n\n"
            f"/** Tema başına metin başlıkları, planın sırasıyla. */\nexport const texts: Record<string, string[]> = {dump(texts)};\n"
        )
    print(f"{len(weeks)} hafta, {len(breaks)} tatil/etkinlik, {len(periods)} dönem, {sum(len(v) for v in texts.values())} metin")


if __name__ == "__main__":
    main()
