#!/usr/bin/env python3
"""
Render a Tourism & Hospitality Brief edition JSON into the edition PDF, one
file per language.

    python3 scripts/pdf/render-pdf.py <edition.json> --lang pt|en --out <dir>
    python3 scripts/pdf/render-pdf.py --all <dir-of-jsons> --out <dir>

The output file is named by the JSON's own pdf.pt / pdf.en field.

`scripts/render-pdfs.mjs` calls this once per edition per language during
`npm run prebuild`, so the PDFs `public/briefs/` serves are generated, never
committed (decision D-34). See docs/publishing.md.

Layout, palette and type scale reproduce Paulo's own ReportLab briefs: A4,
18 mm margins, running head + foot, one content block per page, ivory cards,
terracotta section labels, petroleum-green headlines.

Numbers are never written by hand: they are formatted from the indicator
objects (value / unit / scale / decimals / change) with the same rules as
src/lib/format.js on the website.

Dependencies: the standard library and reportlab, nothing else. Only the
Helvetica core fonts are used, so no font file has to ship. It must keep
running on Python 3.8 (Netlify's build image) as well as on 3.9 and 3.14:
no `str | None` at runtime, no `dict |` merge, no `removeprefix`, no `match`.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional, Sequence, Tuple

from reportlab.lib.colors import Color
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)

# --------------------------------------------------------------------------- #
# Palette (THB visual system)                                                   #
# --------------------------------------------------------------------------- #


def hexcolor(s: str) -> Color:
    s = s.lstrip("#")
    return Color(int(s[0:2], 16) / 255.0, int(s[2:4], 16) / 255.0, int(s[4:6], 16) / 255.0)


PETROLEUM = hexcolor("#163E3D")   # headlines, values, body copy
IVORY = hexcolor("#F4F0E7")       # card and callout fill
TERRACOTTA = hexcolor("#C97849")  # section labels, rules, positive bars
GREYGREEN = hexcolor("#5E6864")   # captions, footer, negative bars
BEIGE = hexcolor("#C9C2B5")       # hairlines and card borders
BEIGE_LIGHT = hexcolor("#E7E2D8") # bar-list row rules
POSITIVE = hexcolor("#1B7F5C")
NEGATIVE = hexcolor("#B3261E")
PLACEHOLDER_GREY = hexcolor("#8A8F8B")

FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

# --------------------------------------------------------------------------- #
# Page geometry (measured from Paulo's PDFs)                                    #
# --------------------------------------------------------------------------- #

PAGE_W, PAGE_H = A4                       # 595.276 x 841.890
MARGIN = 18 * mm                          # 51.0236
CONTENT_W = PAGE_W - 2 * MARGIN           # 493.228
FRAME_TOP = 762.5197                      # top of the first flowable
FRAME_BOTTOM = MARGIN
HEAD_RULE_Y = 802.2047
HEAD_TEXT_Y = 812.126
FOOT_RULE_Y = 36.85039
FOOT_TEXT_Y = 25.51181

GAP_AFTER_HEADLINE = 10.0
GAP_BLOCK = 8 * mm                        # 22.677 between major blocks
GAP_PARA = 7.0                            # between body paragraphs

CARD_W = 52 * mm                          # 147.4016
CARD_H = 30 * mm                          # 85.0394
CARD_GAP_X = 4 * mm                       # 11.3386
CARD_GAP_Y = 5 * mm                       # 14.1732
CARD_PAD_X = 5 * mm
NOTE_LEADING = 7.2                        # indicator-note line spacing

CALLOUT_INDENT = 3 * mm                   # 8.5039
CALLOUT_PAD_TOP = 4 * mm
CALLOUT_PAD_BOTTOM = 5 * mm
CALLOUT_PAD_X = 6 * mm                    # 17.0079
CALLOUT_BODY_INDENT = 6 * mm
CALLOUT_BODY_PAD_RIGHT = 13 * mm
CALLOUT_TITLE_GAP = 25.3465

BAR_INDENT = 7 * mm                       # 19.8425
BAR_TABLE_W = 160 * mm                    # 453.5433
BAR_LABEL_W = 38 * mm                     # 107.7165
BAR_MAX_W = 90 * mm                       # 255.1181
BAR_ROW_H = 10 * mm                       # 28.3465
BAR_H = 5 * mm                            # 14.1732

OUTLOOK_INDENT = 6.5 * mm                 # 18.4252
OUTLOOK_W = 161 * mm                      # 456.378
OUTLOOK_NUM_W = 24 * mm                   # 68.0315
OUTLOOK_ROW_H = 25 * mm                   # 70.8661

# --------------------------------------------------------------------------- #
# Paragraph styles                                                              #
# --------------------------------------------------------------------------- #

S_SECTION_LABEL = ParagraphStyle(
    "sectionLabel", fontName=FONT_BOLD, fontSize=9, leading=12, textColor=TERRACOTTA
)
S_HEADLINE = ParagraphStyle(
    "headline", fontName=FONT_BOLD, fontSize=20, leading=24, textColor=PETROLEUM,
    spaceBefore=4,
)
S_BODY = ParagraphStyle(
    "body", fontName=FONT, fontSize=10.3, leading=15, textColor=PETROLEUM,
    alignment=TA_LEFT,
)
S_CAPTION = ParagraphStyle(
    "caption", fontName=FONT, fontSize=7.5, leading=10, textColor=GREYGREEN
)
S_SOURCE_LINE = ParagraphStyle(
    "sourceLine", fontName=FONT, fontSize=7.5, leading=10, textColor=GREYGREEN
)
S_COVER_KICKER = ParagraphStyle(
    "coverKicker", fontName=FONT_BOLD, fontSize=9, leading=12, textColor=TERRACOTTA
)
S_COVER_TITLE = ParagraphStyle(
    "coverTitle", fontName=FONT_BOLD, fontSize=27, leading=31, textColor=PETROLEUM
)
S_COVER_LEAD = ParagraphStyle(
    "coverLead", fontName=FONT_BOLD, fontSize=15, leading=21, textColor=PETROLEUM,
    leftIndent=6 * mm, rightIndent=CONTENT_W - 6 * mm - 160 * mm,
)
S_BIG = ParagraphStyle(
    "big", fontName=FONT_BOLD, fontSize=20, leading=24, textColor=PETROLEUM
)
S_MEDIUM = ParagraphStyle(
    "medium", fontName=FONT_BOLD, fontSize=12, leading=15, textColor=PETROLEUM
)

# --------------------------------------------------------------------------- #
# Locale formatting - the Python twin of src/lib/format.js                      #
# --------------------------------------------------------------------------- #

NBSP = " "

BASIS_LABELS = {
    "yoy": {"pt": "homólogo", "en": "YoY"},
    "mom": {"pt": "mensal", "en": "MoM"},
    "ytd": {"pt": "acumulado", "en": "YTD"},
}
SCALE_SUFFIX = {
    "none": {"pt": "", "en": ""},
    "thousand": {"pt": "mil", "en": "k"},
    "million": {"pt": "M", "en": "M"},
}
PP_SUFFIX = {"pt": "p.p.", "en": "pp"}
MONTHS = {
    "pt": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
           "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    "en": ["January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December"],
}
HISTORICAL_MARK = {"pt": "EDIÇÃO HISTÓRICA", "en": "HISTORICAL EDITION"}
# `t.historicalNotice` in src/content/ui.js, verbatim. The PDF cover writes the
# same sentence as the web page for an edition with no `historicalNote` (D-24);
# `{period}` is the in-sentence period form, not the title form.
HISTORICAL_NOTICE = {
    "pt": "Edição histórica, publicada a {date}, com dados do período {period}.",
    "en": "Historical edition, published on {date} with data for {period}.",
}
PLACEHOLDER_TOKEN = "__WRITE__"
PLACEHOLDER_TEXT = {"pt": "[texto por escrever]", "en": "[text to be written]"}
# Fixed template labels for the three mandatory parts of the Real Estate Lens,
# as used in Paulo's own PDFs.
LENS_LABELS = {
    "fact": {"pt": "FACTO", "en": "FACT"},
    "interpretation": {"pt": "INTERPRETAÇÃO", "en": "INTERPRETATION"},
    "implication": {"pt": "IMPLICAÇÃO", "en": "IMPLICATION"},
}


def _lang(contentLang: str) -> str:
    return "pt" if contentLang == "pt" else "en"


def group_digits(intpart: str, sep: str, min_grouping: int) -> str:
    """Insert `sep` every three digits, but only from `min_grouping` groups on.

    pt-PT has minimumGroupingDigits = 2, so 1071 stays "1071" while 10000
    becomes "10 000"; en-GB groups from four digits ("1,071").
    """
    if len(intpart) <= 3:
        return intpart
    if min_grouping == 2 and len(intpart) == 4:
        return intpart
    out = []
    while len(intpart) > 3:
        out.insert(0, intpart[-3:])
        intpart = intpart[:-3]
    out.insert(0, intpart)
    return sep.join(out)


def format_number(value: Optional[float], unit: str = "count", scale: str = "none",
                  decimals: int = 1, signed: bool = False, contentLang: str = "en") -> str:
    if value is None:
        return "—"
    lang = _lang(contentLang)
    digits = min(max(int(decimals or 0), 0), 3)
    negative = value < 0
    raw = f"{abs(float(value)):.{digits}f}"
    if "." in raw:
        ip, fp = raw.split(".")
    else:
        ip, fp = raw, ""
    if lang == "pt":
        ip = group_digits(ip, NBSP, 2)
        number = ip + ("," + fp if fp else "")
    else:
        ip = group_digits(ip, ",", 1)
        number = ip + ("." + fp if fp else "")
    if negative:
        number = "-" + number
    elif signed and float(value) != 0:
        # signDisplay: "exceptZero" - a zero change carries no sign
        number = "+" + number

    suffix = SCALE_SUFFIX.get(scale or "none", {}).get(lang, "")

    if unit == "percent":
        return f"{number}%"
    if unit == "pp":
        return f"{number}{NBSP}{PP_SUFFIX[lang]}"
    if unit == "eur":
        if lang == "pt":
            return f"{number}{NBSP + suffix if suffix else ''}{NBSP}EUR"
        return f"EUR{NBSP}{number}{NBSP + suffix if suffix else ''}"
    return f"{number}{NBSP + suffix if suffix else ''}"


def format_value(indicator: Dict[str, Any], contentLang: str = "en") -> str:
    if not indicator:
        return "—"
    basis = indicator.get("valueBasis", "level")
    is_comparison = bool(basis) and basis != "level"
    return format_number(
        indicator.get("value"),
        unit=indicator.get("unit", "count"),
        scale=indicator.get("scale", "none"),
        decimals=indicator.get("decimals", 1),
        signed=bool(indicator.get("signed", is_comparison)),
        contentLang=contentLang,
    )


def basis_label(basis: Optional[str], contentLang: str) -> str:
    lang = _lang(contentLang)
    entry = BASIS_LABELS.get(basis or "", {})
    return entry.get(lang) or entry.get("en") or ""


def format_change(change: Optional[Dict[str, Any]], contentLang: str = "en"):
    """Returns (text, direction) or None."""
    if not change or not isinstance(change.get("value"), (int, float)):
        return None
    lang = _lang(contentLang)
    unit = change.get("absUnit", "count") if change.get("unit") == "abs" else change.get("unit")
    value = format_number(
        change["value"],
        unit=unit,
        scale=change.get("scale", "none"),
        decimals=change.get("decimals", 1),
        signed=True,
        contentLang=lang,
    )
    label = change.get("label", {}).get(lang) if isinstance(change.get("label"), dict) else None
    basis = label or basis_label(change.get("basis"), lang)
    text = f"{value}{NBSP}{basis}" if basis else value
    direction = (change["value"] > 0) - (change["value"] < 0)
    return text, direction


def format_period(edition: Dict[str, Any], contentLang: str = "en") -> str:
    period = edition.get("period") or {}
    lang = _lang(contentLang)
    year = period.get("year", "")
    horizon = edition.get("horizon")
    if horizon == "monthly":
        return f"{MONTHS[lang][(period.get('month') or 1) - 1]} {year}"
    if horizon == "quarterly":
        return f"Q{period.get('quarter') or 1} {year}"
    if horizon == "half-year":
        return f"H{period.get('half') or 1} {year}"
    if horizon == "annual":
        return f"Balanço Anual {year}" if lang == "pt" else f"Annual Review {year}"
    return str(year)


def format_period_in_sentence(edition: Dict[str, Any], contentLang: str = "en") -> str:
    """The period as it reads inside a sentence rather than as a title.

    Mirror of `formatPeriodInSentence` in `src/lib/format.js`; keep the two in
    step, they feed the same sentence on the page and on the cover.
    """
    period = edition.get("period") or {}
    lang = _lang(contentLang)
    year = period.get("year", "")
    horizon = edition.get("horizon")
    if horizon == "monthly":
        name = MONTHS[lang][(period.get("month") or 1) - 1]
        return f"{name.lower()} de {year}" if lang == "pt" else f"{name} {year}"
    if horizon == "quarterly":
        q = period.get("quarter") or 1
        return f"{q}.º trimestre de {year}" if lang == "pt" else f"Q{q} {year}"
    if horizon == "half-year":
        h = period.get("half") or 1
        return f"{h}.º semestre de {year}" if lang == "pt" else f"H{h} {year}"
    # annual, and anything without a narrower period: the year alone
    return str(year)


def format_date_long(iso: Optional[str], contentLang: str = "en") -> str:
    """ISO date -> "8 de setembro de 2026" / "8 September 2026".

    Mirror of `formatDate` in `src/lib/format.js` (Intl pt-PT / en-GB, day
    numeric, month long, year numeric).
    """
    lang = _lang(contentLang)
    parts = str(iso or "").split("-")
    if len(parts) != 3 or not all(p.isdigit() for p in parts):
        return str(iso or "")
    y, m, d = (int(p) for p in parts)
    if not 1 <= m <= 12:
        return str(iso)
    if lang == "pt":
        return f"{d} de {MONTHS['pt'][m - 1].lower()} de {y}"
    return f"{d} {MONTHS['en'][m - 1]} {y}"


def historical_notice(edition: Dict[str, Any], contentLang: str = "en") -> str:
    """The site's standard sentence for a backfilled edition.

    Same wording as `t.historicalNotice` in `src/content/ui.js`, filled the same
    way `EditionHeader.jsx` fills it, so the PDF cover and the web page say the
    same thing when the edition carries no `historicalNote` of its own (D-24).
    """
    lang = _lang(contentLang)
    return (
        HISTORICAL_NOTICE[lang]
        .replace("{date}", format_date_long(edition.get("publishedAt"), lang))
        .replace("{period}", format_period_in_sentence(edition, lang))
    )


def title_parts(edition: Dict[str, Any], lang: str) -> Tuple[str, str, str]:
    """(series name, country, period label) taken from the JSON title when it
    follows the 'A | B | C' convention, otherwise derived."""
    title = (edition.get("title") or {}).get(lang, "") or ""
    parts = [p.strip() for p in title.split("|")]
    if len(parts) >= 3:
        return parts[0], parts[1], " | ".join(parts[2:])
    return (parts[0] if parts else "Tourism & Hospitality Brief",
            "Portugal",
            format_period(edition, lang))


# --------------------------------------------------------------------------- #
# Text helpers                                                                  #
# --------------------------------------------------------------------------- #


def esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def is_placeholder(s: Optional[str]) -> bool:
    return bool(s) and PLACEHOLDER_TOKEN in s


def loc(node: Optional[Dict[str, Any]], lang: str, default: str = "") -> str:
    """Localized string, with the __WRITE__ placeholder resolved."""
    if not isinstance(node, dict):
        return default
    value = node.get(lang) or node.get("en") or default
    if is_placeholder(value):
        return PLACEHOLDER_TEXT[_lang(lang)]
    return value


def loc_raw(node: Optional[Dict[str, Any]], lang: str) -> str:
    if not isinstance(node, dict):
        return ""
    return node.get(lang) or ""


def para(node: Optional[Dict[str, Any]], lang: str, style: ParagraphStyle,
         **kw) -> Optional[Paragraph]:
    """A Paragraph from a localizedText node; grey when it is a placeholder."""
    if not isinstance(node, dict):
        return None
    raw = node.get(lang) or node.get("en") or ""
    if not raw:
        return None
    if is_placeholder(raw):
        style = ParagraphStyle("ph", parent=style, textColor=PLACEHOLDER_GREY)
        raw = PLACEHOLDER_TEXT[_lang(lang)]
    if kw:
        style = ParagraphStyle(style.name + "_v", parent=style, **kw)
    return Paragraph(esc(raw), style)


def rich_paragraphs(node: Optional[Dict[str, Any]], lang: str,
                    style: ParagraphStyle = S_BODY) -> List[Paragraph]:
    """Paragraphs from a richText node."""
    if not isinstance(node, dict):
        return []
    items = node.get(lang) or node.get("en") or []
    out = []
    for raw in items:
        st = style
        text = raw
        if is_placeholder(raw):
            st = ParagraphStyle("ph", parent=style, textColor=PLACEHOLDER_GREY)
            text = PLACEHOLDER_TEXT[_lang(lang)]
        out.append(Paragraph(esc(text), st))
    return out


def wrap_text(text: str, font: str, size: float, width: float) -> List[str]:
    words = text.split()
    lines: List[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(trial, font, size) <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]


def fit_font_size(text: str, font: str, size: float, width: float,
                  minimum: float = 10.0) -> float:
    while size > minimum and pdfmetrics.stringWidth(text, font, size) > width:
        size -= 0.5
    return size


# --------------------------------------------------------------------------- #
# Custom flowables                                                              #
# --------------------------------------------------------------------------- #


class HRule(Flowable):
    def __init__(self, width: float, thickness: float = 1.0, color: Color = BEIGE,
                 indent: float = 0.0):
        super().__init__()
        self.width = width
        self.thickness = thickness
        self.color = color
        self.indent = indent

    def wrap(self, aw, ah):
        return (self.width + self.indent, self.thickness)

    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.rect(self.indent, 0, self.width, self.thickness, stroke=0, fill=1)


class KpiGrid(Flowable):
    """The 3-column indicator band: ivory card, caption, big value, change."""

    COLS = 3

    def __init__(self, indicators: Sequence[Dict[str, Any]], lang: str):
        super().__init__()
        self.indicators = list(indicators)
        self.lang = lang
        self.rows = (len(self.indicators) + self.COLS - 1) // self.COLS

    def wrap(self, aw, ah):
        h = self.rows * CARD_H + max(0, self.rows - 1) * CARD_GAP_Y
        return (self.COLS * CARD_W + (self.COLS - 1) * CARD_GAP_X, h)

    def draw(self):
        c = self.canv
        _, total_h = self.wrap(0, 0)
        for i, ind in enumerate(self.indicators):
            row, col = divmod(i, self.COLS)
            x = col * (CARD_W + CARD_GAP_X)
            y = total_h - (row + 1) * CARD_H - row * CARD_GAP_Y
            self._card(c, x, y, ind)

    def _card(self, c, x, y, ind):
        lang = self.lang
        c.saveState()
        c.setFillColor(IVORY)
        c.setStrokeColor(BEIGE)
        c.setLineWidth(0.5)
        c.rect(x, y, CARD_W, CARD_H, stroke=1, fill=1)

        inner_w = CARD_W - 2 * CARD_PAD_X
        # caption
        label = loc(ind.get("label"), lang)
        label_size = 7.7
        lines = wrap_text(label, FONT_BOLD, label_size, inner_w)
        while len(lines) > 2 and label_size > 6.0:
            label_size -= 0.3
            lines = wrap_text(label, FONT_BOLD, label_size, inner_w)
        c.setFont(FONT_BOLD, label_size)
        c.setFillColor(PLACEHOLDER_GREY if is_placeholder(loc_raw(ind.get("label"), lang))
                       else GREYGREEN)
        base = y + 22 * mm + 2.3
        for n, line in enumerate(lines):
            c.drawString(x + CARD_PAD_X, base + (len(lines) - 1 - n) * 10, line)

        # value
        value = format_value(ind, lang)
        size = fit_font_size(value, FONT_BOLD, 20, inner_w, minimum=11)
        c.setFont(FONT_BOLD, size)
        c.setFillColor(PETROLEUM)
        c.drawString(x + CARD_PAD_X, y + 9 * mm + 2, value)

        # change and note
        # The web card (src/knowledge-centre/components/IndicatorCard.jsx) prints
        # the change AND the note, so the PDF prints both: the note carries the
        # vintage caveat ("variação revista", "valor derivado dos acumulados do
        # INE") that rule 2 of CORRECTION-RULES.md requires the reader to see.
        change = format_change(ind.get("change"), lang)
        note_raw = loc_raw(ind.get("note"), lang)
        note_text = loc(ind.get("note"), lang)
        note_color = PLACEHOLDER_GREY if is_placeholder(note_raw) else GREYGREEN
        if change:
            text, direction = change
            color = POSITIVE if direction > 0 else NEGATIVE if direction < 0 else GREYGREEN
        else:
            # No change to print: the note takes the change line, as before.
            text = note_text
            color = PLACEHOLDER_GREY if is_placeholder(note_raw) else TERRACOTTA
            note_text = ""
        status = ind.get("status")
        if status and change:
            text = f"{text} ({status})"

        note_lines: List[str] = []
        note_size = 6.6
        if note_text:
            note_size = fit_font_size(note_text, FONT, 6.6, inner_w, minimum=5.0)
            note_lines = wrap_text(note_text, FONT, note_size, inner_w)[:2]

        bottom = y + 1 * mm + 2.6
        change_base = bottom + (NOTE_LEADING * len(note_lines) + 1.8
                                if note_lines else 0)
        if text:
            size = fit_font_size(text, FONT_BOLD, 8.4 if len(note_lines) < 2 else 7.2,
                                 inner_w, minimum=6)
            c.setFont(FONT_BOLD, size)
            c.setFillColor(color)
            c.drawString(x + CARD_PAD_X, change_base, text)
        if note_lines:
            c.setFont(FONT, note_size)
            c.setFillColor(note_color)
            for n, line in enumerate(note_lines):
                c.drawString(x + CARD_PAD_X,
                             bottom + (len(note_lines) - 1 - n) * NOTE_LEADING, line)
        c.restoreState()


class Callout(Flowable):
    """Ivory box with a terracotta left bar: main conclusion / attention signal."""

    def __init__(self, title: str, body: str, width: float,
                 title_placeholder: bool = False, body_placeholder: bool = False):
        super().__init__()
        self.title = title
        self.body = body
        self.width = width
        self.title_ph = title_placeholder
        self.body_ph = body_placeholder
        self.body_width = (width - CALLOUT_PAD_X - CALLOUT_BODY_INDENT
                           - CALLOUT_BODY_PAD_RIGHT)
        self.lines = wrap_text(body, FONT_BOLD, 15, self.body_width)

    def wrap(self, aw, ah):
        h = (CALLOUT_PAD_TOP + 12 + CALLOUT_TITLE_GAP
             + len(self.lines) * 21 + CALLOUT_PAD_BOTTOM)
        return (self.width + CALLOUT_INDENT, h)

    def draw(self):
        c = self.canv
        _, h = self.wrap(0, 0)
        x0 = CALLOUT_INDENT
        c.saveState()
        c.setFillColor(IVORY)
        c.setStrokeColor(BEIGE)
        c.setLineWidth(0.4)
        c.rect(x0, 0, self.width, h, stroke=1, fill=1)
        c.setStrokeColor(TERRACOTTA)
        c.setLineWidth(3)
        c.line(x0, 0, x0, h)

        c.setFont(FONT_BOLD, 9)
        c.setFillColor(PLACEHOLDER_GREY if self.title_ph else TERRACOTTA)
        c.drawString(x0 + CALLOUT_PAD_X, h - CALLOUT_PAD_TOP - 9, self.title)

        c.setFont(FONT_BOLD, 15)
        c.setFillColor(PLACEHOLDER_GREY if self.body_ph else PETROLEUM)
        top = h - CALLOUT_PAD_TOP - 12 - CALLOUT_TITLE_GAP
        for n, line in enumerate(self.lines):
            c.drawString(x0 + CALLOUT_PAD_X + CALLOUT_BODY_INDENT,
                         top - (n + 1) * 21 + 6, line)
        c.restoreState()


class BarList(Flowable):
    """Horizontal bar list: label, bar scaled to the largest absolute value,
    signed value. Positive bars terracotta, negative bars grey-green; the
    highlighted item gets an ivory band, a bold label and an outlined bar."""

    def __init__(self, barlist: Dict[str, Any], lang: str):
        super().__init__()
        self.items = barlist.get("items", [])
        self.lang = lang
        self.unit = barlist.get("unit", "percent")
        self.scale = barlist.get("scale", "none")
        self.decimals = barlist.get("decimals", 1)
        self.highlight = barlist.get("highlightKey")
        self.max_abs = max((abs(i.get("value", 0) or 0) for i in self.items), default=0) or 1.0

    def wrap(self, aw, ah):
        return (BAR_INDENT + BAR_TABLE_W, len(self.items) * BAR_ROW_H)

    def draw(self):
        c = self.canv
        n = len(self.items)
        total_h = n * BAR_ROW_H
        x0 = BAR_INDENT
        c.saveState()
        for i, item in enumerate(self.items):
            top = total_h - i * BAR_ROW_H
            bottom = top - BAR_ROW_H
            value = item.get("value", 0) or 0
            highlighted = self.highlight and item.get("key") == self.highlight
            if highlighted:
                c.setFillColor(IVORY)
                c.rect(x0, bottom, BAR_TABLE_W, BAR_ROW_H, stroke=0, fill=1)

            # label: shrink, then wrap to at most two lines
            label = loc(item.get("label"), self.lang)
            font = FONT_BOLD if highlighted else FONT
            size, lines = self._fit_label(label, font, BAR_LABEL_W - 6)
            c.setFont(font, size)
            c.setFillColor(PLACEHOLDER_GREY if is_placeholder(loc_raw(item.get("label"), self.lang))
                           else PETROLEUM)
            centre = bottom + BAR_ROW_H / 2
            first = centre + (len(lines) - 1) * (size + 1.5) / 2 - size / 3
            for n, line in enumerate(lines):
                c.drawString(x0, first - n * (size + 1.5), line)

            # bar
            width = BAR_MAX_W * abs(value) / self.max_abs
            by = bottom + (BAR_ROW_H - BAR_H) / 2
            c.setFillColor(TERRACOTTA if value >= 0 else GREYGREEN)
            c.rect(x0 + BAR_LABEL_W, by, width, BAR_H, stroke=0, fill=1)
            if highlighted:
                c.setStrokeColor(PETROLEUM)
                c.setLineWidth(0.7)
                c.rect(x0 + BAR_LABEL_W, by, width, BAR_H, stroke=1, fill=0)

            # signed value
            text = format_number(value, unit=self.unit, scale=self.scale,
                                 decimals=self.decimals, signed=True,
                                 contentLang=self.lang)
            c.setFont(FONT_BOLD, 8)
            c.setFillColor(PETROLEUM)
            c.drawRightString(x0 + BAR_TABLE_W, bottom + BAR_ROW_H / 2 - 3, text)

            c.setStrokeColor(BEIGE_LIGHT)
            c.setLineWidth(0.25)
            c.line(x0, bottom, x0 + BAR_TABLE_W, bottom)
        c.setStrokeColor(BEIGE_LIGHT)
        c.setLineWidth(0.25)
        c.line(x0, total_h, x0 + BAR_TABLE_W, total_h)
        c.restoreState()

    @staticmethod
    def _fit_label(text: str, font: str, width: float) -> Tuple[float, List[str]]:
        """Largest size at which the label fits the label column on one line;
        failing that, the largest size at which it fits on two."""
        size = 10.3
        while size > 7.0 and pdfmetrics.stringWidth(text, font, size) > width:
            size -= 0.3
        if pdfmetrics.stringWidth(text, font, size) <= width:
            return size, [text]
        size = 8.5
        while size > 6.0 and len(wrap_text(text, font, size, width)) > 2:
            size -= 0.3
        return size, wrap_text(text, font, size, width)


class OutlookList(Flowable):
    """Numbered signals to watch: 01 / 02 / 03 in a bordered grid."""

    def __init__(self, signals: Sequence[Dict[str, Any]], lang: str):
        super().__init__()
        self.lang = lang
        self.rows: List[Tuple[str, List[str], bool]] = []
        text_w = OUTLOOK_W - OUTLOOK_NUM_W - 2 * (5 * mm)
        for i, sig in enumerate(signals):
            raw = loc_raw(sig, lang)
            text = loc(sig, lang)
            self.rows.append((f"{i + 1:02d}", wrap_text(text, FONT_BOLD, 12, text_w),
                              is_placeholder(raw)))

    def row_heights(self) -> List[float]:
        return [max(OUTLOOK_ROW_H, 10 * mm + len(lines) * 15) for _, lines, _ in self.rows]

    def wrap(self, aw, ah):
        return (OUTLOOK_INDENT + OUTLOOK_W, sum(self.row_heights()))

    def draw(self):
        c = self.canv
        heights = self.row_heights()
        total_h = sum(heights)
        x0 = OUTLOOK_INDENT
        c.saveState()
        c.setFillColor(IVORY)
        c.rect(x0, 0, OUTLOOK_NUM_W, total_h, stroke=0, fill=1)
        y = total_h
        for (num, lines, ph), h in zip(self.rows, heights):
            bottom = y - h
            centre = bottom + h / 2
            c.setFont(FONT_BOLD, 20)
            c.setFillColor(PETROLEUM)
            c.drawString(x0 + 5 * mm, centre - 7, num)
            c.setFont(FONT_BOLD, 12)
            c.setFillColor(PLACEHOLDER_GREY if ph else PETROLEUM)
            first = centre + (len(lines) - 1) * 15 / 2 - 4
            for n, line in enumerate(lines):
                c.drawString(x0 + OUTLOOK_NUM_W + 5 * mm, first - n * 15, line)
            if bottom > 0.01:
                c.setStrokeColor(BEIGE)
                c.setLineWidth(0.4)
                c.line(x0, bottom, x0 + OUTLOOK_W, bottom)
            y = bottom
        c.setStrokeColor(BEIGE)
        c.setLineWidth(0.5)
        c.rect(x0, 0, OUTLOOK_W, total_h, stroke=1, fill=0)
        c.setLineWidth(0.4)
        c.line(x0 + OUTLOOK_NUM_W, 0, x0 + OUTLOOK_NUM_W, total_h)
        c.restoreState()


class DataTable(Flowable):
    """Optional `table` block of the schema (no live edition uses one yet)."""

    HEAD_H = 16.0
    ROW_H = 18.0

    def __init__(self, table: Dict[str, Any], lang: str):
        super().__init__()
        self.lang = lang
        self.columns = table.get("columns", [])
        self.rows = table.get("rows", [])
        self.width = CONTENT_W
        n = max(1, len(self.columns))
        self.col_w = [self.width / n] * n

    def wrap(self, aw, ah):
        return (self.width, self.HEAD_H + len(self.rows) * self.ROW_H)

    def _cell_text(self, row: Dict[str, Any], col: Dict[str, Any]) -> str:
        value = row.get(col["key"])
        if value is None:
            return "—"
        if isinstance(value, dict):
            return loc(value, self.lang)
        return format_number(value, unit=col.get("unit", "count"),
                             scale=col.get("scale", "none"),
                             decimals=col.get("decimals", 1),
                             contentLang=self.lang)

    def draw(self):
        c = self.canv
        _, total_h = self.wrap(0, 0)
        c.saveState()
        y = total_h - self.HEAD_H
        c.setFillColor(IVORY)
        c.rect(0, y, self.width, self.HEAD_H, stroke=0, fill=1)
        x = 0.0
        for col, w in zip(self.columns, self.col_w):
            c.setFont(FONT_BOLD, 8)
            c.setFillColor(GREYGREEN)
            label = loc(col.get("label"), self.lang)
            if col.get("align") == "right":
                c.drawRightString(x + w - 4, y + 5, label)
            else:
                c.drawString(x + 4, y + 5, label)
            x += w
        for i, row in enumerate(self.rows):
            ry = y - (i + 1) * self.ROW_H
            x = 0.0
            for col, w in zip(self.columns, self.col_w):
                text = self._cell_text(row, col)
                c.setFont(FONT, 9)
                c.setFillColor(PETROLEUM)
                if col.get("align") == "right":
                    c.drawRightString(x + w - 4, ry + 6, text)
                elif col.get("align") == "center":
                    c.drawCentredString(x + w / 2, ry + 6, text)
                else:
                    c.drawString(x + 4, ry + 6, text)
                x += w
            c.setStrokeColor(BEIGE_LIGHT)
            c.setLineWidth(0.25)
            c.line(0, ry, self.width, ry)
        c.restoreState()


# --------------------------------------------------------------------------- #
# Story                                                                         #
# --------------------------------------------------------------------------- #


def section_header(section: Dict[str, Any], lang: str,
                   scope: Optional[Dict[str, Any]] = None) -> List[Flowable]:
    out: List[Flowable] = []
    label = para(section.get("sectionLabel"), lang, S_SECTION_LABEL)
    if label:
        out.append(label)
    headline = para(section.get("headline"), lang, S_HEADLINE)
    if headline:
        out.append(headline)
    scope_para = para(scope, lang, S_CAPTION, spaceBefore=4)
    if scope_para:
        out.append(scope_para)
    out.append(Spacer(1, GAP_AFTER_HEADLINE))
    return out


def callout_flowable(callout: Dict[str, Any], lang: str) -> Optional[Callout]:
    if not callout:
        return None
    return Callout(
        loc(callout.get("title"), lang),
        loc(callout.get("body"), lang),
        CONTENT_W - 2 * CALLOUT_INDENT,
        title_placeholder=is_placeholder(loc_raw(callout.get("title"), lang)),
        body_placeholder=is_placeholder(loc_raw(callout.get("body"), lang)),
    )


def barlist_block(barlist: Dict[str, Any], lang: str) -> List[Flowable]:
    """Bar list with its interpretative title, period and source line.
    `altText` is deliberately not rendered - it is for the web only."""
    if not barlist:
        return []
    out: List[Flowable] = []
    title = para(barlist.get("title"), lang, S_MEDIUM, leftIndent=BAR_INDENT)
    if title:
        out.append(title)
    period = para(barlist.get("period"), lang, S_CAPTION, leftIndent=BAR_INDENT)
    if period:
        out.append(period)
    out.append(Spacer(1, 6))
    out.append(BarList(barlist, lang))
    source = para(barlist.get("source"), lang, S_CAPTION, leftIndent=BAR_INDENT,
                  spaceBefore=6)
    if source:
        out.append(source)
    return out


def body_block(node: Dict[str, Any], lang: str) -> List[Flowable]:
    out: List[Flowable] = []
    for i, p in enumerate(rich_paragraphs(node, lang)):
        if i:
            out.append(Spacer(1, GAP_PARA))
        out.append(p)
    return out


def tables_block(section: Dict[str, Any], lang: str) -> List[Flowable]:
    out: List[Flowable] = []
    for table in section.get("tables") or []:
        out.append(Spacer(1, GAP_BLOCK))
        caption = para(table.get("caption"), lang, S_MEDIUM)
        if caption:
            out.append(caption)
            out.append(Spacer(1, 6))
        out.append(DataTable(table, lang))
        source = para(table.get("source"), lang, S_CAPTION, spaceBefore=6)
        if source:
            out.append(source)
    return out


def cover_story(edition: Dict[str, Any], section: Dict[str, Any], lang: str) -> List[Flowable]:
    series, country, period = title_parts(edition, lang)
    out: List[Flowable] = [Spacer(1, 18 * mm)]

    kicker = para(section.get("kicker"), lang, S_COVER_KICKER)
    if kicker:
        out.append(kicker)

    if edition.get("historical"):
        # An edition without its own `historicalNote` still says it is a
        # backfill: the cover writes the site's standard sentence (D-24).
        note = (loc(edition.get("historicalNote"), lang)
                if loc_raw(edition.get("historicalNote"), lang)
                else historical_notice(edition, lang))
        mark = HISTORICAL_MARK[_lang(lang)]
        text = f"{mark} · {note}" if note else mark
        out.append(Spacer(1, 3))
        out.append(Paragraph(esc(text), ParagraphStyle(
            "hist", parent=S_CAPTION, textColor=TERRACOTTA)))

    out.append(Spacer(1, 4))
    out.append(Paragraph(esc(series), ParagraphStyle(
        "coverTitleW", parent=S_COVER_TITLE, rightIndent=CONTENT_W - 220)))
    out.append(Spacer(1, 37.51))
    out.append(HRule(453.5433, 1.0, BEIGE, indent=7 * mm))
    out.append(Spacer(1, 17 * mm))

    strapline = para(section.get("strapline"), lang, S_COVER_LEAD)
    if strapline:
        out.append(strapline)

    takeaway = para(edition.get("takeaway"), lang, S_BODY,
                    textColor=GREYGREEN, leftIndent=6 * mm,
                    rightIndent=CONTENT_W - 6 * mm - 160 * mm,
                    spaceBefore=10 * mm)
    if takeaway:
        out.append(takeaway)
        out.append(Spacer(1, 20 * mm))
    else:
        out.append(Spacer(1, 30 * mm))

    author = section.get("author") or {}
    out.append(Paragraph(esc(author.get("name", "")), S_BIG))
    out.append(Spacer(1, 10))
    role = para(author.get("role"), lang, S_MEDIUM)
    if role:
        out.append(role)

    out.append(Spacer(1, 36 * mm))
    out.append(Paragraph(esc(f"{country} | {period}"), S_BIG))
    note = para(section.get("note"), lang, S_CAPTION, spaceBefore=7.5 * mm)
    if note:
        out.append(note)
    return out


def sources_block(section: Dict[str, Any], lang: str) -> List[Flowable]:
    sources = section.get("sources") or {}
    out: List[Flowable] = [Spacer(1, 12 * mm)]
    label = para(section.get("sectionLabel"), lang, S_MEDIUM)
    if label:
        out.append(label)
        out.append(Spacer(1, 5))
    line = " ".join(
        [loc(sources.get("primary"), lang)]
        + [loc(c, lang) for c in sources.get("complementary") or []]
    ).strip()
    if line:
        out.append(Paragraph(esc(line), S_SOURCE_LINE))
    notes = para(sources.get("notes"), lang, S_SOURCE_LINE, spaceBefore=5)
    if notes:
        out.append(notes)
    return out


def build_story(edition: Dict[str, Any], lang: str) -> List[Flowable]:
    sections = {s["block"]: s for s in edition.get("sections", [])}
    story: List[Flowable] = []

    # 1 - cover
    header = sections.get("header")
    if header:
        story += cover_story(edition, header, lang)
    story.append(PageBreak())

    # 2 - executive summary
    section = sections.get("executiveSummary")
    if section:
        story += section_header(section, lang)
        callout = callout_flowable(section.get("callout"), lang)
        if callout:
            story.append(callout)
            story.append(Spacer(1, GAP_BLOCK))
        story += body_block(section.get("body"), lang)
        story.append(PageBreak())

    # 3 - key indicators
    section = sections.get("keyIndicators")
    if section:
        story += section_header(section, lang)
        story.append(KpiGrid(section.get("indicators", []), lang))
        story.append(Spacer(1, GAP_BLOCK))
        story += body_block(section.get("reading"), lang)
        story += tables_block(section, lang)
        story.append(PageBreak())

    # 4 - demand
    section = sections.get("demand")
    if section:
        story += section_header(section, lang)
        story.append(KpiGrid(section.get("indicators", []), lang))
        story.append(Spacer(1, GAP_BLOCK))
        story += body_block(section.get("body"), lang)
        story.append(Spacer(1, GAP_BLOCK))
        story += barlist_block(section.get("barList"), lang)
        story += tables_block(section, lang)
        story.append(PageBreak())

    # 5 - regions
    section = sections.get("regional")
    if section:
        story += section_header(section, lang)
        story += barlist_block(section.get("barList"), lang)
        story.append(Spacer(1, GAP_BLOCK))
        story += body_block(section.get("body"), lang)
        callout = callout_flowable(section.get("callout"), lang)
        if callout:
            story.append(Spacer(1, GAP_PARA))
            story.append(callout)
        story += tables_block(section, lang)
        story.append(PageBreak())

    # 6 - operating performance
    section = sections.get("operating")
    if section:
        story += section_header(section, lang, scope=section.get("scope"))
        story.append(KpiGrid(section.get("indicators", []), lang))
        story.append(Spacer(1, GAP_BLOCK))
        story += body_block(section.get("body"), lang)
        story += tables_block(section, lang)
        story.append(PageBreak())

    # 7 - real estate lens
    section = sections.get("lens")
    if section:
        lens = section.get("lens") or {}
        label = para(section.get("sectionLabel"), lang, S_SECTION_LABEL)
        if label:
            story.append(label)
        headline = para(lens.get("headline"), lang, S_HEADLINE)
        if headline:
            story.append(headline)
        story.append(Spacer(1, GAP_AFTER_HEADLINE))
        fact = lens.get("fact")
        story.append(Callout(
            LENS_LABELS["fact"][_lang(lang)], loc(fact, lang),
            CONTENT_W - 2 * CALLOUT_INDENT,
            body_placeholder=is_placeholder(loc_raw(fact, lang))))
        for key in ("interpretation", "implication"):
            story.append(Spacer(1, GAP_BLOCK))
            story.append(Paragraph(LENS_LABELS[key][_lang(lang)], S_SECTION_LABEL))
            story.append(Spacer(1, 4))
            body = para(lens.get(key), lang, S_BODY)
            if body:
                story.append(body)
        story.append(PageBreak())

    # 8 - outlook + sources
    section = sections.get("outlook")
    if section:
        outlook = section.get("outlook") or {}
        label = para(section.get("sectionLabel"), lang, S_SECTION_LABEL)
        if label:
            story.append(label)
        intro = para(outlook.get("intro"), lang, S_HEADLINE)
        if intro:
            story.append(intro)
        story.append(Spacer(1, GAP_AFTER_HEADLINE))
        story.append(OutlookList(outlook.get("signals", []), lang))

    section = sections.get("sources")
    if section:
        story += sources_block(section, lang)

    if header:
        author = header.get("author") or {}
        story.append(Spacer(1, 18 * mm))
        story.append(Paragraph(esc(author.get("name", "")), S_BIG))
        story.append(Spacer(1, 10))
        role = para(author.get("role"), lang, S_MEDIUM)
        if role:
            story.append(role)

    return story


# --------------------------------------------------------------------------- #
# Document                                                                      #
# --------------------------------------------------------------------------- #


class BriefDoc(BaseDocTemplate):
    def __init__(self, path: str, edition: Dict[str, Any], lang: str):
        series, country, period = title_parts(edition, lang)
        header = next((s for s in edition.get("sections", [])
                       if s.get("block") == "header"), {})
        author = header.get("author") or {}
        title = (edition.get("title") or {}).get(lang) or series
        super().__init__(
            path, pagesize=A4, title=title, author="Paulo Braga",
            subject=loc(edition.get("takeaway"), lang),
            leftMargin=MARGIN, rightMargin=MARGIN,
            topMargin=PAGE_H - FRAME_TOP, bottomMargin=FRAME_BOTTOM,
        )
        self.head_left = series.upper()
        self.head_right = f"{country} | {period}".upper()
        role = loc(author.get("role"), lang)
        name = author.get("name", "")
        self.foot_left = f"{name} | {role}" if role else name
        frame = Frame(MARGIN, FRAME_BOTTOM, CONTENT_W, FRAME_TOP - FRAME_BOTTOM,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                      id="body")
        self.addPageTemplates([PageTemplate(id="brief", frames=[frame],
                                            onPage=self.decorate)])

    def decorate(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(BEIGE)
        canvas.setLineWidth(0.45)
        canvas.line(MARGIN, HEAD_RULE_Y, PAGE_W - MARGIN, HEAD_RULE_Y)
        canvas.setFont(FONT_BOLD, 7.5)
        canvas.setFillColor(PETROLEUM)
        canvas.drawString(MARGIN, HEAD_TEXT_Y, self.head_left)
        canvas.setFont(FONT, 7.5)
        canvas.setFillColor(GREYGREEN)
        canvas.drawRightString(PAGE_W - MARGIN, HEAD_TEXT_Y, self.head_right)

        canvas.line(MARGIN, FOOT_RULE_Y, PAGE_W - MARGIN, FOOT_RULE_Y)
        canvas.setFont(FONT, 7)
        canvas.drawString(MARGIN, FOOT_TEXT_Y, self.foot_left)
        canvas.drawRightString(PAGE_W - MARGIN, FOOT_TEXT_Y, str(canvas.getPageNumber()))
        canvas.restoreState()


def render(edition: Dict[str, Any], lang: str, out_dir: str) -> str:
    lang = _lang(lang)
    filename = (edition.get("pdf") or {}).get(lang)
    if not filename:
        raise SystemExit(f"edition {edition.get('id')} has no pdf.{lang} filename")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, filename)
    doc = BriefDoc(path, edition, lang)
    doc.build(build_story(edition, lang))
    return path


def load(path: str) -> Dict[str, Any]:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main(argv: Optional[Sequence[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("edition", nargs="?", help="path to one edition JSON")
    ap.add_argument("--all", metavar="DIR", help="render every edition JSON in DIR")
    ap.add_argument("--lang", choices=["pt", "en"], help="language (default: both)")
    ap.add_argument("--out", required=True, metavar="DIR", help="output directory")
    args = ap.parse_args(argv)

    if not args.edition and not args.all:
        ap.error("give an edition JSON or --all DIR")

    langs = [args.lang] if args.lang else ["pt", "en"]
    paths: List[str] = []
    if args.all:
        for name in sorted(os.listdir(args.all)):
            if name.endswith(".json") and not name.endswith(".schema.json"):
                paths.append(os.path.join(args.all, name))
    if args.edition:
        paths.append(args.edition)

    written = 0
    for path in paths:
        edition = load(path)
        if edition.get("series") != "thb" or "sections" not in edition:
            print(f"skip {path} (not an edition)", file=sys.stderr)
            continue
        for lang in langs:
            out = render(edition, lang, args.out)
            written += 1
            print(out)
    if not written:
        print("nothing rendered", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
