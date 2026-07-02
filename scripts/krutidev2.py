# -*- coding: utf-8 -*-
"""KrutiDev010 -> Unicode with corrected i-matra + reph reordering at Unicode level."""
import re, os

_g = os.path.join(os.path.dirname(__file__), 'krutidev_gist.py')
_src = open(_g, encoding='utf-8').read().replace('return modified_substring', 'return array_one, array_two', 1)
_ns = {}
exec(_src, _ns)
ARR1, ARR2 = _ns['KrutiDev_to_Unicode']('x')

MARK_I = ''   # pre-base i-matra placeholder
MARK_R = ''   # reph (half-ra) placeholder

CONS = '[क-हक़-य़ॸ-ॿ]'
CLUSTER = CONS + '़?(?:्' + CONS + '़?)*'
MATRAS = '[ऀ-ःऺ-ौॎ-ॏ़॑-ॗ]'
_ire = re.compile(MARK_I + '(' + CLUSTER + ')')
_rre = re.compile('(' + CLUSTER + ')(' + MATRAS + '*)' + MARK_R)

def convert(s):
    if not s:
        return s
    # protect reph-bearing ligature codes that must NOT be split
    s = s.replace(")Z", "र्द्ध").replace("nzZ", "र्द्र").replace("bZ", "ई").replace("ZZ", "Z")
    # mark reph and pre-base i-matra (defer reordering to unicode level)
    s = s.replace("Z", MARK_R).replace("f", MARK_I)
    # main table replacement
    for a, b in zip(ARR1, ARR2):
        if a in (")Z", "nzZ", "bZ", "ZZ"):
            continue
        s = s.replace(a, b)
    # resolve pre-base i-matra: move past its cluster
    s = _ire.sub(lambda m: m.group(1) + 'ि', s)
    s = s.replace(MARK_I, 'ि')
    # resolve reph: r-halant before the preceding cluster (matras stay after)
    s = _rre.sub(lambda m: 'र्' + m.group(1) + m.group(2), s)
    s = s.replace(MARK_R, 'र्')
    s = s.replace(':ः', '::')  # '::' analogy artifact
    return s
