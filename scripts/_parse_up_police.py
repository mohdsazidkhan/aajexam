"""Parse UP Police Constable papers (2024+, Testbook docx format).

Source format:
  - Paper docx stream has `Que. N\\t<question text>` then 4 option paragraphs.
  - Last 4 non-empty paragraphs before next `Que.` are the 4 options.
  - Options may have `N.\\t` prefix or be bare text.
  - Answer is INLINE as `Correct Option - X` (X in 1..4) after each Q.
  - Detailed solution follows (Given:/Calculations:/etc.) — captured into `sol`.
  - 150 questions total. Sections often interleaved (Hindi block in middle).
  - Section detection: Q-number range layout (configurable per paper).

Output: _questions_<slug>.json with {n, section, q, q_image, opts[4], opt_images[4], answer, sol}

Usage: _parse_up_police.py <stream_file> <answer_key_pdf|-> <slug> [section_layout]
  section_layout: comma-separated like "NUM:1-37+137-150,REA:38-74,GK:75-98,HIN:99-136"
  default: 'NUM:1-37+137-150,REA:38-74,GK:75-98,HIN:99-136'
"""
import sys, re, json, os
from pypdf import PdfReader
import warnings, logging
warnings.filterwarnings('ignore'); logging.disable(logging.CRITICAL)

NUM_QS = 150
NUM_OPTS = 4

if len(sys.argv) < 4:
    print(__doc__); sys.exit(1)

stream_file, ak_pdf, slug = sys.argv[1], sys.argv[2], sys.argv[3]
ak_pdf = ak_pdf if ak_pdf and ak_pdf != '-' else ''
layout_arg = sys.argv[4] if len(sys.argv) > 4 else 'NUM:1-37+137-150,REA:38-74,GK:75-98,HIN:99-136'

SECTION_NAMES = {
    'NUM': 'Numerical & Mental Ability',
    'REA': 'Mental Aptitude / Reasoning',
    'GK': 'General Knowledge',
    'HIN': 'General Hindi',
}
def parse_layout(layout):
    """Parse 'NUM:1-37+137-150,REA:38-74,GK:75-98,HIN:99-136' -> {q_num: section_name}.
    Supports '+'-joined multi-range per section (UP Police paper has discontiguous Numerical).
    """
    out = {}
    for part in layout.split(','):
        code, ranges = part.split(':')
        for rng in ranges.split('+'):
            a, b = rng.split('-')
            for q in range(int(a), int(b)+1):
                out[q] = SECTION_NAMES.get(code.strip(), code.strip())
    return out

section_for = parse_layout(layout_arg)

with open(stream_file, encoding='utf-8') as f:
    stream = f.read()

# --- Find question markers, accept any N > previous (skip-tolerant) ---
# Supported marker styles:
#   "Que. 1\t...", "Que. 1 ...", "Q1. ...", "Q1 ..." — auto-detected.
# PDF text extraction (esp. 2021+) can lose some markers; we accept skips and fill
# missing Q records with empty placeholders.
QMARK_RE = re.compile(r'(?:^|\n)\s*(?:Que\.\s*|Q(?=\d))(\d{1,3})(?:\.|\b)')
qm = []
prev_n = 0
for m in QMARK_RE.finditer(stream):
    n = int(m.group(1))
    if n > prev_n and n <= NUM_QS:
        # Stop scanning if we hit the Solutions section (avoids matching "S<N>" duplicates)
        # — but only if Solutions header was seen before this match
        pre = stream[:m.start()]
        if 'Solutions' in pre and 'Solutions' in stream[stream.rfind('\n', 0, m.start()):m.start()+50]:
            continue
        qm.append((n, m.start(), m.end()))
        prev_n = n
print(f'Q markers detected (skip-tolerant): {len(qm)}; numbers: {[n for n,_,_ in qm][:5]}...{[n for n,_,_ in qm][-5:]}')

