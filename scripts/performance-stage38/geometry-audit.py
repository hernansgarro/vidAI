"""Static saved-pose intersections only; never steps or modifies a simulation."""
import json,gzip,math
from pathlib import Path
p=Path('docs/experiments/performance-stage-3-v10')
def read(n):return json.loads(gzip.decompress((p/(n+'.json.gz')).read_bytes()))
def contacts(snapshot):
 bodies=[]
 for oi,o in enumerate(snapshot['state']['organisms']):
  for i,(seg,d) in enumerate(zip(o['segments'],o['genome']['parts'])):
   bodies.append((oi,i,d['parentIndex'],seg,d,math.cos(seg['angle']),math.sin(seg['angle'])))
 result={'uniqueInterorganismIntersectingPairs':0,'uniqueNonhingedSelfIntersectingPairs':0,'aabbCandidates':0,'parts':len(bodies)}
 for i,a in enumerate(bodies):
  ao,ai,ap,s,d,c,si=a
  rx=(abs(c)*d['width']+abs(si)*d['height'])/2;ry=(abs(si)*d['width']+abs(c)*d['height'])/2
  for b in bodies[:i]:
   bo,bi,bp,t,e,bc,bs=b
   if ao==bo and (ap==bi or bp==ai):continue
   brx=(abs(bc)*e['width']+abs(bs)*e['height'])/2;bry=(abs(bs)*e['width']+abs(bc)*e['height'])/2
   dx=t['x']-s['x'];dy=t['y']-s['y']
   if abs(dx)>=rx+brx or abs(dy)>=ry+bry:continue
   result['aabbCandidates']+=1
   hit=True
   for x,y in [(c,si),(-si,c),(bc,bs),(-bs,bc)]:
    ra=abs(x*c+y*si)*d['width']/2+abs(-x*si+y*c)*d['height']/2
    rb=abs(x*bc+y*bs)*e['width']/2+abs(-x*bs+y*bc)*e['height']/2
    if ra+rb-abs(dx*x+dy*y)<=0:hit=False;break
   if hit:result['uniqueInterorganismIntersectingPairs' if ao!=bo else 'uniqueNonhingedSelfIntersectingPairs']+=1
 return result
rows=[]
for n in ['25','50','100','150','compact']:rows.append({'source':'fixture-'+n,'boundary':'initial',**contacts(read('fixture-'+n)['snapshot'])})
for s in read('manifest')['ledger']:
 if s['status']=='retained':rows.append({'source':s['id'],'boundary':'final',**contacts(read(s['id']+'-original')['boundary']['snapshot'])})
result={'method':'Analysis-only SAT on archived poses, excluding directly hinged neighbors. Counts snapshot intersections, not dynamic contact events, impulses or repeated solver contacts. No simulation or physical replay.', 'rows':rows}
(p/'static-contact-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
