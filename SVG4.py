#!/usr/bin/env python3
import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Literal

# ----------------------------
#  Palette
# ----------------------------
PALETTE = {
    "oxford": "rgb(16,29,62)",
    "cinnabar": "rgb(236,74,39)",
    "persianred": "rgb(198,62,48)",
    "cadet": "rgb(155,184,193)",
    "robin": "rgb(52,192,206)",
    "columbia": "rgb(203,216,221)",
    "tea": "rgb(221,232,185)",
    "alabaster": "rgb(229,230,217)",
}


def color_from_name(name: str) -> str:
    if not name:
        return PALETTE["tea"]
    key = name.replace(" ", "").lower()
    if key not in PALETTE:
        raise ValueError(
            f"Unknown color '{name}'. Use one of: "
            + ", ".join(sorted(PALETTE.keys()))
        )
    return PALETTE[key]


# ----------------------------
#  Utility: versioned filenames
# ----------------------------

def unique_path(base: Path) -> Path:
    """
    If base doesn't exist, return base.
    If it does, append _v2, _v3, ... before suffix.
    """
    if not base.exists():
        return base

    stem = base.stem
    suffix = base.suffix
    i = 2
    while True:
        candidate = base.with_name(f"{stem}_v{i}{suffix}")
        if not candidate.exists():
            return candidate
        i += 1


# ----------------------------
#  Git helpers (for autopush)
# ----------------------------

def run_git_command(cmd: List[str]):
    """Run a git command in the current working directory and return (success, output)."""
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=False
        )
        return (result.returncode == 0, result.stdout + result.stderr)
    except Exception as e:
        return (False, str(e))


# ----------------------------
#  Formatting helpers
# ----------------------------

VALID_FORMATS = {
    "text",
    "dollar0", "dollar2", "dollar4",
    "perc0", "perc2", "perc4",
    "dec0", "dec2", "dec4",
}


def _to_number(value) -> Optional[float]:
    """Try to convert a value to float. Return None if not numeric."""
    if isinstance(value, (int, float)):
        return float(value)
    if value is None:
        return None
    s = str(value).strip()
    if s == "":
        return None
    # strip common symbols
    for ch in ["$", ",", "%"]:
        s = s.replace(ch, "")
    try:
        return float(s)
    except ValueError:
        return None


def format_value(value, fmt: str) -> str:
    """
    Apply per-column formatting.

    - text:   print as string
    - Dollar*: currency with commas and decimals
    - Perc*:  divide number by 100 first, then format as N, N.NN, N.NNNN%
    - Dec*:   plain decimals with commas

    If value is non-numeric in a numeric format, render the text as-is.
    If value is empty, render "".
    """
    if value is None:
        return ""

    fmt_key = fmt.replace(" ", "").lower() if fmt else "text"
    if fmt_key not in VALID_FORMATS:
        fmt_key = "text"

    # text: just stringify
    if fmt_key == "text":
        s = str(value)
        return "" if s.strip() == "" else s

    num = _to_number(value)
    if num is None:
        # non-numeric: treat as plain text
        s = str(value)
        return "" if s.strip() == "" else s

    # Dollar formats
    if fmt_key.startswith("dollar"):
        if fmt_key == "dollar0":
            formatted = f"{num:,.0f}"
        elif fmt_key == "dollar2":
            formatted = f"{num:,.2f}"
        else:  # dollar4
            formatted = f"{num:,.4f}"
        return f"${formatted}"

    # Percent formats (divide by 100 first, then show as percent)
    if fmt_key.startswith("perc"):
        num = num / 100.0
        if fmt_key == "perc0":
            formatted = f"{num:,.0f}%"
        elif fmt_key == "perc2":
            formatted = f"{num:,.2f}%"
        else:  # perc4
            formatted = f"{num:,.4f}%"
        return formatted

    # Decimal formats
    if fmt_key.startswith("dec"):
        if fmt_key == "dec0":
            return f"{num:,.0f}"
        elif fmt_key == "dec2":
            return f"{num:,.2f}"
        else:  # dec4
            return f"{num:,.4f}"

    # Fallback
    s = str(value)
    return "" if s.strip() == "" else s


# ----------------------------
#  Geometry helpers + SVG generators
# ----------------------------