# Trim the stream so blocks don't bleed into the Solutions section
sol_idx = stream.find('\nSolutions\n')
if sol_idx < 0:
    sol_idx = stream.find('\nSolution\n')
if sol_idx > 0:
    # Drop any qm markers past the Solutions boundary
    qm = [(n, s, e) for n, s, e in qm if s < sol_idx]
    # And clip blocks below
    stream_q = stream[:sol_idx]
    stream_sol = stream[sol_idx:]
else:
    stream_q = stream
    stream_sol = ''


# --- Build blocks: text between Q-N start and Q-N+1 start ---
# Use stream_q (truncated at Solutions section if present) so option detection
# doesn't bleed into the solutions text. Also truncate each block at any
# `Directions (M-..):` header — those introduce a new Q block's preamble and any
# trailing content (chart legends, etc.) belongs to the next block, not this one.
NEXT_DIR_RE = re.compile(r'(?:\n\s*|(?<=\d))Directions?\s*\(\s*\d+\s*[-–]\s*\d+\s*\)', re.I)
blocks = []
for i, (n, s, e) in enumerate(qm):
    next_s = qm[i+1][1] if i+1 < len(qm) else len(stream_q)
    raw = stream_q[e:next_s]
    # Trim trailing Directions(M-N) preamble if present. If Directions appears
    # mid-line (preceded by chart garbage like "800...ABCDE..."), walk back to the
    # start of that line so the whole chart-garbage line is dropped too.
    dir_m = NEXT_DIR_RE.search(raw)
    if dir_m:
        cut = dir_m.start()
        last_nl = raw.rfind('\n', 0, cut)
        if last_nl >= 0:
            cut = last_nl
        raw = raw[:cut]
    blocks.append((n, raw))

# --- Extract SHARED OPTIONS from Direction blocks ---
# Some question types (statement-conclusion, quadratic equations, syllogism) list the
# 5 options ONCE in the `Directions (N-M):` block, and individual Q blocks don't repeat
# them. Detect these and apply the shared options to Q-N..Q-M when they lack own options.
SHARED_DIR_RE = re.compile(r'Directions?\s*\(\s*(\d+)\s*[-–]\s*(\d+)\s*\)\s*[:.]?\s*([^\n]*)', re.I)
shared_options = {}  # q_num -> [opt1..opt5]
for m in SHARED_DIR_RE.finditer(stream_q):
    start_n, end_n = int(m.group(1)), int(m.group(2))
    # Find next Q-start at or after this Direction
    nxt = QMARK_RE.search(stream_q[m.end():])
    if not nxt: continue
    dir_block = stream_q[m.end():m.end() + nxt.start()]
    paras = [p.strip() for p in dir_block.split('\n') if p.strip()]
    # Need at least 5 paragraphs as candidate options
    if len(paras) < 5: continue
    candidate = paras[-NUM_OPTS:]
    # Heuristic: shared options usually start with "If", "Only", "Both", "Neither",
    # "All", "None", or contain keywords like "true", "follows" — but also accept any
    # 5 short paragraphs as a fallback.
    optish = sum(1 for p in candidate if re.match(r'^(If|Only|Both|Neither|All|None|Either|x\s*[<>=≥≤])', p, re.I) or len(p) < 80)
    if optish >= 3:
        # Strip leading numeric prefix on each option (some papers have "1. If ..." etc.)
        cleaned = [re.sub(r'^\s*%*\s*[1-5]\.\s*\t?\s*', '', c).strip() for c in candidate]
        for q in range(start_n, end_n+1):
            if 1 <= q <= 100:
                shared_options[q] = cleaned

# --- For each block: extract question text + 5 options ---
# Option detection strategy:
#   Path A: find lines starting with optional "%%" then "N." (N=1..5). If 5 found and monotonic,
#           use them as option boundaries — content extends until next option (so fractions split
#           across paragraphs like `%%1.\t66 2` / `%` / `%` / `3` get reassembled).
#   Path B: fallback to "last 5 non-empty paragraphs are options" (for papers with bare options).
OPT_NUMERIC_RE = re.compile(r'^\s*%*\s*([1-5])\.\s*\t?\s*(.*)$')
OPT_PREFIX_STRIP = re.compile(r'^\s*%*\s*[1-5]\.\s*\t?\s*')

