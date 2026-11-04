"""Compare retained evidence/source to fetched Git blobs; no simulation or replay."""
import hashlib,json,subprocess
from pathlib import Path
ref='f76bb95a764eaf872cbdb63ecef1f889198ccdb2' # Immutable original evidence, excluding later derived reports.
base='dd7925b9d02a67459bb68985cf2d5647b737247e'
preflight='0445603d2d0c348ec602be52284385af8b416452'
prefix='docs/experiments/performance-stage-3-v11-execution/'
def tree(r):
 return {s.split('\t',1)[1]:s.split()[2] for s in subprocess.check_output(['git','ls-tree','-r',r],text=True).splitlines()}
t,b,p=tree(ref),tree(base),tree(preflight)
rows=[]
for name,blob in t.items():
 if name.startswith(prefix):
  data=Path(name).read_bytes();assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==blob,name
  rows.append({'path':name,'gitBlob':blob,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
old={n:h for n,h in p.items() if n.startswith('docs/experiments/performance-stage-3-v11/')}
r={'evidenceCommit':subprocess.check_output(['git','rev-parse',ref],text=True).strip(),'baseSHA':base,'preflightEvidenceCommit':preflight,'allInheritedBaseFilesUnchanged':all(t.get(n)==h for n,h in b.items()),'inheritedFiles':len(b),'preflightOriginalFiles':len(old),'preflightEvidenceUnchanged':all(t.get(n)==h for n,h in old.items()),'files':rows}
assert r['allInheritedBaseFilesUnchanged'] and r['preflightEvidenceUnchanged']
Path(prefix+'source-equivalence.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({k:v for k,v in r.items() if k!='files'},indent=2));print('Verified original files:',len(rows))