def _pts_to_px(pts: float) -> float:
    return pts * 1.333  # approx pt → px


def _compute_table_layout(
    data: List[Dict],
    col_keys: List[str],
    headers: Optional[List[str]],
    formats: Optional[List[str]],
    svg_size: Tuple[int, int],
    font_size_pt: int,
    col_widths: Optional[List[float]] = None,
):
    """
    Layout + auto-fit rules:

    1) Determine longest formatted string (header + data) per column.
    2) At the requested font size, check:
       - Horizontal fit: do all columns fit within svg_width?
       - Vertical fit: do header + all rows fit within svg_height?
    3) If not, shrink font size just enough so BOTH width and height fit.
    4) Recompute row height from the final font size.
    5) Compute column widths:
       - If col_widths is None: widths are based on formatted text length and scaled to svg_width.
       - If col_widths is provided: treat as relative weights, still shrink font if needed.
    """

    svg_width, svg_height = svg_size
    num_rows = len(data)
    num_cols = len(col_keys)
    if num_cols == 0:
        raise ValueError("No columns provided for layout.")

    # Resolve header labels for measurement (headers themselves are not formatted)
    if headers and len(headers) == num_cols:
        header_labels = headers
    else:
        header_labels = col_keys

    # Normalize format list
    if formats and len(formats) == num_cols:
        fmt_list = [fmt or "text" for fmt in formats]
    else:
        fmt_list = ["text"] * num_cols

    # 1) Longest formatted string per column (header + data)
    max_chars_per_col: List[int] = []
    for j, key in enumerate(col_keys):
        fmt = fmt_list[j]
        # header text length
        max_chars = len(str(header_labels[j]))
        # data values (formatted)
        for row in data:
            if key in row:
                s = format_value(row[key], fmt)
                max_chars = max(max_chars, len(s))
        max_chars_per_col.append(max_chars)

    # Heuristics for text width + row height
    char_width_factor = 0.6      # ~ char width in px per 1px of font-size
    padding_x = 5.0              # left/right inner padding
    row_height_factor = 1.5      # row_height ≈ 1.5 * font_px

    # Requested font size in px
    font_px_requested = _pts_to_px(font_size_pt)

    # --------- Vertical constraint (height) ----------
    total_rows_for_height = num_rows + 1  # header + data
    if total_rows_for_height > 0:
        max_font_px_height = svg_height / (total_rows_for_height * row_height_factor)
    else:
        max_font_px_height = font_px_requested

    # --------- Horizontal constraint (width) ----------
    if col_widths and len(col_widths) == num_cols:
        # User-specified relative widths: fixed after scaling to svg_width
        total_rel = sum(w for w in col_widths if w > 0) or 1.0
        widths_px = [svg_width * (w / total_rel) for w in col_widths]

        constraints: List[float] = []
        for j in range(num_cols):
            max_chars = max_chars_per_col[j]
            if max_chars <= 0:
                continue
            Cj = char_width_factor * max_chars
            wj = widths_px[j]
            if wj <= 2 * padding_x:
                # Column is extremely narrow; impose a tiny bound
                constraints.append(1.0)
                continue
            # Cj * F + 2*padding_x <= wj  =>  F <= (wj - 2*padding_x)/Cj
            Fmax = (wj - 2 * padding_x) / Cj
            constraints.append(Fmax)

        if constraints:
            max_font_px_width = min(constraints)
        else:
            max_font_px_width = font_px_requested

        col_widths_px = widths_px
    else:
        # Auto-size columns based on formatted text length.
        C_sum = sum(char_width_factor * mc for mc in max_chars_per_col)
        if C_sum <= 0:
            max_font_px_width = font_px_requested
        else:
            # C_sum * F + num_cols * 2*padding_x <= svg_width
            numerator = svg_width - num_cols * 2 * padding_x
            if numerator <= 0:
                max_font_px_width = 1.0
            else:
                max_font_px_width = numerator / C_sum

        col_widths_px = None  # computed after final font size is chosen

    # --------- Final font size in px ----------
    font_px = min(font_px_requested, max_font_px_width, max_font_px_height)
    if font_px < 1.0:
        font_px = 1.0

    row_height = row_height_factor * font_px

    # --------- Column widths at final font size ----------
    if col_widths and len(col_widths) == num_cols:
        # Already computed as widths_px and independent of font_px
        pass
    else:
        base_widths: List[float] = []
        for max_chars in max_chars_per_col:
            text_w = max_chars * char_width_factor * font_px + 2 * padding_x
            base_widths.append(text_w)
        total_base = sum(base_widths) or 1.0
        scale = svg_width / total_base
        col_widths_px = [w * scale for w in base_widths]

    # Now compute x-positions
    margin_left = 0.0
    margin_right = 0.0
    col_start_x: List[float] = []
    col_end_x: List[float] = []
    current_x = margin_left
    for w in col_widths_px:
        col_start_x.append(current_x)
        col_end_x.append(current_x + w)
        current_x += w

    top_rule_y = 0.0
    header_band_height = row_height
    header_center_y = top_rule_y + header_band_height / 2.0
    header_divider_y = top_rule_y + header_band_height

    return {
        "svg_width": svg_width,
        "svg_height": svg_height,
        "font_size_px": font_px,          # may be reduced vs requested
        "margin_left": margin_left,
        "margin_right": margin_right,
        "table_width": svg_width,
        "top_rule_y": top_rule_y,
        "header_band_height": header_band_height,
        "header_center_y": header_center_y,
        "header_divider_y": header_divider_y,
        "num_rows": num_rows,
        "row_height": row_height,
        "col_widths_scaled": col_widths_px,
        "col_start_x": col_start_x,
        "col_end_x": col_end_x,
    }


