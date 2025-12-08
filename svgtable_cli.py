#!/usr/bin/env python3
import argparse
import json
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
#  Geometry helpers + SVG generators
# ----------------------------

def _pts_to_px(pts: float) -> float:
    return pts * 1.333  # approx


def _compute_table_layout(
    data_length: int,
    svg_size: Tuple[int, int],
    font_size_pt: int,
    col_count: int,
    col_widths: Optional[List[float]] = None,
):
    svg_width, svg_height = svg_size
    font_size_px = _pts_to_px(font_size_pt)

    margin_left = 0
    margin_right = 0
    table_width = svg_width - margin_left - margin_right

    top_rule_y = 40
    header_band_height = font_size_px * 1.5
    header_center_y = top_rule_y + header_band_height / 2
    header_divider_y = top_rule_y + header_band_height

    num_rows = data_length
    bottom_margin = font_size_px * 1.5
    available_height = svg_height - header_divider_y - bottom_margin
    row_height = available_height / num_rows

    # Column widths scaled or equal
    if col_widths and len(col_widths) == col_count:
        numeric = [float(w) if w is not None else 0.0 for w in col_widths]
        total = sum(numeric)
        if total > 0:
            scale = table_width / total
            col_widths_scaled = [w * scale for w in numeric]
        else:
            col_widths_scaled = [table_width / col_count] * col_count
    else:
        col_widths_scaled = [table_width / col_count] * col_count

    col_start_x = []
    col_end_x = []
    current_x = margin_left
    for w in col_widths_scaled:
        col_start_x.append(current_x)
        col_end_x.append(current_x + w)
        current_x += w

    return {
        "svg_width": svg_width,
        "svg_height": svg_height,
        "font_size_px": font_size_px,
        "margin_left": margin_left,
        "margin_right": margin_right,
        "table_width": table_width,
        "top_rule_y": top_rule_y,
        "header_band_height": header_band_height,
        "header_center_y": header_center_y,
        "header_divider_y": header_divider_y,
        "num_rows": num_rows,
        "row_height": row_height,
        "col_widths_scaled": col_widths_scaled,
        "col_start_x": col_start_x,
        "col_end_x": col_end_x,
    }


