#!/usr/bin/env python3
"""
MEB TYMM yıllık plan Word dosyasını (haftalık tablo, 12 sütun) ayrıştırır ve TypeScript üretir.

Kullanım:
  python3 import_yillik_plan_docx.py <plan.docx> <çıktı.ts> [--year 2026] [--outcome-prefix MAT]
Gereksinim: python-docx (yalnızca geliştirme zamanı aracı, uygulamanın bağımlılığı değil).

Her tema için bir "bilgi tablosu" ve bir "haftalık tablo" vardır; yalnızca haftalık tablolar
(12 sütun) okunur. Tek hücreli satırlar tatil/dönem sonudur. Çıktıyı `biome` ile biçimlendirin.
"""
import json
import re
import sys
from datetime import date

import docx

MONTHS = {
    "ocak": 1, "şubat": 2, "mart": 3, "nisan": 4, "mayıs": 5, "haziran": 6,
    "temmuz": 7, "ağustos": 8, "eylül": 9, "ekim": 10, "kasım": 11, "aralık": 12,
}


def tr_lower(text: str) -> str:
    return text.replace("İ", "i").replace("I", "ı").lower()


def year_of(month: int, first_year: int) -> int:
    return first_year if month >= 8 else first_year + 1


def parse_range(text: str, first_year: int):
    """'14-18 Eylül' veya '28 Eylül-02 Ekim' -> (başlangıç, bitiş) ISO."""
    t = tr_lower(text)
    m = re.search(r"(\d+)\s*([a-zçğıöşü]+)?\s*[–-]\s*(\d+)\s*([a-zçğıöşü]+)", t)
    if not m:
        return None
    d1, mon1, d2, mon2 = m.groups()
    m2 = MONTHS[mon2]
    m1 = MONTHS[mon1] if mon1 else m2
    return (
        date(year_of(m1, first_year), m1, int(d1)).isoformat(),
        date(year_of(m2, first_year), m2, int(d2)).isoformat(),
    )


def unique_cells(row):
    seen, out = [], []
    for c in row.cells:
        if c._tc in seen:
            continue
        seen.append(c._tc)
        out.append(c.text)
    return out


def unit_id(num: str, title: str) -> str:
    suffix = {"(1)": "a", "(2)": "b"}.get(re.search(r"\(\d\)\s*$", title.strip()).group(0) if re.search(r"\(\d\)\s*$", title.strip()) else "", "")
    return f"tema-{num}{suffix}"


def main():
    src, out = sys.argv[1], sys.argv[2]

    def opt(name, default):
        return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

    first_year = int(opt("--year", "2026"))
    code_prefix = opt("--outcome-prefix", "MAT")
    d = docx.Document(src)
    weeks, breaks = [], []
    code_re = re.compile(rf"^({code_prefix}\.\d+\.\d+\.\d+)\.\s*(.*?)(?:\s*\((\d+)\s*Saat\))?\s*$", re.S)
    for table in d.tables:
        if len(table.columns) != 12:
            continue
        for row in table.rows[1:]:
            cells = unique_cells(row)
            if len(cells) == 1:
                m = re.match(r"(.+?)\s*\(([^)]+)\)", cells[0].strip())
                span = parse_range(m.group(2), first_year) if m else None
                if m and span:
                    breaks.append({"title": m.group(1).strip(), "start": span[0], "end": span[1]})
                continue
            if len(cells) != 12:
                continue
            date_c, week_c, hours_c, tema_c, content_c, outcome_c = cells[:6]
            note_c = cells[11]
            span = parse_range(date_c, first_year)
            mw = re.match(r"(\d+)\.\s*Hafta", week_c)
            if not (span and mw):
                continue
            temas = [(n, t.strip()) for n, t in re.findall(r"(\d+)\.\s*TEMA:\s*([^\n]+)", tema_c)]
            groups = [g for g in content_c.split("\n\n")]
            if not temas:
                # Tema yok: etkinlik haftası (örn. sosyal etkinlik), dönem olarak tutulur
                title = content_c.strip().lstrip("*").strip()
                breaks.append({"title": title, "start": span[0], "end": span[1]})
                continue
            topics, otp = [], None
            for g in groups:
                lines = [x.strip() for x in g.split("\n") if x.strip()]
                if any("Okul Temelli Planlama" in x for x in lines):
                    continue
                topics.extend(lines)
            outcomes = []
            for g in outcome_c.split("\n\n"):
                g = g.strip()
                if not g:
                    continue
                if "Okul Temelli Planlama" in g:
                    mo = re.search(r"\((\d+)\s*Saat\)", g)
                    otp = int(mo.group(1)) if mo else None
                    continue
                m = code_re.match(re.sub(r"\s+", " ", g))
                if m:
                    o = {"code": m.group(1), "title": m.group(2).strip()}
                    if m.group(3):
                        o["hours"] = int(m.group(3))
                    outcomes.append(o)
            weeks.append(
                {
                    "week": int(mw.group(1)),
                    "start": span[0],
                    "end": span[1],
                    "hours": re.sub(r"\s*Saat", "", hours_c).strip(),
                    "unitIds": [unit_id(n, t) for n, t in temas],
                    "topics": topics,
                    "outcomes": outcomes,
                    **({"otpHours": otp} if otp else {}),
                    **({"note": re.sub(r"\s+", " ", note_c).strip().lstrip("* ")} if note_c.strip() else {}),
                }
            )
    weeks.sort(key=lambda w: w["week"])
    dump = lambda v: json.dumps(v, ensure_ascii=False, indent=1)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "// Otomatik üretildi: packages/library/scripts/import_yillik_plan_docx.py. Elle düzenlemeyin.\n"
            'import type { CurriculumPeriod, CurriculumWeek } from "@ivmeapp/core";\n\n'
            f"export const weeks: CurriculumWeek[] = {dump(weeks)};\n\n"
            f"export const breaks: CurriculumPeriod[] = {dump(breaks)};\n"
        )
    print(f"{len(weeks)} hafta, {len(breaks)} tatil/etkinlik dönemi")


if __name__ == "__main__":
    main()