# Strip duplicated "Que.N\tDirection..." artifacts left over from multi-column docx layouts.
# Three cleanup steps:
#  (1) within a single paragraph, drop inline `\tQue. N\t<repeat>` repeats of leading text
#  (2) dedupe consecutive identical paragraphs (multi-col table-header echo)
#  (3) at paragraph level, drop a paragraph that begins with `Que. N\t<text>` if <text>
#      is identical (or a prefix) of the previous kept paragraph's text
def dedupe_paragraphs(paras, qnum):
    out = []
    img_re = re.compile(r'\[\[IMG:[^\]]+\]\]')
    for p in paras:
        # Step 1: collapse inline `<x>\tQue. <qnum>\t<x>` duplication. Compare with
        # image markers stripped, but preserve them in the kept segment.
        seg = re.split(rf'\tQue\.\s*{qnum}\t', p)
        if len(seg) > 1:
            seg_clean = [img_re.sub('', s).strip() for s in seg]
            non_empty = [s for s in seg_clean if s]
            if non_empty and all(s == non_empty[0] or non_empty[0].startswith(s) or s.startswith(non_empty[0]) for s in non_empty):
                # Reassemble: take longest segment (which retains image marker) as canonical
                canonical = max(seg, key=lambda s: len(s.strip()))
                p = canonical
        # Remove the leading "Que. N\t" so paragraphs are comparable
        norm = re.sub(rf'^\s*Que\.\s*{qnum}\t', '', p).strip()
        if not norm:
            out.append(p)
            continue
        # Step 2 & 3: skip ONLY on exact match with most recent non-empty paragraph.
        # Prefix matching is too aggressive — it eats "Brother-in-law" after "Brother",
        # "Mother" after "Father", etc. Inline dup-on-same-line is handled by Step 1.
        # Skip short paragraphs entirely from dedup (fraction parts like "%", "3").
        if len(norm) >= 8:
            prev_norm = None
            for q in reversed(out):
                qn = re.sub(rf'^\s*Que\.\s*{qnum}\t', '', img_re.sub('', q)).strip()
                if qn:
                    prev_norm = qn
                    break
            cur_norm_no_img = img_re.sub('', norm).strip()
            if prev_norm and cur_norm_no_img == prev_norm:
                continue
        out.append(p)
    return out

# Fraction reassembly: collapse "<n>\n%\n%\n<d>" → "<n>/<d> %" inside option text
# Fraction patterns in docx-extracted IBPS papers:
#   4-paragraph form: `<n>\n%\n%\n<d>` → `<n>/<d> %`
#   2-paragraph form: `<n> %\n<d>`     → `<n>/<d> %`  (only when n is single-digit, last in option)
FRAC_PATTERN_4PARA = re.compile(r'(\d+)\s*\n\s*%\s*\n\s*%\s*\n\s*(\d+)')
def fix_fractions(text):
    prev = None
    while prev != text:
        prev = text
        text = FRAC_PATTERN_4PARA.sub(r'\1/\2 %', text)
    # Inline post-join variants
    text = re.sub(r'(\d+)\s+%\s+%\s+(\d+)', r'\1/\2 %', text)
    # 2-paragraph variant: `<whole> <num> %\n<den>` (e.g., "37 1 %\n2" → "37 1/2 %")
    text = re.sub(r'(\d+\s+\d+)\s*%\s*\n\s*(\d+)\b', r'\1/\2 %', text)
    # Inline post-join 2-para variant: `<whole> <num> % <den>` at end → `<whole> <num>/<den> %`
    text = re.sub(r'(\d+\s+\d+)\s+%\s+(\d+)\s*$', r'\1/\2 %', text)
    return text

