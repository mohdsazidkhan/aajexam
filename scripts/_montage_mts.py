#!/usr/bin/env python3
"""Build a labeled contact sheet of selected docx-media images for visual mapping.
Usage: python scripts/_montage_mts.py <extract_dir> <out.png> <img_num> [img_num ...]
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

ext = sys.argv[1]
out = sys.argv[2]
nums = [int(x) for x in sys.argv[3:]]

cell_w, cell_h, pad, label_h = 230, 170, 8, 22
cols = 5
rows = (len(nums) + cols - 1) // cols
W = cols * (cell_w + pad) + pad
H = rows * (cell_h + label_h + pad) + pad
sheet = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font = ImageFont.load_default()

for i, n in enumerate(nums):
    r, c = divmod(i, cols)
    x = pad + c * (cell_w + pad)
    y = pad + r * (cell_h + label_h + pad)
    draw.text((x, y), f"image{n}.png", fill="red", font=font)
    p = os.path.join(ext, f"image{n}.png")
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
        im.thumbnail((cell_w, cell_h))
        sheet.paste(im, (x, y + label_h))
        draw.rectangle([x, y + label_h, x + im.width, y + label_h + im.height], outline="black")
    else:
        draw.text((x, y + label_h + 40), "MISSING", fill="gray", font=font)
sheet.save(out)
print(f"Wrote {out} ({W}x{H}) with {len(nums)} images")
