#!/usr/bin/env python3
"""Assemble a full 2020-era Delhi Police paper from the two decoders:
  _questions_<slug>.json  -> text sections (GK Part A 1-50, Computer Part D 91-100)
  _img2020_<slug>.json    -> image sections (Reasoning 51-75, Numerical 76-90), composites
Writes _final_<slug>.json and copies composite PNGs to <seedimg>/<date>-q-<n>.png.
Per-paper GK Hindi/text answer patches are passed inline.

Usage: python scripts/_assemble_dpc2020.py <slug> <date-slug> <seedimg-dir>
"""
import json, sys, os, shutil

slug, DATE, SEEDIMG = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(SEEDIMG, exist_ok=True)
GK = 'General Knowledge / Current Affairs'
REA = 'Reasoning / Logical Ability'
NUM = 'Numerical Ability (Quantitative Aptitude)'
COMP = 'Computer Awareness / Fundamentals'

pdfq = json.load(open(f'_questions_{slug}.json', encoding='utf-8'))
imgq = json.load(open(f'_img2020_{slug}.json', encoding='utf-8'))   # ordered: Part B then Part C
by_n = {q['n']: q for q in pdfq}
gk = sorted([q for q in pdfq if q['section'] == GK], key=lambda x: x['n'])[:50]
comp = sorted([q for q in pdfq if q['section'] == COMP], key=lambda x: x['n'])

# ---- GK answer/text patches (read off the rendered response sheet) ----
# Hindi questions whose Devanagari did not extract from the PDF -> transcribed here.
PATCH = {
 10: {'ans': 0},
 38: {'ans': 0},
 23: {'ans': 3, 'stem': '_____ जनसंख्या की समय-समय पर की जाने वाली एक आधिकारिक प्रगणना है।',
      'opts': ['ड्राफ्ट', 'क्लॉज', 'रिकॉर्ड', 'सेंसस']},
 41: {'ans': 0, 'stem': 'निम्नलिखित में से कौन सी आर्थिक योजना, गैर-कॉर्पोरेट, गैर-कृषि क्षेत्र, सूक्ष्म और '
      'लघु उद्यमों के लिए डिज़ाइन की गई एक पहल है, जिनकी क्रेडिट जरूरतें ₹10 लाख से कम हैं?',
      'opts': ['प्रधानमंत्री मुद्रा योजना', 'राष्ट्रीय कृषि योजना', 'खुशहाल समृद्धि योजना',
               'राष्ट्रीय स्वास्थ्य बीमा योजना']},
 47: {'ans': 2, 'stem': '_____ में ऐसे पेड़ होते हैं जिनमें पत्तियों के बजाय सुइयां उगती हैं और '
      'फूलों के बजाय शंकु होते हैं।',
      'opts': ['शीतोष्ण घास के मैदान', 'समशीतोष्ण वर्षावन', 'शंकुधारी सदाबहार वन', 'शीतोष्ण पर्णपाती वन']},
}

final = []
# --- GK 1-50 ---
gk_by_n = {q['n']: q for q in gk}
for n in range(1, 51):
    q = gk_by_n.get(n)
    if q is None:
        raise SystemExit(f'GK question n={n} missing from parser output')
    stem = q['questionText']; opts = q['options'][:]; ans = q['answerIndex']
    if n in PATCH:
        p = PATCH[n]
        ans = p['ans']
        if 'stem' in p: stem = p['stem']
        if 'opts' in p: opts = p['opts']
    final.append({'n': n, 'section': GK, 'questionText': stem, 'options': opts,
                  'answerIndex': ans, 'explanation': ''})

# --- Reasoning 51-75 (first 25 image Qs) ; Numerical 76-90 (next 15) ---
IMG_STEM = {REA: 'Study the question figure and options shown in the image below, and select '
                 'the correct option.',
            NUM: 'Solve the question shown in the image below and select the correct option.'}
def add_image_q(n, section, src_img):
    dst = f'{DATE}-q-{n}.png'
    shutil.copy(os.path.join(f'_img2020_{slug}', src_img), os.path.join(SEEDIMG, dst))
    final.append({'n': n, 'section': section, 'questionText': IMG_STEM[section],
                  'options': ['1', '2', '3', '4'], 'answerIndex': imgq_ordered[idx]['answerIndex'],
                  'explanation': ''})

imgq_ordered = imgq   # already Part B then Part C order
for k in range(25):     # reasoning
    idx = k
    add_image_q(51 + k, REA, imgq_ordered[idx]['image'])
for k in range(15):     # numerical
    idx = 25 + k
    add_image_q(76 + k, NUM, imgq_ordered[idx]['image'])

# --- Computer 91-100 ---
for k, q in enumerate(comp[:10]):
    final.append({'n': 91 + k, 'section': COMP, 'questionText': q['questionText'],
                  'options': q['options'], 'answerIndex': q['answerIndex'], 'explanation': ''})

# validation
bad = [q['n'] for q in final if len(q['options']) != 4 or any(not str(o).strip() for o in q['options'])]
noans = [q['n'] for q in final if q['answerIndex'] is None]
secs = {}
for q in final: secs[q['section']] = secs.get(q['section'], 0) + 1
print('total:', len(final), '| sections:', secs)
print('bad options:', bad if bad else 'none')
print('without answer:', noans if noans else 'none')
imgs = sorted(int(f.split('-q-')[1].split('.')[0]) for f in os.listdir(SEEDIMG) if f.startswith(DATE))
print('image questions:', len(imgs))
json.dump(final, open(f'_final_{slug}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote _final_{slug}.json')
