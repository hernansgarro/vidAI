"""Static source/original evidence audit; never runs the simulator."""
import hashlib,json,subprocess
from pathlib import Path
BASE='a856a2d9d9f5e650a95be3abeadbd908105e70db'
# Set to the immutable original-evidence commit after the single campaign closes.
ORIGINAL='28fb12bb67e8666b38d3e12e355dacaae5931993'
D=Path('docs/experiments/performance-stage-3-v14-execution')
def git(*args): return subprocess.check_output(['git',*args])
def tree(ref):
    return {p:meta.split()[2] for line in git('ls-tree','-r',ref).decode().splitlines() for meta,p in [line.split('\t')]}
def blob(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
if ORIGINAL=='PENDING': raise SystemExit('Original evidence commit has not been pinned yet')
base=tree(BASE);original=tree(ORIGINAL);head=tree('HEAD')
assert all(head.get(p)==h and original.get(p)==h for p,h in base.items()),'Inherited production file changed'
raw={p:h for p,h in original.items() if p.startswith(str(D)+'/')}
checks=[]
for p,h in raw.items():
    b=Path(p).read_bytes(); assert blob(b)==h,p
    checks.append({'path':p,'gitBlob':h,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
references=json.loads(Path('docs/experiments/performance-stage-3-v12/references.json').read_text())
for r in references:
    b=Path(r['path']).read_bytes();assert blob(b)==r['gitBlob'] and hashlib.sha256(b).hexdigest()==r['sha256'] and len(b)==r['bytes']
    assert git('rev-parse',r['commit']+':'+r['originalPath']).decode().strip()==r['gitBlob']
result={'base':BASE,'originalCommit':ORIGINAL,'inheritedFilesUnchanged':len(base),'originalFiles':checks,'referencesByteIdentical':len(references)}
(D/'source-equivalence.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'baseFiles':len(base),'originalFiles':len(raw),'references':len(references),'passed':True}))
