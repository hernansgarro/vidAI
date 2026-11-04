"""Plot archived results only; never launches or steps a simulation."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams['svg.fonttype']='none'
plt.rcParams['svg.hashsalt']='stage39'
p=Path('docs/experiments/performance-stage-3-v11-execution');f=json.loads((p/'findings.json').read_text())
a=sorted(f['scalability'],key=lambda x:(x['count'],x['dense']))
labels=[str(x['count'])+(' dense' if x['dense'] else ' spread') for x in a]
fig,axs=plt.subplots(1,2,figsize=(11.5,4.6),layout='constrained')
ys=[x['msPerTick']['median'] for x in a]
axs[0].bar(labels,ys,color=['#3b81ac' if not x['dense'] else '#cc743b' for x in a],alpha=.9)
axs[0].errorbar(labels,ys,yerr=[[y-x['msPerTick']['min'] for x,y in zip(a,ys)],[x['msPerTick']['max']-y for x,y in zip(a,ys)]],fmt='none',capsize=5,color='#222222')
axs[0].set(ylabel='Worker elapsed ms / tick',title='Lean MAX: median and full repetition range')
axs[0].grid(axis='y',alpha=.2)
for i,(x,y) in enumerate(zip(a,ys)):axs[0].text(i,y*1.02,f"n={x['msPerTick']['n']}",ha='center',fontsize=9)
ph=sorted(f['phaseGroups'],key=lambda x:(x['count'],x['dense']));labs=[str(x['count'])+(' dense' if x['dense'] else ' spread') for x in ph];bottom=[0.0]*len(ph)
cats={'Physics/contact':['physics'],'Vision/index':['vision','sight-build'],'Inference':['inference'],'Learning':['motor-learning','sensory-learning'],'Feeding/index':['feeding','feeding-index']}
for name,keys in cats.items():
 vals=[sum(x['msPerTick']['median'] for x in r['phases'] if x['phase'] in keys) for r in ph]
 axs[1].bar(labs,vals,bottom=bottom,label=name);bottom=[b+v for b,v in zip(bottom,vals)]
vals=[r['tickElapsedMeans']['median']-b for r,b in zip(ph,bottom)];axs[1].bar(labs,vals,bottom=bottom,label='Other/residual',color='#999999')
axs[1].set(ylabel='Instrumented elapsed ms / tick',title='Phase windows: n=1 / 1 / 2; elapsed medians');axs[1].grid(axis='y',alpha=.2);axs[1].legend(fontsize=7,ncols=2)
fig.suptitle('VIDA 2D — Stage 3.9 population and initially separated concentration',fontsize=13)
fig.savefig(p/'scalability.svg',metadata={'Date':None});fig.savefig(p/'scalability.png',dpi=150)