def generate_svg_table(
    data: List[Dict],
    cols: Optional[List[str]] = None,
    headers: Optional[List[str]] = None,
    font_size_pt: int = 14,
    svg_size: Tuple[int, int] = (800, 500),
    justifications: Optional[List[str]] = None,
    col_widths: Optional[List[float]] = None,
) -> str:
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

    layout = _compute_table_layout(
        data_length=len(data),
        svg_size=svg_size,
        font_size_pt=font_size_pt,
        col_count=num_cols,
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

    parts.append(
        f'<svg width="{svg_width}" height="{svg_height}" '
        f'viewBox="0 0 {svg_width} {svg_height}" '
        f'xmlns="http://www.w3.org/2000/svg">'
    )

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

    # Header divider
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
            value = row_data.get(key, "")
            align = just[col_index]
            x, anchor = get_text_position(col_index, align)
            parts.append(
                f'<text x="{x}" y="{center_y}" class="cell" '
                f'text-anchor="{anchor}">{escape_xml(value)}</text>'
            )

    parts.append("</svg>")
    return "\n".join(parts)


def generate_highlight_overlay(
    kind: Literal["row", "column", "cell"],
    *,
    data_length: int,
    svg_size: Tuple[int, int],
    font_size_pt: int,
    col_count: int,
    col_widths: Optional[List[float]] = None,
    row_index: Optional[int] = None,
    col_index: Optional[int] = None,
    color_rgb: str = "rgb(221,232,185)",  # Tea
    opacity: float = 0.5,
) -> str:
    if kind not in ("row", "column", "cell"):
        raise ValueError("kind must be 'row', 'column', or 'cell'.")
    if data_length <= 0:
        raise ValueError("data_length must be positive.")
    if col_count <= 0:
        raise ValueError("col_count must be positive.")

    layout = _compute_table_layout(
        data_length=data_length,
        svg_size=svg_size,
        font_size_pt=font_size_pt,
        col_count=col_count,
        col_widths=col_widths,
    )

    svg_width = layout["svg_width"]
    svg_height = layout["svg_height"]
    header_divider_y = layout["header_divider_y"]
    row_height = layout["row_height"]
    col_start_x = layout["col_start_x"]
    col_end_x = layout["col_end_x"]

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
    parser = argparse.ArgumentParser(description="Generate SVG table + optional highlights from JSON.")
    parser.add_argument("json_file", help="Path to input JSON file (e.g., Scott.json)")
    parser.add_argument("--cols", nargs="*", help="Column keys to include (default: all keys from first row)")
    parser.add_argument("--headers", nargs="*", help="Custom header labels (must match number of cols)")
    parser.add_argument("--justify", nargs="*", help="Per-column alignment codes: L, C, R")
    parser.add_argument("--colwidths", nargs="*", type=float, help="Relative column widths (will be scaled)")
    parser.add_argument("--fontsize", type=int, default=14, help="Font size in pt (default: 14)")
    parser.add_argument("--size", nargs=2, type=int, metavar=("WIDTH", "HEIGHT"), default=[800, 500],
                        help="SVG size, e.g. --size 1400 820")

    # Row highlight: row index + color name
    parser.add_argument("--rowhighlight", nargs=2, metavar=("ROW_INDEX", "COLOR_NAME"),
                        help="Highlight a row, e.g. --rowhighlight 16 Robin")

    # Column highlight: col index + color name
    parser.add_argument("--colhighlight", nargs=2, metavar=("COL_INDEX", "COLOR_NAME"),
                        help="Highlight a column, e.g. --colhighlight 3 Tea")

    # Cell highlight: row index, col index, color name
    parser.add_argument("--cellhighlight", nargs=3, metavar=("ROW_INDEX", "COL_INDEX", "COLOR_NAME"),
                        help="Highlight a cell, e.g. --cellhighlight 8 4 Cinnabar")

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
    col_widths = args.colwidths
    font_size_pt = args.fontsize

    # Base name for outputs (Scott.json -> Scott)
    base_name = json_path.stem

    # Generate base table
    table_svg = generate_svg_table(
        data,
        cols=cols,
        headers=headers,
        font_size_pt=font_size_pt,
        svg_size=(svg_width, svg_height),
        justifications=justifications,
        col_widths=col_widths,
    )

    base_svg_path = unique_path(json_path.with_suffix(".svg"))
    with open(base_svg_path, "w", encoding="utf-8") as f:
        f.write(table_svg)
    print(f"Base table saved to: {base_svg_path}")

    col_count = len(cols) if cols else len(data[0])
    data_length = len(data)

    # Row highlight
    if args.rowhighlight:
        row_idx_str, color_name = args.rowhighlight
        row_index = int(row_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "row",
            data_length=data_length,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_count=col_count,
            col_widths=col_widths,
            row_index=row_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_row_{row_index}_{color_name}.svg"
        path = unique_path(json_path.with_name(name))
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        print(f"Row highlight saved to: {path}")

    # Column highlight
    if args.colhighlight:
        col_idx_str, color_name = args.colhighlight
        col_index = int(col_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "column",
            data_length=data_length,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_count=col_count,
            col_widths=col_widths,
            col_index=col_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_col_{col_index}_{color_name}.svg"
        path = unique_path(json_path.with_name(name))
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        print(f"Column highlight saved to: {path}")

    # Cell highlight
    if args.cellhighlight:
        row_idx_str, col_idx_str, color_name = args.cellhighlight
        row_index = int(row_idx_str)
        col_index = int(col_idx_str)
        color_rgb = color_from_name(color_name)
        overlay_svg = generate_highlight_overlay(
            "cell",
            data_length=data_length,
            svg_size=(svg_width, svg_height),
            font_size_pt=font_size_pt,
            col_count=col_count,
            col_widths=col_widths,
            row_index=row_index,
            col_index=col_index,
            color_rgb=color_rgb,
            opacity=0.5,
        )
        name = f"{base_name}_cell_{row_index}_{col_index}_{color_name}.svg"
        path = unique_path(json_path.with_name(name))
        with open(path, "w", encoding="utf-8") as f:
            f.write(overlay_svg)
        print(f"Cell highlight saved to: {path}")


if __name__ == "__main__":
    main()