def generate_svg_table(
    data: List[Dict],
    cols: Optional[List[str]] = None,
    headers: Optional[List[str]] = None,
    formats: Optional[List[str]] = None,
    font_size_pt: int = 14,
    svg_size: Tuple[int, int] = (800, 500),
    justifications: Optional[List[str]] = None,
    col_widths: Optional[List[float]] = None,
    background_color: Optional[str] = None,   # None = transparent
) -> str:
    """
    Generate SVG table following your style guide, with optional Oxford Blue background.
    Auto-resizes columns and shrinks font if needed so all text fits.
    """
    if not isinstance(data, list) or len(data) == 0:
        raise ValueError("data must be a non-empty list of dicts.")

    svg_width, svg_height = svg_size

    COLORS = {
        "persian_red": "rgb(198,62,48)",
        "cadet": "rgb(155,184,193)",
        "white": "rgb(255,255,255)",
    }

    # Determine columns
    if cols and len(cols) > 0:
        col_keys = cols
    else:
        col_keys = list(data[0].keys())
    num_cols = len(col_keys)

    # Headers
    if headers and len(headers) == num_cols:
        header_labels = headers
    else:
        header_labels = col_keys

    # Justifications
    if justifications and len(justifications) == num_cols:
        just = []
        for j in justifications:
            code = str(j or "L").upper()
            just.append(code if code in ("L", "C", "R") else "L")
    else:
        just = ["L"] * num_cols

    # Formats
    if formats and len(formats) == num_cols:
        fmt_list = [f or "text" for f in formats]
    else:
        fmt_list = ["text"] * num_cols

    # Layout (auto-fit columns + font, uses formatted text lengths)
    layout = _compute_table_layout(
        data=data,
        col_keys=col_keys,
        headers=header_labels,
        formats=fmt_list,
        svg_size=svg_size,
        font_size_pt=font_size_pt,
        col_widths=col_widths,
    )

    font_size_px = layout["font_size_px"]
    margin_left = layout["margin_left"]
    margin_right = layout["margin_right"]
    top_rule_y = layout["top_rule_y"]
    header_center_y = layout["header_center_y"]
    header_divider_y = layout["header_divider_y"]
    row_height = layout["row_height"]
    col_start_x = layout["col_start_x"]
    col_end_x = layout["col_end_x"]

    def escape_xml(value) -> str:
        s = str(value)
        return (
            s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&apos;")
        )

    inner_pad = 5

    def get_text_position(col_index: int, align: str):
        start = col_start_x[col_index]
        end = col_end_x[col_index]
        center = (start + end) / 2.0
        if align == "C":
            return center, "middle"
        elif align == "R":
            return end - inner_pad, "end"
        else:
            return start + inner_pad, "start"

    parts: List[str] = []

    # SVG root
    parts.append(
        f'<svg width="{svg_width}" height="{svg_height}" '
        f'viewBox="0 0 {svg_width} {svg_height}" '
        f'xmlns="http://www.w3.org/2000/svg">'
    )

    # Optional background rect (Oxford Blue, etc.)
    if background_color:
        parts.append(
            f'<rect x="0" y="0" width="{svg_width}" height="{svg_height}" '
            f'fill="{background_color}"/>'
        )

    # Styles
    parts.append(
        f"""
  <style>
    .header {{
      font-family: "Montserrat", sans-serif;
      font-size: {font_size_px}px;
      font-weight: 700;
      fill: {COLORS["white"]};
      dominant-baseline: middle;
    }}
    .cell {{
      font-family: "Montserrat", sans-serif;
      font-size: {font_size_px}px;
      font-weight: 400;
      fill: {COLORS["white"]};
      dominant-baseline: middle;
    }}
  </style>
"""
    )

    # Top Persian Red rule (4pt)
    top_rule_stroke_width = _pts_to_px(4)
    parts.append(
        f'<line x1="{margin_left}" y1="{top_rule_y}" '
        f'x2="{svg_width - margin_right}" y2="{top_rule_y}" '
        f'stroke="{COLORS["persian_red"]}" stroke-width="{top_rule_stroke_width}"/>'
    )

    # Headers
    for idx, label in enumerate(header_labels):
        x, anchor = get_text_position(idx, just[idx])
        parts.append(
            f'<text x="{x}" y="{header_center_y}" class="header" '
            f'text-anchor="{anchor}">{escape_xml(label)}</text>'
        )

    # Header-bottom Cadet divider (1pt)
    row_divider_stroke_width = _pts_to_px(1)
    parts.append(
        f'<line x1="{margin_left}" y1="{header_divider_y}" '
        f'x2="{svg_width - margin_right}" y2="{header_divider_y}" '
        f'stroke="{COLORS["cadet"]}" stroke-width="{row_divider_stroke_width}"/>'
    )

    # Row dividers
    num_rows = len(data)
    for i in range(1, num_rows + 1):
        y = header_divider_y + row_height * i
        is_last = i == num_rows
        color = COLORS["persian_red"] if is_last else COLORS["cadet"]
        parts.append(
            f'<line x1="{margin_left}" y1="{y}" '
            f'x2="{svg_width - margin_right}" y2="{y}" '
            f'stroke="{color}" stroke-width="{row_divider_stroke_width}"/>'
        )

    # Data rows
    for row_index, row_data in enumerate(data):
        center_y = header_divider_y + row_height * (row_index + 0.5)
        for col_index, key in enumerate(col_keys):
            raw_value = row_data.get(key, "")
            fmt = fmt_list[col_index]
            rendered = format_value(raw_value, fmt)
            if rendered == "":
                continue  # blank cell
            align = just[col_index]
            x, anchor = get_text_position(col_index, align)
            parts.append(
                f'<text x="{x}" y="{center_y}" class="cell" '
                f'text-anchor="{anchor}">{escape_xml(rendered)}</text>'
            )

    parts.append("</svg>")
    return "\n".join(parts)


