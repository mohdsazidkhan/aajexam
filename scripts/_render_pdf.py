"""Render a PDF to PNG pages at given DPI into an output dir.
Usage: python _render_pdf.py <pdf_path> <out_dir> [dpi]
"""
import sys, os, fitz

pdf_path, out_dir = sys.argv[1], sys.argv[2]
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 200
os.makedirs(out_dir, exist_ok=True)
doc = fitz.open(pdf_path)
zoom = dpi / 72.0
mat = fitz.Matrix(zoom, zoom)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=mat)
    pix.save(os.path.join(out_dir, f"p{i+1:03d}.png"))
print(f"Rendered {doc.page_count} pages -> {out_dir} @ {dpi}dpi")