# Some papers (2020+) embed the answer inline as "Correct Option - N" at the end of each
# Que. block. Strip these lines from option detection so they don't get mistaken for an option.
CORRECT_OPT_RE = re.compile(r'^\s*Correct\s*Option\s*-?\s*\d', re.I)

def parse_block(raw, qnum):
    # UP Police paper has `Correct Option - X` followed inline by detailed solution
    # text on subsequent lines (Given:/Calculations:/etc.). Truncate the WHOLE block
    # at the first Correct Option line so the solution doesn't leak into option N.
    co_match = re.search(r'(?m)^\s*Correct\s*Option\s*-?\s*\d', raw)
    if co_match:
        raw = raw[:co_match.start()].rstrip()
    paras = [p.strip() for p in raw.split('\n')]
    paras = dedupe_paragraphs(paras, qnum)
    # Defensive: still strip any inline Correct Option lines that survived
    paras = [p for p in paras if not CORRECT_OPT_RE.match(p)]
    non_empty_idx = [i for i, p in enumerate(paras) if p]
    # Need at least NUM_OPTS+1 non-empty paragraphs (1 question + N options).
    if len(non_empty_idx) < NUM_OPTS + 1:
        return raw.strip(), [''] * NUM_OPTS, '', [''] * NUM_OPTS

    # --- Path A: numeric-prefix option detection ---
    opt_markers = []  # list of (option_num, para_idx)
    for i in non_empty_idx:
        m = OPT_NUMERIC_RE.match(paras[i])
        if m:
            opt_markers.append((int(m.group(1)), i))
    # Keep monotonic 1..5
    monotonic = []
    exp = 1
    for nn, idx in opt_markers:
        if nn == exp:
            monotonic.append((nn, idx))
            exp += 1
        if exp > NUM_OPTS: break

    # Accept 4+ monotonic markers for Path A — handles papers shipping with only 4 options.
    if len(monotonic) >= NUM_OPTS - 1:  # accept N or N-1 markers
        first_opt_idx = monotonic[0][1]
        q_lines = paras[:first_opt_idx]
        # Build option texts by gathering paragraphs from each marker to next marker
        opts = []
        for j, (nn, idx) in enumerate(monotonic):
            end_idx = monotonic[j+1][1] if j+1 < len(monotonic) else len(paras)
            joined = '\n'.join(paras[idx:end_idx])
            # Strip leading "N." or "%N.\t" prefix on the first line, then collapse fractions
            joined = OPT_PREFIX_STRIP.sub('', joined, count=1)
            joined = fix_fractions(joined)
            # Final normalisation: drop interior empty lines, collapse whitespace
            joined = re.sub(r'\s+', ' ', joined).strip()
            opts.append(joined)
    else:
        # --- Path B: last 5 non-empty paragraphs ---
        opt_idxs = non_empty_idx[-NUM_OPTS:]
        q_lines = paras[:opt_idxs[0]]
        opts = [OPT_PREFIX_STRIP.sub('', paras[i]).strip() for i in opt_idxs]

    # Also strip any remaining "Que. N\t" prefix from each question paragraph
    q_lines = [re.sub(rf'^\s*Que\.\s*{qnum}\t', '', l).strip() for l in q_lines]
    q_text = '\n'.join(l for l in q_lines if l).strip()

    # Extract any image refs in question / options.
    # NB: returns ALL question images as a list (multiple charts on same Q like 2023 pie pair).
    img_re = re.compile(r'\[\[IMG:([^\]]+)\]\]')
    q_imgs = img_re.findall(q_text)
    q_text = img_re.sub('', q_text).strip()
    opt_imgs = []
    for i, o in enumerate(opts):
        imgs = img_re.findall(o)
        opts[i] = img_re.sub('', o).strip()
        opt_imgs.append(imgs[0] if imgs else '')
    return q_text, opts, q_imgs, opt_imgs

