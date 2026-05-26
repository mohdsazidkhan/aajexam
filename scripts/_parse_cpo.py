"""Parse SSC CPO Tier-I docx using the _stream_<slug>.txt output.

Stream has text paragraphs with `[[IMG:imageN.png]]` markers interleaved in proper
docx reading order. This is the ideal source for CPO parsing because:
  - Visual reasoning Qs have image refs we can map to question/option images.
  - Options block patterns are clearer (bare labels "1.\\t2.\\t3.\\t4." vs text labels).

Output: _questions_<slug>.json with {n, section, q, q_image, opts[4], opt_images[4], answer, sol}
"""
import sys
import re
import json

if len(sys.argv) < 2:
    print("usage: _parse_cpo.py <slug>")
    sys.exit(1)

slug = sys.argv[1]
stream_file = f"_stream_{slug}.txt"
para_file = f"_para_{slug}.txt"
out_file = f"_questions_{slug}.json"

with open(stream_file, encoding='utf-8') as f:
    lines = [ln.rstrip() for ln in f.readlines()]
lines = [ln for ln in lines if ln.strip()]

# Detect end of question paper section (Answer Key header) and solutions start (Option (N) is correct)
SOL_RE = re.compile(r'^(?:\d+\.\s+)?Option\s*\(\s*(\d+)\s*\)\s*is\s*correct')
KEY_HEADER_RE = re.compile(r'^Answer\s*Key', re.IGNORECASE)
q_end = sol_start = None
for i, line in enumerate(lines):
    stripped = line.strip()
    if KEY_HEADER_RE.match(stripped) and q_end is None:
        q_end = i
    if SOL_RE.match(stripped):
        sol_start = i
        if q_end is None:
            q_end = i
        break

if sol_start is None:
    print("ERROR: solutions section not found")
    sys.exit(1)
print(f"Q section ends at {q_end}, solutions start at {sol_start} (total {len(lines)})")

q_lines = lines[:q_end]
s_lines = lines[sol_start:]

# ---------- Section detection ----------
SECTIONS = {
    'General Intelligence and Reasoning': 'General Intelligence and Reasoning',
    'General Intelligence & Reasoning': 'General Intelligence and Reasoning',
    'General Knowledge and General Awareness': 'General Awareness',
    'General Awareness': 'General Awareness',
    'Quantitative Aptitude': 'Quantitative Aptitude',
    'English Comprehension': 'English Language'
}
section_keys = list(SECTIONS.keys())

def detect_section_in_line(line):
    """Return (section, remainder) if line starts with a section header
    (after stripping images and leading whitespace)."""
    # Strip image refs
    cleaned, _ = extract_images(line)
    cleaned = cleaned.lstrip(' \t')
    for k in section_keys:
        if cleaned == k:
            return SECTIONS[k], ''
        if cleaned.startswith(k):
            remainder = cleaned[len(k):].strip()
            # Strip repeated duplicate headers (multi-column docx artifacts)
            while True:
                progress = False
                for k2 in section_keys:
                    if remainder.startswith(k2):
                        remainder = remainder[len(k2):].strip()
                        progress = True
                        break
                if not progress:
                    break
            return SECTIONS[k], remainder
    return None, None

# ---------- Image ref extraction ----------
IMG_RE = re.compile(r'\[\[IMG:([^\]]+)\]\]')

def extract_images(text):
    """Return (text_without_imgs, [img_refs])."""
    imgs = IMG_RE.findall(text)
    text_clean = IMG_RE.sub('', text)
    return text_clean, imgs

# ---------- Label detection ----------
LABEL_RE = re.compile(r'(?<![\w.])(\d+)\.(?=[\s\t]|$)')

def find_labels(text):
    return [(m.start(), int(m.group(1)), m.end()) for m in LABEL_RE.finditer(text)]

