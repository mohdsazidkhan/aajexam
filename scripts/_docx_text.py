#!/usr/bin/env python3
"""Extract paragraph text from a .docx in linear reading order (handles 2-column SBI papers
whose PDFs jumble under pdftotext). Usage: python scripts/_docx_text.py <docx> <out.txt>"""
import re, sys, zipfile

docx, out = sys.argv[1], sys.argv[2]
xml = zipfile.ZipFile(docx).read('word/document.xml').decode('utf-8', 'replace')

def unescape(t):
    return (t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
             .replace('&quot;', '"').replace('&apos;', "'"))

paras = []
for p in re.split(r'</w:p>', xml):
    # match real text runs only: <w:t> or <w:t ...> but NOT <w:tab>/<w:tbl>
    runs = re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.DOTALL)
    t = unescape(''.join(runs)).strip()
    if t:
        paras.append(t)
open(out, 'w', encoding='utf-8').write('\n'.join(paras))
print(f'wrote {out}: {len(paras)} paragraphs')