# --- Parse answer key ---
# Sources in priority order:
#   1. AK PDF (if provided) — formats: "Que. N Correct Option - X" or tabular "<num> <ans>".
#   2. Inline "Correct Option - N" inside each Que. block in the paper stream (memory-based papers).
PAT_A = re.compile(r'Que\.\s*(\d{1,3})\s*Correct\s*Option\s*-?\s*([1-5])', re.I)
PAT_B = re.compile(r'\b(\d{1,3})\s+([1-5])\b')
ans_map = {}

if ak_pdf:
    rk = PdfReader(ak_pdf)
    ak_text = ''.join(p.extract_text() + '\n' for p in rk.pages)
    for n, a in PAT_A.findall(ak_text):
        ans_map[int(n)] = int(a)
    if len(ans_map) < 100:
        for n, a in PAT_B.findall(ak_text):
            n_i = int(n)
            if 1 <= n_i <= NUM_QS and n_i not in ans_map:
                ans_map[n_i] = int(a)

# Fallback / supplement: extract inline `Correct Option - N` from paper stream per Q block
if len(ans_map) < 100:
    for n, raw in blocks:
        if n in ans_map: continue
        m = re.search(r'Correct\s*Option\s*-?\s*([1-5])', raw, re.I)
        if m:
            ans_map[n] = int(m.group(1))

# Fallback: Adda247-style Solutions section at end of stream with `S<N>. Ans. (X)` lines
if len(ans_map) < 100 and stream_sol:
    SOL_PAT = re.compile(r'(?:^|\n|\]\])\s*S(\d{1,3})\.\s*Ans\.?\s*\(?([a-eA-E])\)?', re.I)
    for nstr, letter in SOL_PAT.findall(stream_sol):
        n_i = int(nstr)
        if 1 <= n_i <= NUM_QS and n_i not in ans_map:
            # Convert letter a-e/A-E to digit 1-5
            ans_map[n_i] = ord(letter.upper()) - ord('A') + 1

print(f'Answer key entries: {len(ans_map)} (source: {"AK PDF + inline + solutions" if ak_pdf else "inline + solutions"})')

# Extract per-question solution text from the Solutions section (Adda247-style papers)
solutions_text = {}
if stream_sol:
    SOL_PAT = re.compile(r'(?:^|\n|\]\])\s*S(\d{1,3})\.\s*Ans\.?\s*\(?[a-eA-E]\)?', re.I)
    matches = list(SOL_PAT.finditer(stream_sol))
    for i, m in enumerate(matches):
        n = int(m.group(1))
        next_start = matches[i+1].start() if i+1 < len(matches) else len(stream_sol)
        block = stream_sol[m.end():next_start]
        # Drop "Sol." prefix; collapse whitespace; strip image markers
        block = re.sub(r'^\s*Sol\.?\s*:?\s*', '', block).strip()
        block = re.sub(r'\[\[IMG:[^\]]+\]\]', '', block)
        block = re.sub(r'\s+', ' ', block).strip()
        if 1 <= n <= NUM_QS:
            solutions_text[n] = block[:1500]

# --- Combine multi-image questions into a single stitched image ---
# Some Qs reference >1 chart (e.g. 2023 paper Q36 has 2 pie charts). Stitch them side-by-side
# into a single PNG so the seed's single q_image field renders both charts together.
def stitch_images(image_names, slug, q_num):
    if len(image_names) <= 1:
        return image_names[0] if image_names else ''
    try:
        from PIL import Image
    except ImportError:
        print(f'  WARN: PIL not installed, Q{q_num} will use only first image of {len(image_names)}')
        return image_names[0]
    extracted_dir = f'_extracted_{slug}'
    paths = [os.path.join(extracted_dir, n) for n in image_names if os.path.exists(os.path.join(extracted_dir, n))]
    if len(paths) < 2:
        return image_names[0] if image_names else ''
    imgs = [Image.open(p).convert('RGB') for p in paths]
    # Resize all to the same height (max height), then concat horizontally
    max_h = max(im.height for im in imgs)
    resized = []
    for im in imgs:
        if im.height != max_h:
            new_w = int(im.width * max_h / im.height)
            im = im.resize((new_w, max_h))
        resized.append(im)
    total_w = sum(im.width for im in resized) + 20 * (len(resized) - 1)
    combined = Image.new('RGB', (total_w, max_h), 'white')
    x = 0
    for im in resized:
        combined.paste(im, (x, 0))
        x += im.width + 20
    out_name = f'q{q_num}_combined.png'
    combined.save(os.path.join(extracted_dir, out_name))
    return out_name

