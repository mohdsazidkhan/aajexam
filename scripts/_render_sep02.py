import fitz, os

BASE = "D:/Sazid/AajExam/Exams PYQ's/RRC Group D/2022/september/02"
for s in (1, 2, 3):
    pdf = f"{BASE}/shift-{s}/RRC-Group-D-Level-1-2019-PYP-2-Sep-2022-S{s}.pdf"
    outdir = f"_render_sep02s{s}"
    os.makedirs(outdir, exist_ok=True)
    doc = fitz.open(pdf)
    print(f"Shift {s}: {doc.page_count} pages -> {outdir}")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=200)
        pix.save(f"{outdir}/p{i+1:03d}.png")
    doc.close()
print("done")