def parse_options_from_text(text):
    """Extract 4 options from text containing labels 1,2,3,4 (or 2,3,4 with opt1 inferred).
    Returns ([opt1, opt2, opt3, opt4], is_bare) where is_bare=True if all options are empty text.
    Returns None if no valid sequence found.
    """
    labels = find_labels(text)
    nums = [l[1] for l in labels]
    # Try 1,2,3,4
    for start in range(len(labels) - 3):
        seq = [labels[start+k][1] for k in range(4)]
        if seq != [1, 2, 3, 4]:
            continue
        if start + 4 < len(labels) and labels[start+4][1] == 5:
            continue
        opts = []
        for j in range(4):
            ts = labels[start+j][2]
            te = labels[start+j+1][0] if (start+j+1) < len(labels) else len(text)
            opts.append(text[ts:te].strip())
        is_bare = all(not o for o in opts)
        return opts, is_bare, start, labels
    # Try 2,3,4 — opt 1 is text before "2." in entire text
    for start in range(len(labels) - 2):
        seq = [labels[start+k][1] for k in range(3)]
        if seq != [2, 3, 4]:
            continue
        if any(l[1] == 1 for l in labels[:start]):
            continue
        if start + 3 < len(labels) and labels[start+3][1] == 5:
            continue
        m2 = re.search(r'(?<![\w.])2\.(?=[\s\t]|$)', text)
        if not m2:
            continue
        opt1 = text[:m2.start()].strip()
        if not opt1:
            continue
        opts = [opt1]
        for j in range(3):
            ts = labels[start+j][2]
            te = labels[start+j+1][0] if (start+j+1) < len(labels) else len(text)
            opts.append(text[ts:te].strip())
        is_bare = all(not o for o in opts)
        return opts, is_bare, start, labels
    return None

# ---------- Walk question lines ----------
class QState:
    def __init__(self):
        self.text_buf = []
        self.img_buf = []
    def add_text(self, t):
        if t:
            self.text_buf.append(t)
    def add_imgs(self, imgs):
        self.img_buf.extend(imgs)
    def flush_question(self):
        text = ' '.join(self.text_buf).strip()
        text = re.sub(r'^\d+\.[\s\t]+', '', text).strip()
        text = re.sub(r'\s{2,}', ' ', text).strip()
        imgs = list(self.img_buf)
        self.text_buf.clear()
        self.img_buf.clear()
        return text, imgs

questions = []
current_section = None
state = QState()

# Skip leading non-section header lines
i = 0
while i < len(q_lines):
    sec, rem = detect_section_in_line(q_lines[i].strip())
    if sec:
        current_section = sec
        if rem:
            q_lines[i] = rem
        else:
            i += 1
        break
    i += 1