def generate_highlight_overlay(
    kind: Literal["row", "column", "cell"],
    *,
    data: List[Dict],
    cols: Optional[List[str]],
    headers: Optional[List[str]],
    formats: Optional[List[str]],
    svg_size: Tuple[int, int],
    font_size_pt: int,
    col_widths: Optional[List[float]] = None,
    row_index: Optional[int] = None,
    col_index: Optional[int] = None,
    color_rgb: str = "rgb(221,232,185)",  # Tea
    opacity: float = 0.5,
) -> str:
    """
    Generate an SVG overlay to highlight a row, column, or cell.
    Uses the same layout logic (including auto font shrink) as the base table.
    """
    if kind not in ("row", "column", "cell"):
        raise ValueError("kind must be 'row', 'column', or 'cell'.")
    if len(data) <= 0:
        raise ValueError("data_length must be positive.")

    # Resolve columns / headers exactly as in generate_svg_table
    if cols and len(cols) > 0:
        col_keys = cols
    else:
        col_keys = list(data[0].keys())
    num_cols = len(col_keys)

    if headers and len(headers) == num_cols:
        header_labels = headers
    else:
        header_labels = col_keys

    # Formats
    if formats and len(formats) == num_cols:
        fmt_list = [f or "text" for f in formats]
    else:
        fmt_list = ["text"] * num_cols

    layout = _compute_table_layout(
        data=data,
        col_keys=col_keys,
        headers=header_labels,
        formats=fmt_list,
        svg_size=svg_size,
        font_size_pt=font_size_pt,
        col_widths=col_widths,
    )

    svg_width = layout["svg_width"]
    svg_height = layout["svg_height"]
    header_divider_y = layout["header_divider_y"]
    row_height = layout["row_height"]
    col_start_x = layout["col_start_x"]
    col_end_x = layout["col_end_x"]
    data_length = len(data)
    col_count = num_cols

    x = y = width = height = None

    if kind == "row":
        if row_index is None or not (0 <= row_index < data_length):
            raise ValueError("row_index must be valid for kind='row'.")
        row_top = header_divider_y + row_height * row_index
        x = col_start_x[0]
        y = row_top
        width = col_end_x[col_count - 1] - col_start_x[0]
        height = row_height

    elif kind == "column":
        if col_index is None or not (0 <= col_index < col_count):
            raise ValueError("col_index must be valid for kind='column'.")
        col_left = col_start_x[col_index]
        x = col_left
        y = header_divider_y
        width = col_end_x[col_index] - col_start_x[col_index]
        height = row_height * data_length

    else:  # cell
        if (
            row_index is None or not (0 <= row_index < data_length)
            or col_index is None or not (0 <= col_index < col_count)
        ):
            raise ValueError("row_index and col_index must be valid for kind='cell'.")
        row_top = header_divider_y + row_height * row_index
        col_left = col_start_x[col_index]
        x = col_left
        y = row_top
        width = col_end_x[col_index] - col_start_x[col_index]
        height = row_height

    svg = (
        f'<svg width="{svg_width}" height="{svg_height}" '
        f'viewBox="0 0 {svg_width} {svg_height}" xmlns="http://www.w3.org/2000/svg">\n'
        f'  <rect x="{x}" y="{y}" width="{width}" height="{height}" '
        f'fill="{color_rgb}" fill-opacity="{opacity}" />\n'
        f"</svg>"
    )
    return svg


