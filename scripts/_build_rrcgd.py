"""Build per-question composites + skeleton JSON for RRC Group D image papers.

Parse strategy:
  - Bundled prefix (Q1..Qk): images+bullets appear BEFORE the Q/OPT markers (first
    page table). Parsed by flat bullet-grouping (qimg + 4x(bullet,img)).
  - Scaffold body (Qk+1..Q100): tokens interleave  Q.N / [qimg] / bullet / "n." / optimg.
    A question's qimg may float just before OR just after its Q marker.
  - tick bullet (rId ~100 occ) marks correct option. Missing bullets -> answer=0 (flag).

Outputs:
  _extracted_<slug>/                media
  _rrcgd_<slug>.json                skeleton: [{q,answer,qimgs,optImgs,ocrQ,ocrOpts}]
  _sheets_<slug>/sheet_NN.png       contact sheets (~PER_SHEET questions each) for vision
Usage: python _build_rrcgd.py <docx> <slug> [questions_per_sheet]
"""
import sys, os, re, zipfile, shutil, json, subprocess
from xml.etree import ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

docx_path, slug = sys.argv[1], sys.argv[2]
PER_SHEET = int(sys.argv[3]) if len(sys.argv) > 3 else 7
media = f"_extracted_{slug}"
out_json = f"_rrcgd_{slug}.json"
sheets_dir = f"_sheets_{slug}"
ocr_cache_path = f"_ocr_{slug}.json"

W_NS="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS="http://schemas.openxmlformats.org/officeDocument/2006/relationships"

if os.path.isdir(media): shutil.rmtree(media)
os.makedirs(media, exist_ok=True)
with zipfile.ZipFile(docx_path) as z:
    rid_to_media={}
    for rel in ET.fromstring(z.read("word/_rels/document.xml.rels").decode()):
        rid=rel.attrib.get("Id"); t=rel.attrib.get("Target","")
        if t.startswith("media/"):
            fn=t.split("/")[-1]; rid_to_media[rid]=fn
            open(os.path.join(media,fn),"wb").write(z.read(f"word/{t}"))
    doc=z.read("word/document.xml").decode()

rc={rid:len(re.findall(rf'r:embed="{re.escape(rid)}"',doc)) for rid in rid_to_media}
hi=sorted(rc.items(),key=lambda kv:-kv[1]); TICK=EMPTY=None
for rid,c in hi:
    if 80<=c<=130 and TICK is None: TICK=rid
    elif 240<=c<=420 and EMPTY is None: EMPTY=rid
print(f"tick={TICK}({rc.get(TICK)}) empty={EMPTY}({rc.get(EMPTY)})")

# ---- OCR cache ----
ocr_cache=json.load(open(ocr_cache_path,encoding="utf-8")) if os.path.exists(ocr_cache_path) else {}
OCR_ENV=dict(os.environ, TESSDATA_PREFIX=os.path.join(os.getcwd(),"_tessdata"))
def _run(fn,lang):
    r=subprocess.run(["tesseract",os.path.join(media,fn),"stdout","-l",lang,"--psm","6"],
                     capture_output=True,encoding="utf-8",errors="replace",timeout=60,env=OCR_ENV)
    return re.sub(r'\s+',' ',(r.stdout or "")).strip()
def ocr(fn):
    # English images OCR cleanly with eng; Devanagari images come out as garbage with
    # eng but clean with hin+mar. Try eng first; fall back to Devanagari only if needed.
    if fn in ocr_cache: return ocr_cache[fn]
    eng=_run(fn,"eng")
    nz=len(eng.replace(' ',''))
    asc=sum(1 for c in eng if c.isascii() and (c.isalnum()))
    if nz and asc/nz>0.55:
        ocr_cache[fn]=eng; return eng        # confidently English
    dev=_run(fn,"hin+mar")
    deva=sum(1 for c in dev if 'ऀ'<=c<='ॿ')
    out=dev if deva>asc else (eng if len(eng)>=len(dev) else dev)
    ocr_cache[fn]=out; return out

# per-filename embed frequency: repeated images (>=5) are decoration/watermark
fname_freq={}
for rid,fn in rid_to_media.items():
    fname_freq[fn]=fname_freq.get(fn,0)+rc.get(rid,0)
DECOR={fn for fn,c in fname_freq.items() if c>=5}
print(f"frequency-decoration imgs: {sorted(DECOR)}")

