"""Analyze preserved Stage3.3b archives without replaying any simulation."""
import os,sys,termios,json,base64,gzip,hashlib,statistics,math,pathlib,datetime
if '--stdin' in sys.argv:
 a=termios.tcgetattr(0);a[3]&=~(termios.ICANON|termios.ECHO);termios.tcsetattr(0,termios.TCSANOW,a);print('READY',flush=True);chunks=[]
 while True:
  b=os.read(0,65536);chunks.append(b)
  if b'\nEND\n' in b''.join(chunks[-2:]):break
 bundle=json.loads(b''.join(chunks).split(b'\nEND\n')[0])
else:
 root=pathlib.Path('docs/experiments/performance-stage-3-v4')
 bundle=[dict(name=p.name[:-8],archive=base64.b64encode(p.read_bytes()).decode(),receipt=json.loads((root/(p.name[:-8]+'-receipt.json')).read_text())) for p in root.glob('*.json.gz')]
def stat(values):
 a=sorted(values)
 def q(p):
  x=(len(a)-1)*p;i=math.floor(x);return a[i]+(a[math.ceil(x)]-a[i])*(x-i)
 return dict(n=len(a),median=q(.5),min=a[0],max=a[-1],p95=q(.95) if len(a)>=100 else None,p99=q(.99) if len(a)>=100 else None)
def digest(b):return hashlib.sha256(b).hexdigest()
raw={};manifest={};fulls={};total_ms=0
for item in bundle:
 b=base64.b64decode(item['archive']);r=item['receipt'];name=item['name'];text=gzip.decompress(b).decode()
 assert digest(b)==r['archiveSHA256'],name
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+bytes([0])+b).hexdigest()==r['gitBlobSHA'],name
 data=json.loads(text);assert data['failures']==[],name;raw[name]=data;manifest[name+'.json.gz']=digest(b)
 if 'started' in data and 'finished' in data:total_ms+=(datetime.datetime.fromisoformat(data['finished'].replace('Z','+00:00'))-datetime.datetime.fromisoformat(data['started'].replace('Z','+00:00'))).total_seconds()*1000
 if data.get('finalSnapshot') is not None:
  at=text.index('"finalSnapshot":')+len('"finalSnapshot":');value,end=json.JSONDecoder().raw_decode(text[at:]);exact=text[at:at+end]
  assert digest(exact.encode())==data['finalHash'],name
  fulls[data['config']['scenario']]=dict(finalHash=data['finalHash'],archive=name+'.json.gz',completeSnapshotBytes=len(exact.encode()))
kernels={n:d for n,d in raw.items() if 'config' in d}
assert len(kernels)==12
groups={}
for name,d in kernels.items():
 c=d['config'];assert len(d['tickMs'])==300 and len(d['periodicHashes'])==5 and abs(d['energyErrorJ'])<1e-7,name
 assert d['restoredHash']==d['sourceHash'],name
 key=c['scenario']+'/'+c['mode'];groups.setdefault(key,[]).append(d)
for scenario in ['founders15','founders30']:
 rs=[d for d in kernels.values() if d['config']['scenario']==scenario]
 assert len(rs)==6
 for key in ['sourceHash','warmHash','periodicHashes','finalHash']:assert all(d[key]==rs[0][key] for d in rs)
 assert all(d['finalHash']==fulls[scenario]['finalHash'] for d in rs)
 prior=json.loads(gzip.decompress(pathlib.Path('docs/experiments/performance-stage-3-v1',scenario+'-baseline-1.json.gz').read_bytes()))
 assert prior['periodicHashes'][3]==rs[0]['finalHash'],scenario
summary={}
for key,rs in groups.items():
 rs.sort(key=lambda d:d['config']['rep'])
 row=dict(kernelMs=stat([d['kernelMs'] for d in rs]),perRunKernelMs=[d['kernelMs'] for d in rs],tickMs=stat([t for d in rs for t in d['tickMs']]),initial=rs[0]['inventory'],final=rs[0]['finalInventory'],heapEnd=[d['heapEnd'] for d in rs],cpuWindow=[d['cpu'] for d in rs],energyErrorJ=[d['energyErrorJ'] for d in rs],finalHash=rs[0]['finalHash'])
 if rs[0]['config']['mode']=='diagnostic':
  blocks={}
  for block in rs[0]['probe']['rows']:
   values=[d['probe']['rows'][block] for d in rs]
   blocks[block]=dict(calls=values[0]['calls'],units=values[0]['units'],uniqueParts=values[0]['uniqueParts'],sampledTicks=38,perTickCalls=values[0]['calls']/38,perTickUnits=values[0]['units']/38,blockMs=stat([v['ms'] for v in values]),msPerSampledTick=stat([v['ms']/38 for v in values]),fractionOfSampledTickMs=stat([100*d['probe']['rows'][block]['ms']/sum(d['tickMs'][i] for i in range(0,300,8)) for d in rs]))
  row['blocks']=blocks
 summary[key]=row
overhead={}
for scenario in ['founders15','founders30']:
 a=summary[scenario+'/baseline'];b=summary[scenario+'/diagnostic']
 overhead[scenario]=dict(medianDifferencePercent=100*(b['kernelMs']['median']/a['kernelMs']['median']-1),pairedPercent=[100*(v/u-1) for u,v in zip(a['perRunKernelMs'],b['perRunKernelMs'])])
comp=raw['component'];component={}
assert len(comp['timings'])==27 and len(comp['timings'])*2000000==54000000
for family in ['substep','contact','projection']:
 rs=[x for x in comp['timings'] if x['family']==family];assert len(set(x['checksum'] for x in rs))==1
 component[family]={mode:dict(ms=stat([x['ms'] for x in rs if x['mode']==mode]),nsPerVisit=stat([x['ms']*.5 for x in rs if x['mode']==mode])) for mode in ['recompute','direct','weak']}
valid=raw['validity'];assert valid['liveEntriesVerified']==10000 and valid['containerRetained']
timers={str(r['rep']):stat([x*1e6 for x in r['values']]) for r in valid['timerPairs']}
out=dict(groups=summary,overhead=overhead,component=component,cold=comp['cold'],originalInvalidHeapReading=comp['memory'],validatedRetention=valid,validationTimerNs=timers,originalTimerPairCalibration=comp['timerPairCalibration'],lifecycle=comp['lifecycle'],environment=next(iter(kernels.values()))['environment'],fullFinalSnapshots=fulls,measuredTicks=3600,warmupTicks=720,logicalKernelSlots=12,isolatedVisits=54000000,processIntervalMs=total_ms,conservativeBudgetChargeMs=total_ms+20000,allAuthoritativeHashesEqual=True,historicalTick360ReferencesEqual=True,archiveManifest=manifest)
# Raw timer pairs remain in the original validity archive; keep summary compact.
out['validatedRetention']={k:v for k,v in valid.items() if k!='timerPairs'}
out['originalV3Incident']='../performance-stage-3-v3/incident.json'
print(json.dumps(out),flush=True)