# ----------------------------
#  CLI handling
# ----------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate SVG table + optional highlights from JSON."
    )
    parser.add_argument("json_file", help="Path to input JSON file (e.g., Table14_1a.json)")
    parser.add_argument("--cols", nargs="*", help="Column keys to include (default: all keys from first row)")
    parser.add_argument("--headers", nargs="*", help="Custom header labels (must match number of cols)")
    parser.add_argument("--justify", nargs="*", help="Per-column alignment codes: L, C, R")
    parser.add_argument(
        "--format",
        nargs="*",
        metavar="FMT",
        help=(
            "Per-column format: text, Dollar0, Dollar2, Dollar4, "
            "Perc0, Perc2, Perc4, Dec0, Dec2, Dec4"
        ),
    )
    parser.add_argument("--colwidths", nargs="*", type=float, help="Relative column widths (will be scaled)")
    parser.add_argument("--fontsize", type=int, default=14, help="Font size in pt (default: 14)")
    parser.add_argument(
        "--size",
        nargs=2,
        type=int,
        metavar=("WIDTH", "HEIGHT"),
        default=[800, 500],
        help="SVG size, e.g. --size 1400 820",
    )

    # Row highlight: row index + color name
    parser.add_argument(
        "--rowhighlight",
        nargs=2,
        metavar=("ROW_INDEX", "COLOR_NAME"),
        help="Highlight a row, e.g. --rowhighlight 16 Robin",
    )

    # Column highlight: col index + color name
    parser.add_argument(
        "--colhighlight",
        nargs=2,
        metavar=("COL_INDEX", "COLOR_NAME"),
        help="Highlight a column, e.g. --colhighlight 3 Tea",
    )

    # Cell highlight: row index, col index, color name
    parser.add_argument(
        "--cellhighlight",
        nargs=3,
        metavar=("ROW_INDEX", "COL_INDEX", "COLOR_NAME"),
        help="Highlight a cell, e.g. --cellhighlight 8 4 Cinnabar",
    )

    # Optional Oxford Blue background
    parser.add_argument(
        "--bgoxford",
        action="store_true",
        help="If set, draw an Oxford Blue background (otherwise transparent).",
    )

    args = parser.parse_args()

    json_path = Path(args.json_file)
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    svg_width, svg_height = args.size
    cols = args.cols
    headers = args.headers
    justifications = args.justify
    formats = args.format
    col_widths = args.colwidths
    font_size_pt = args.fontsize

    bg_color = color_from_name("oxford") if args.bgoxford else None

    # Base name for outputs (Scott.json -> Scott)
    base_name = json_path.stem

    # -----------------------------------------------
    # OUTPUT DIRECTORY: json's folder + /svg
    # e.g., tablejsons/Table14_1a.json -> tablejsons/svg/Table14_1a.svg
    # -----------------------------------------------
    output_dir = json_path.parent / "svg"
    output_dir.mkdir(parents=True, exist_ok=True)

    generated_files: List[Path] = []

    # Generate base table
    table_svg = generate_svg_table(
        data,
        cols=cols,
        headers=headers,
        formats=formats,
        font_size_pt=font_size_pt,
        svg_size=(svg_width, svg_height),
        justifications=justifications,
        col_widths=col_widths,
        background_color=bg_color,
    )

    base_svg_path = unique_path(output_dir / f"{base_name}.svg")
    with open(base_svg_path, "w", encoding="utf-8") as f:
        f.write(table_svg)
    generated_files.append(base_svg_path)
    print(f"Base table saved to: {base_svg_path}")

    # Row highlight
    if args.rowhighlight:
        row_idx_str, color_name = args.rowhighlight
        row_index = int(row_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "row",
            data=data,
            cols=cols,
            headers=headers,
            formats=formats,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_widths=col_widths,
            row_index=row_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_row_{row_index}_{color_name}.svg"
        path = unique_path(output_dir / name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        generated_files.append(path)
        print(f"Row highlight saved to: {path}")

    # Column highlight
    if args.colhighlight:
        col_idx_str, color_name = args.colhighlight
        col_index = int(col_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "column",
            data=data,
            cols=cols,
            headers=headers,
            formats=formats,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_widths=col_widths,
            col_index=col_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_col_{col_index}_{color_name}.svg"
        path = unique_path(output_dir / name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        generated_files.append(path)
        print(f"Column highlight saved to: {path}")

    # Cell highlight
    if args.cellhighlight:
        row_idx_str, col_idx_str, color_name = args.cellhighlight
        row_index = int(row_idx_str)
        col_index = int(col_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "cell",
            data=data,
            cols=cols,
            headers=headers,
            formats=formats,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_widths=col_widths,
            row_index=row_index,
            col_index=col_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_cell_{row_index}_{col_index}_{color_name}.svg"
        path = unique_path(output_dir / name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        generated_files.append(path)
        print(f"Cell highlight saved to: {path}")

    # ------------------------------------------------------
    # ALWAYS AUTOPUSH AFTER GENERATING SVGs
    # ------------------------------------------------------
    print("\n--- AUTOPUSH START ---")

    # Ensure we are in a git repo
    ok, out = run_git_command(["git", "rev-parse", "--is-inside-work-tree"])
    if not ok or "true" not in out:
        print("Not inside a git repository. Auto-push skipped.")
        return

    # Stage only the SVG directory
    print(f"Staging SVGs from: {output_dir}")
    ok, out = run_git_command(["git", "add", str(output_dir)])
    if not ok:
        print("Failed to git add SVGs:")
        print(out)
        return

    # Check if anything actually changed
    ok, out = run_git_command(["git", "status", "--porcelain"])
    if not ok:
        print("git status failed:")
        print(out)
        return

    if out.strip() == "":
        print("No changes to commit.")
        return

    # Create commit message with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_message = f"Auto-update SVG tables ({timestamp})"

    print("Committing...")
    ok, out = run_git_command(["git", "commit", "-m", commit_message])
    if not ok:
                    print("Commit failed:")
        print(out)
        return

    print("Pushing to origin/main...")
    ok, out = run_git_command(["git", "push", "origin", "main"])
    if not ok:
        print("Push failed:")
        print(out)
    else:
        print("Auto-push successful!")


if __name__ == "__main__":
    main()