PROMO_KW=['subscription','mock test','refund','all exams','previous year','report card',
          'personalised','adda','download','play store','crash course','test series',
          'youtube','telegram','www.','.com','recruitment boards']
def is_junk(fn):
    if fn in DECOR: return True                # repeated watermark/decoration
    try: w,h=Image.open(os.path.join(media,fn)).size
    except: return False
    if h>300 and w>300: return True            # full-page banner
    t=ocr(fn).lower()
    return any(k in t for k in PROMO_KW)

# ---- token stream ----
root=ET.fromstring(doc); body=root.find(f"{{{W_NS}}}body")
toks=[]
for p in body.iter(f"{{{W_NS}}}p"):
    for e in p.iter():
        tag=e.tag.split('}',1)[-1]
        if tag=='t' and e.text and e.text.strip():
            s=e.text.strip()
            if re.match(r'^Q\.\s*[\d ]+$',s): toks.append(('Q',int(re.sub(r'\D','',s))))
            elif re.match(r'^[1-4]\.$',s): toks.append(('OPT',int(s[0])))
        elif tag=='blip':
            rid=e.attrib.get(f"{{{R_NS}}}embed",'')
            if rid==TICK: toks.append(('TICK',None))
            elif rid==EMPTY: toks.append(('EMPTY',None))
            else:
                fn=rid_to_media.get(rid,'')
                if fn and not fn.lower().endswith('.png') and not is_junk(fn):
                    toks.append(('IMG',fn))

# ---- detect bundled prefix: leading Q markers that have NO IMG before next Q ----
q_idx=[i for i,(k,_) in enumerate(toks) if k=='Q']
first_q=q_idx[0]
bundled=0
for qi,start in enumerate(q_idx):
    nxt=q_idx[qi+1] if qi+1<len(q_idx) else len(toks)
    has_img=any(toks[m][0]=='IMG' for m in range(start+1,nxt))
    if has_img: break
    bundled+=1
body_start=q_idx[bundled] if bundled<len(q_idx) else len(toks)
print(f"bundled prefix questions: {bundled}")

questions=[]
# ---- parse bundled prefix from images BEFORE first_q (flat bullet grouping) ----
pre=[t for t in toks[:first_q] if t[0] in ('IMG','TICK','EMPTY')]
# drop leading header image(s) that OCR to RRB header
while pre and pre[0][0]=='IMG' and ('recruitment' in ocr(pre[0][1]).lower() or 'railway' in ocr(pre[0][1]).lower()):
    pre.pop(0)
i=0; qbuf=[]
while i<len(pre) and pre[i][0]=='IMG': qbuf.append(pre[i][1]); i+=1
while i<len(pre) and len(questions)<bundled:
    cur={'qimgs':qbuf,'opts':[]}; qbuf=[]
    for k in range(4):
        if i>=len(pre) or pre[i][0] not in ('TICK','EMPTY'): break
        tick=pre[i][0]=='TICK'; i+=1; oimgs=[]
        if i<len(pre) and pre[i][0]=='IMG': oimgs.append(pre[i][1]); i+=1
        extra=[]
        while i<len(pre) and pre[i][0]=='IMG': extra.append(pre[i][1]); i+=1
        cur['opts'].append({'tick':tick,'imgs':oimgs})
        if k<3: cur['opts'][-1]['imgs']+=extra
        else: qbuf=extra
    questions.append(cur)

# ---- parse scaffold body from body_start onward (state machine) ----
cur=None; pend=[]; ptick=None; await_img=False
def flush():
    global cur
    if cur: questions.append(cur)
for (k,v) in toks[body_start:]:
    if k=='Q':
        flush(); cur={'qimgs':list(pend),'opts':[]}; pend=[]; await_img=False; ptick=None
    elif k=='TICK': ptick=True
    elif k=='EMPTY': ptick=False
    elif k=='OPT':
        if cur is not None:
            cur['qimgs']+=pend; pend=[]
            cur['opts'].append({'tick':bool(ptick),'imgs':[]}); ptick=None; await_img=True
    elif k=='IMG':
        if await_img and cur and cur['opts']:
            cur['opts'][-1]['imgs'].append(v); await_img=False
        else:
            pend.append(v)
flush()

print(f"total questions parsed: {len(questions)}")

