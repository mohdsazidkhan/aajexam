"""Parse SSC-style docx (with optional Phase-XII green-tick bullet decoding).

Usage:
    python _parse_docx.py <docx_path> <slug>

Outputs:
    _para_<slug>.txt    -- paragraph-grouped text
    _stream_<slug>.txt  -- text + image refs (decoration filtered)
    _extracted_<slug>/  -- all media files
    _key_<slug>.txt     -- decoded answer key (if Phase-XII tick bullets detected)
"""
import sys, os, re, zipfile, shutil
from xml.etree import ElementTree as ET

if len(sys.argv) != 3:
    print("Usage: python _parse_docx.py <docx_path> <slug>"); sys.exit(1)

docx_path, slug = sys.argv[1], sys.argv[2]
out_para = f"_para_{slug}.txt"
out_stream = f"_stream_{slug}.txt"
out_media = f"_extracted_{slug}"
out_key = f"_key_{slug}.txt"

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

if os.path.isdir(out_media):
    shutil.rmtree(out_media)
os.makedirs(out_media, exist_ok=True)

with zipfile.ZipFile(docx_path) as z:
    rid_to_media = {}
    rels_xml = z.read("word/_rels/document.xml.rels").decode("utf-8")
    rels_root = ET.fromstring(rels_xml)
    for rel in rels_root:
        rid = rel.attrib.get("Id")
        target = rel.attrib.get("Target", "")
        if target.startswith("media/"):
            fname = target.split("/")[-1]
            rid_to_media[rid] = fname
            data = z.read(f"word/{target}")
            with open(os.path.join(out_media, fname), "wb") as f:
                f.write(data)
    doc_xml = z.read("word/document.xml").decode("utf-8")

# Count occurrences for decoration / tick detection
media_counts = {}
for rid, fname in rid_to_media.items():
    pat = re.compile(rf'r:embed="{re.escape(rid)}"')
    n = len(pat.findall(doc_xml))
    media_counts[fname] = media_counts.get(fname, 0) + n

# Decoration heuristic — filter for stream output
decoration = {f for f, n in media_counts.items() if n >= 5}
print(f"Decoration images (>=5 occurrences): {sorted(decoration)}")

root = ET.fromstring(doc_xml)
body = root.find(f"{{{W_NS}}}body")

# Build stream + para text
para_lines, stream_lines = [], []
for p in body.iter(f"{{{W_NS}}}p"):
    text_parts, stream_parts = [], []
    for elem in p.iter():
        tag = elem.tag.split('}', 1)[-1]
        if tag == 't' and elem.text:
            text_parts.append(elem.text); stream_parts.append(elem.text)
        elif tag == 'blip':
            rid = elem.attrib.get(f"{{{R_NS}}}embed", '')
            fname = rid_to_media.get(rid, '')
            if fname and fname not in decoration:
                stream_parts.append(f"[[IMG:{fname}]]")
        elif tag == 'tab':
            text_parts.append('\t'); stream_parts.append('\t')
        elif tag == 'br':
            text_parts.append('\n'); stream_parts.append('\n')
    line = ''.join(text_parts).strip()
    sline = ''.join(stream_parts).strip()
    if line or any(x.startswith('[[IMG:') for x in stream_parts):
        if line: para_lines.append(line)
        if sline: stream_lines.append(sline)

with open(out_para, "w", encoding="utf-8") as f:
    f.write("\n".join(para_lines))
with open(out_stream, "w", encoding="utf-8") as f:
    f.write("\n".join(stream_lines))
print(f"Wrote {out_para} ({len(para_lines)} paras), {out_stream} ({len(stream_lines)} entries)")
print(f"Media: {out_media}/ ({len(rid_to_media)} files)")

# Phase-XII bullet decoder: find the 2 most-frequent rIds (>= ~100 each)
# rId for unchecked bullet (~300 occurrences) vs ticked bullet (~100 occurrences)
rid_counts = {}
for rid in rid_to_media:
    n = len(re.findall(rf'r:embed="{re.escape(rid)}"', doc_xml))
    rid_counts[rid] = n

# Identify candidates: high-count (>= 50), and the smaller one is the tick
hi = sorted(rid_counts.items(), key=lambda kv: -kv[1])
print(f"Top rId counts: {hi[:5]}")

# Heuristic: Find two rIds that are roughly in a 3:1 ratio (empty:tick).
# We assume the total questions could be anything (e.g. 50, 100, 200).
tick_rid = None
empty_rid = None

if len(hi) >= 2:
    # Try to find a pair among the top candidates where one is roughly 3x the other
    # and both are relatively frequent (e.g. > 20)
    for i in range(len(hi)):
        for j in range(i+1, len(hi)):
            rid_a, cnt_a = hi[i]
            rid_b, cnt_b = hi[j]
            if cnt_a < 20 or cnt_b < 20: continue
            
            # Since sorted descending, cnt_a > cnt_b
            ratio = cnt_a / cnt_b
            if 2.5 <= ratio <= 3.5:
                empty_rid = rid_a
                tick_rid = rid_b
                break
        if tick_rid: break

if tick_rid and empty_rid:
    print(f"Decoding key: tick={tick_rid}({rid_counts[tick_rid]}), empty={empty_rid}({rid_counts[empty_rid]})")
    bullets = []
    def walk(elem):
        tag = elem.tag.split('}', 1)[-1]
        if tag == 'blip':
            rid = elem.attrib.get(f"{{{R_NS}}}embed", '')
            if rid in (tick_rid, empty_rid):
                bullets.append('T' if rid == tick_rid else '.')
        for c in elem:
            walk(c)
    walk(body)
    print(f"Total bullets: {len(bullets)} (expect 400 for 100 Qs)")
    answers = []
    for i in range(0, len(bullets) // 4):
        group = bullets[i*4:(i+1)*4]
        try:
            answers.append(group.index('T') + 1)
        except ValueError:
            answers.append(0)  # no tick in this group
    with open(out_key, "w") as f:
        for i, a in enumerate(answers):
            f.write(f"Q{i+1}={a}\n")
    print(f"Wrote {out_key} ({len(answers)} answers)")
    # Per-section print
    secs = ['REA', 'GA', 'QA', 'ENG']
    for si, s in enumerate(secs):
        sub = answers[si*25:(si+1)*25]
        print(f"{s}: {sub}")
else:
    print("Phase-XII tick pattern not detected; skipping key decoding.")
