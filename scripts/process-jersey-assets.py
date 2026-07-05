#!/usr/bin/env python3
"""Build transparent shop jersey assets from clean studio templates."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path("/Users/user/.cursor/projects/Users-user-PyCharmMiscProject/assets")
OUT_DIR = ROOT / "apps/web/public/images/shop"

SOURCES = {
    "front": ASSETS / "jersey-front-clean.png",
    "back": ASSETS / "jersey-back-clean-v2.png",
}

CREST_SOURCE = ASSETS / "image-8655508a-bf3c-40d9-bce0-8f9d29022ca1.png"
TARGET_W = 720


def is_background_color(r: int, g: int, b: int) -> bool:
    if r < 42 and g < 42 and b < 42:
        return True
    if abs(r - g) < 14 and abs(g - b) < 14 and r > 155:
        return True
    return False


def flood_background(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    bg = np.zeros((h, w), dtype=bool)
    seen = np.zeros((h, w), dtype=bool)
    seeds = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]

    for sy, sx in seeds:
        q: deque[tuple[int, int]] = deque([(sy, sx)])
        while q:
            y, x = q.popleft()
            if y < 0 or y >= h or x < 0 or x >= w or seen[y, x]:
                continue
            seen[y, x] = True
            r, g, b = (int(v) for v in rgb[y, x])
            if not is_background_color(r, g, b):
                continue
            bg[y, x] = True
            q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])

    return ~bg


def remove_checkerboard(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    rgb = arr[..., :3]
    jersey_mask = flood_background(rgb)
    alpha = Image.fromarray((jersey_mask.astype(np.uint8) * 255), mode="L")
    alpha = alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    arr[..., 3] = np.array(alpha)
    return Image.fromarray(arr, mode="RGBA")


def rel_box(w: int, h: int, rx0: float, ry0: float, rx1: float, ry1: float) -> tuple[int, int, int, int]:
    return int(w * rx0), int(h * ry0), int(w * rx1), int(h * ry1)


def inpaint_box(img: Image.Image, box: tuple[int, int, int, int], blur_radius: float = 7.0) -> None:
    x0, y0, x1, y1 = box
    pad = max(14, int(min(x1 - x0, y1 - y0) * 0.45))
    sx0 = max(x0 - pad, 0)
    sy0 = max(y0 - pad, 0)
    sx1 = min(x1 + pad, img.width)
    sy1 = min(y1 + pad, img.height)

    region = img.crop((sx0, sy0, sx1, sy1))
    blurred = region.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    patch = blurred.crop((x0 - sx0, y0 - sy0, x1 - sx0, y1 - sy0))
    img.paste(patch, (x0, y0))


def export(side: str, src: Path) -> None:
    img = remove_checkerboard(Image.open(src))
    rgb = ImageEnhance.Sharpness(img.convert("RGB")).enhance(1.08)

    w, h = rgb.size
    if side == "front":
        inpaint_box(rgb, rel_box(w, h, 0.56, 0.23, 0.78, 0.43), blur_radius=6.0)

    out = rgb.convert("RGBA")
    out.putalpha(img.getchannel("A"))
    out = out.resize((TARGET_W, int(out.height * TARGET_W / out.width)), Image.Resampling.LANCZOS)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out.save(OUT_DIR / f"jersey-{side}.png", optimize=True)
    out.save(OUT_DIR / f"jersey-{side}.webp", quality=93, method=6)
    print(f"{side}: {out.size}")


def export_crest(src: Path) -> None:
    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    dark = (r < 42) & (g < 42) & (b < 42)
    arr[dark, 3] = 0
    img = Image.fromarray(arr, mode="RGBA")

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    rgb = ImageEnhance.Sharpness(img.convert("RGB")).enhance(1.06)
    out = rgb.convert("RGBA")
    out.putalpha(img.getchannel("A"))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out.save(OUT_DIR / "favorit-crest.png", optimize=True)
    out.save(OUT_DIR / "favorit-crest.webp", quality=93, method=6)
    print(f"crest: {out.size}")


def main() -> None:
    for side, src in SOURCES.items():
        export(side, src)
    export_crest(CREST_SOURCE)


if __name__ == "__main__":
    main()
