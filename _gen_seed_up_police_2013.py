import json, io, sys
sys.stdout.reconfigure(encoding="utf-8")
data=json.load(open("_extracted_up_police_2013/data.json",encoding="utf-8"))

def esc(s):
    return s.replace("\\","\\\\").replace("`","\\`").replace("${","\\${")

rows=[]
for n in range(1,161):
    v=data[str(n)]
    q=esc(v["q"])
    sec=v["sec"]
    opts=", ".join("`"+esc(o)+"`" for o in v["opts"])
    qi = "q%d.png"%n if v.get("fig") else ""
    rows.append("  { n: %d, s: `%s`, q: `%s`, qi: `%s`, o: [%s], ans: %d },"%(n,sec,q,qi,opts,v["ans"]))
raw="\n".join(rows)

TEMPLATE=open("_seed_up_police_2013_template.js",encoding="utf-8").read()
out=TEMPLATE.replace("__RAW__", raw)
open("scripts/seed-pyq-up-police-2013.js","w",encoding="utf-8").write(out)
figc=sum(1 for n in range(1,161) if data[str(n)].get("fig"))
print("wrote scripts/seed-pyq-up-police-2013.js  fig=%d  bytes=%d"%(figc,len(out)))