# --- Build per-question records ---
parsed_by_n = {}
for n, raw in blocks:
    q_text, opts, q_imgs_list, opt_imgs = parse_block(raw, n)
    parsed_by_n[n] = (q_text, opts, q_imgs_list, opt_imgs)

questions = []
for n in range(1, NUM_QS + 1):
    if n in parsed_by_n:
        q_text, opts, q_imgs_list, opt_imgs = parsed_by_n[n]
    else:
        q_text, opts, q_imgs_list, opt_imgs = '', [''] * NUM_OPTS, [], [''] * NUM_OPTS
    # If this Q has no per-Q options but a shared-options Direction block covers it, use those.
    if (not any(opts) or sum(1 for o in opts if o) < 3) and n in shared_options:
        opts = list(shared_options[n])
    q_img = stitch_images(q_imgs_list, slug, n)
    ans_num = ans_map.get(n, 1)  # 1-5
    ans_letter = chr(ord('A') + ans_num - 1)
    while len(opts) < NUM_OPTS: opts.append('')
    while len(opt_imgs) < NUM_OPTS: opt_imgs.append('')
    questions.append({
        'n': n,
        'section': section_for.get(n, 'Reasoning Ability'),
        'q': q_text,
        'q_image': q_img,
        'opts': opts,
        'opt_images': opt_imgs,
        'answer': ans_letter,
        'sol': solutions_text.get(n, ''),
    })

# --- Image propagation across direction blocks ---
# Direction-block Qs (e.g., a pie-chart used by Q36-40) typically have the image marker
# only on the first Q in the block. Propagate it forward to the next up to 4 Qs in the
# same section, stopping when another image, a new "Direction:" intro, or section change occurs.
DIRECTION_INTRO_RE = re.compile(r'^\s*(Directions?\s*[:∶]|Consider\s+the\s+following|Study\s+the\s+following|Following\s+(pie|bar|line|table|graph))', re.I)

# Snapshot ORIGINAL image-leaders (Qs that had an image directly from parsing),
# then propagate from each one — never from a Q that received its image via propagation.
original_image_leaders = [(i, q['q_image'], q['section']) for i, q in enumerate(questions) if q['q_image']]
for i, propagate_img, cur_sec in original_image_leaders:
    for j in range(1, 5):
        if i + j >= len(questions): break
        nxt = questions[i + j]
        if nxt['section'] != cur_sec: break
        if nxt['q_image']: break  # next block leader or already-propagated — stop
        # Stop if next Q clearly starts a new direction block on its own
        if DIRECTION_INTRO_RE.match(nxt['q'].strip()): break
        nxt['q_image'] = propagate_img

out_file = f'_questions_{slug}.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

# Diagnostics
opt_complete = sum(1 for q in questions if all(q['opts']))
sec_counts = {}
for q in questions:
    sec_counts[q['section']] = sec_counts.get(q['section'], 0) + 1
img_qs = sum(1 for q in questions if q['q_image'])
print(f'\nWrote {out_file}: {len(questions)} questions')
print(f'  Q with all 5 options: {opt_complete}/{len(questions)}')
print(f'  Section distribution: {sec_counts}')
print(f'  Q missing answer:     {sum(1 for q in questions if not q["answer"])}')
print(f'  Q with image:         {img_qs}')
