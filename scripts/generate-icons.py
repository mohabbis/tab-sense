#!/usr/bin/env python3
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    raise SystemExit("Install pillow: python3 -m pip install pillow")


def icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (28, 25, 20, 255))
    draw = ImageDraw.Draw(img)
    pad = max(2, size // 12)
    radius = max(3, size // 6)
    draw.rounded_rectangle(
        (pad, pad, size - pad, size - pad),
        radius=radius,
        fill=(42, 37, 29, 255),
    )
    colors = [(224, 177, 90), (111, 179, 184), (224, 122, 95)]
    bar_h = max(2, size // 10)
    gap = max(2, size // 14)
    top = size // 3
    inset = size // 5
    for index, color in enumerate(colors):
        y = top + index * (bar_h + gap)
        draw.rounded_rectangle(
            (inset, y, size - inset, y + bar_h),
            radius=bar_h // 2,
            fill=color + (255,),
        )
    return img


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "extension" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        icon(size).save(out / f"{size}.png")
    print(f"Wrote icons to {out}")


if __name__ == "__main__":
    main()