# ---- auto-fix scramble: a missing-bullet question pushes the NEXT question's
# text into its own opt4. Pattern: opts[0..2] imageless, opts[3] has image(s),
# and next question's qimgs empty -> move opt4 image(s) to next question's qtext.
fixed=0
for i in range(len(questions)-1):
    q=questions[i]; nx=questions[i+1]
    if len(q['opts'])==4 and not nx['qimgs'] \
       and all(not q['opts'][k]['imgs'] for k in range(3)) and q['opts'][3]['imgs']:
        nx['qimgs']=q['opts'][3]['imgs']; q['opts'][3]['imgs']=[]; fixed+=1
print(f"scramble auto-fixes: {fixed}")

# ---- finalize structure ----
out=[]
for idx,q in enumerate(questions):
    ans=0
    for oi,o in enumerate(q['opts']):
        if o.get('tick'): ans=oi+1
    out.append({
        'q':idx+1,'answer':ans,
        'qimgs':q['qimgs'],
        'optImgs':[o['imgs'] for o in q['opts']],
        'ocrQ':' '.join(ocr(f) for f in q['qimgs']).strip(),
        'ocrOpts':[' '.join(ocr(f) for f in o['imgs']).strip() for o in q['opts']],
        'nopts':len(q['opts'])
    })
json.dump(ocr_cache,open(ocr_cache_path,"w",encoding="utf-8"),ensure_ascii=False)
json.dump(out,open(out_json,"w",encoding="utf-8"),ensure_ascii=False,indent=1)

bad=[o['q'] for o in out if o['nopts']!=4]
noans=[o['q'] for o in out if o['answer']==0]
print(f"Wrote {out_json}: {len(out)} Qs | bad-optcount={bad} | no-answer={noans}")

# ---- build contact sheets for vision ----
if os.path.isdir(sheets_dir): shutil.rmtree(sheets_dir)
os.makedirs(sheets_dir, exist_ok=True)
SC=2  # upscale factor for legibility of exponents/fractions
try: font=ImageFont.truetype("arialbd.ttf",30); fsm=ImageFont.truetype("arialbd.ttf",26)
except: font=ImageFont.load_default(); fsm=font
PAD=10; LBL=150; MAXW=1700

FITW=MAXW-LBL-20  # max paste width; wider strips scaled down so nothing clips
def load(fn):
    try:
        im=Image.open(os.path.join(media,fn)).convert("RGB")
        im=im.resize((im.width*SC,im.height*SC), Image.LANCZOS)
        if im.width>FITW:
            r=FITW/im.width; im=im.resize((FITW,max(1,int(im.height*r))), Image.LANCZOS)
        return im
    except: return None

def qpanel(item):
    """Vertical panel: header, question imgs, 4 labeled option imgs."""
    rows=[]  # (label, [imgs])
    rows.append((f"Q{item['q']}  [ans={item['answer']}]", item['qimgs']))
    for oi,imgs in enumerate(item['optImgs']):
        tick=' <=' if item['answer']==oi+1 else ''
        rows.append((f"  {oi+1}){tick}", imgs))
    # compute size
    line_h=[]
    for lbl,imgs in rows:
        h=max([load(f).height for f in imgs if load(f)]+[22])
        line_h.append(h+PAD)
    W=MAXW; H=sum(line_h)+PAD
    panel=Image.new("RGB",(W,H),"white"); d=ImageDraw.Draw(panel)
    y=PAD
    for (lbl,imgs),h in zip(rows,line_h):
        d.text((4,y),lbl,fill="black",font=fsm)
        x=LBL
        for f in imgs:
            im=load(f)
            if im:
                if x+im.width>W: x=LBL;
                panel.paste(im,(x,y)); x+=im.width+10
        y+=h
    d.line([(0,H-1),(W,H-1)],fill="#cccccc")
    return panel

panels=[qpanel(it) for it in out]
for s in range(0,len(panels),PER_SHEET):
    chunk=panels[s:s+PER_SHEET]
    W=max(p.width for p in chunk); H=sum(p.height for p in chunk)+PAD*len(chunk)
    sheet=Image.new("RGB",(W,H),"white"); y=0
    for p in chunk: sheet.paste(p,(0,y)); y+=p.height+PAD
    n=s//PER_SHEET+1
    sheet.save(os.path.join(sheets_dir,f"sheet_{n:02d}.png"))
print(f"Wrote {sheets_dir}/ ({(len(panels)+PER_SHEET-1)//PER_SHEET} sheets)")