while i < len(q_lines):
    line = q_lines[i].strip()
    if not line:
        i += 1
        continue

    # Section detection
    sec, rem = detect_section_in_line(line)
    if sec is not None:
        current_section = sec
        if rem:
            line = rem
        else:
            i += 1
            continue

    # Try to detect options block at this line (and lookahead)
    detected = None  # tuple: (opts_text[4], opt_images[4], q_image, lines_consumed, source)
    for span in range(1, 5):
        if i + span > len(q_lines):
            break
        combined = '\t'.join(q_lines[i:i+span])
        combined_text, combined_imgs = extract_images(combined)
        result = parse_options_from_text(combined_text)
        if not result:
            continue
        opts, is_bare, _, _ = result

        # First label in line[i]?
        p0_text, p0_imgs = extract_images(q_lines[i])
        p0_labels = find_labels(p0_text)
        if not (p0_labels and p0_labels[0][1] in (1, 2)):
            continue

        if not is_bare:
            # Normal text options. Question image = first image in q_lines[i] (if any) AND state.img_buf accumulated images
            q_img_candidates = state.img_buf + p0_imgs
            q_image = q_img_candidates[0] if q_img_candidates else ''
            detected = (opts, ['', '', '', ''], q_image, span, 'text')
            break
        else:
            # Bare labels. Options come from images or preceding text paragraphs.
            # Priority 1: images in current line[i..i+span-1] (combined_imgs)
            if len(combined_imgs) >= 4:
                # The last 4 images before labels are option images
                # If 5+ images, first is question image, last 4 are options
                if len(combined_imgs) >= 5:
                    q_image = combined_imgs[0]
                    opt_imgs = combined_imgs[1:5]
                else:
                    q_image = ''
                    opt_imgs = combined_imgs[-4:]
                detected = (['', '', '', ''], opt_imgs, q_image, span, 'image-inline')
                break
            # Priority 2: images in state.img_buf (accumulated from prior question text)
            if len(state.img_buf) >= 4:
                opt_imgs = state.img_buf[-4:]
                q_image_candidates = state.img_buf[:-4] + combined_imgs
                q_image = q_image_candidates[0] if q_image_candidates else ''
                # Remove option imgs from state buffer
                state.img_buf = state.img_buf[:-4]
                detected = (['', '', '', ''], opt_imgs, q_image, span, 'image-buf')
                break
            # Priority 3: last 4 text paragraphs in state.text_buf are option texts
            text_candidates = [t for t in state.text_buf if t.strip() and not LABEL_RE.search(t)]
            if len(text_candidates) >= 4:
                last4 = text_candidates[-4:]
                # Sanity: option texts shouldn't be too long or end with '?'
                if all(len(t) < 300 and not t.endswith('?') for t in last4):
                    # Use these as options. Remove from text_buf.
                    new_buf = []
                    to_skip = 4
                    for t in reversed(state.text_buf):
                        if to_skip > 0 and t.strip() and not LABEL_RE.search(t):
                            to_skip -= 1
                            continue
                        new_buf.append(t)
                    new_buf.reverse()
                    state.text_buf = new_buf
                    q_image = (state.img_buf + combined_imgs)[0] if (state.img_buf or combined_imgs) else ''
                    detected = (last4, ['', '', '', ''], q_image, span, 'text-prev')
                    break
            # Priority 4: combined_imgs has 1-3 images (partial). Treat what we have as opt_imgs, pad with ''.
            if combined_imgs:
                opt_imgs = (combined_imgs + ['', '', '', ''])[:4]
                detected = (['', '', '', ''], opt_imgs, '', span, 'image-partial')
                break
            # Last resort: bare labels with no source — empty options
            detected = (['', '', '', ''], ['', '', '', ''], '', span, 'empty-bare')
            break

    if detected:
        opts_text, opt_images, q_image_from_block, consumed, source = detected
        q_text, q_imgs = state.flush_question()
        # If we already have a q_image from block, prefer block-image; else use buffered images
        question_image = q_image_from_block or (q_imgs[0] if q_imgs else '')
        questions.append({
            'section': current_section,
            'q': q_text,
            'q_image': question_image,
            'opts': opts_text,
            'opt_images': opt_images,
            'source': source
        })
        i += consumed
        continue

    # Not options — accumulate
    text_only, imgs = extract_images(line)
    state.add_text(text_only)
    state.add_imgs(imgs)
    i += 1

print(f"Parsed {len(questions)} questions")
section_counts = {}
for q in questions:
    section_counts[q['section']] = section_counts.get(q['section'], 0) + 1
print(f"Section counts: {section_counts}")

# ---------- Parse solutions ----------
solutions = []
current_sol = []
current_answer = None
for line in s_lines:
    stripped = line.strip()
    m = SOL_RE.match(stripped)
    if m:
        if current_answer is not None:
            solutions.append({
                'answer': current_answer,
                'sol': ' '.join(current_sol).strip()[:1500]
            })
        current_answer = int(m.group(1))
        rest = SOL_RE.sub('', stripped).strip()
        current_sol = [rest] if rest else []
    else:
        current_sol.append(stripped)
if current_answer is not None:
    solutions.append({
        'answer': current_answer,
        'sol': ' '.join(current_sol).strip()[:1500]
    })
print(f"Parsed {len(solutions)} solutions")

# ---------- Merge ----------
total = max(len(questions), len(solutions), 200)
result = []
for idx in range(total):
    q = questions[idx] if idx < len(questions) else {'section': 'Unknown', 'q': '', 'q_image': '', 'opts': ['', '', '', ''], 'opt_images': ['', '', '', '']}
    s = solutions[idx] if idx < len(solutions) else {'answer': 1, 'sol': ''}
    result.append({
        'n': idx + 1,
        'section': q.get('section'),
        'q': q['q'],
        'q_image': q.get('q_image', ''),
        'opts': q['opts'],
        'opt_images': q.get('opt_images', ['', '', '', '']),
        'answer': {1: 'A', 2: 'B', 3: 'C', 4: 'D'}.get(s['answer'], 'A'),
        'sol': s['sol']
    })

with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f"Wrote {out_file} with {len(result)} entries")

incomplete = [q['n'] for q in result if not (all(q['opts']) or all(q['opt_images'])) or len(q['q']) < 5]
print(f"Q with issues: {len(incomplete)} -> {incomplete[:30]}")
