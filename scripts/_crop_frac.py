#!/usr/bin/env python3
"""Crop a region from a rendered page using fractional coords (0..1).
Usage: python scripts/_crop_frac.py <page.png> <out.png> <l> <t> <r> <b>
"""
import sys
from PIL import Image
page, out, l, t, r, b = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:7])
im = Image.open(page)
W, H = im.size
box = (int(l*W), int(t*H), int(r*W), int(b*H))
im.crop(box).save(out)
print(f"{page} {im.size} -> {out} crop={box}")
