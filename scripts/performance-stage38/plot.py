"""Render measured receipts only; does not run or step the simulator."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams['svg.fonttype']='none'
p=Path('docs/experiments/performance-stage-3-v10')
f=json.loads((p/'findings.json').read_text())
a=[s for s in f['scalability'] if not s['compact']]
fig,axs=plt.subplots(1,2,figsize=(11.5,4.4),layout='constrained')
xs=[s['count'] for s in a]; ys=[s['msPerTick']['median'] for s in a]
axs[0].errorbar(xs,ys,yerr=[[y-s['msPerTick']['min'] for s,y in zip(a,ys)],[s['msPerTick']['max']-y for s,y in zip(a,ys)]],fmt='o-',capsize=4,label='Spread: retained median/range (n=1,1,1,2)')
for s in f['scalability']:
 if s['compact']:
  y=s['msPerTick']['median'];axs[0].errorbar([s['count']],[y],yerr=[[y-s['msPerTick']['min']],[s['msPerTick']['max']-y]],fmt='s',capsize=4,color='#c85b27',label='Compact100 (n=1)')
axs[0].set(xlabel='Initial living organisms',ylabel='Worker elapsed ms / completed tick',title='Lean MAX throughput at a fixed logical horizon')
axs[0].set_xticks(xs);axs[0].grid(alpha=.2);axs[0].legend(fontsize=8)
ph=f['phases']; cats={'Physics/contact':['physics'],'Vision/index':['vision','sight-build'],'Inference':['inference'],'Learning':['motor-learning','sensory-learning'],'Feeding/index':['feeding','feeding-index']}
labels=[str(x['count'])+(' compact' if x['compact'] else '')+(' pilot24' if x.get('pilot') else '') for x in ph]; bottom=[0.0]*len(ph)
for name,keys in cats.items():
 vals=[sum(x['msPerTick'] for x in r['phaseRows'] if x['phase'] in keys) for r in ph]
 axs[1].bar(labels,vals,bottom=bottom,label=name);bottom=[b+v for b,v in zip(bottom,vals)]
vals=[r['tickElapsed']['mean']-b for r,b in zip(ph,bottom)];axs[1].bar(labels,vals,bottom=bottom,label='Other/residual',color='#999999')
axs[1].set(xlabel='Initial living organisms / layout',ylabel='Instrumented elapsed ms / tick',title='Only available phase pilot (24 ticks; not a scaling curve)');axs[1].legend(fontsize=7,ncols=2);axs[1].grid(axis='y',alpha=.2)
fig.suptitle('VIDA 2D — Stage 3.8 partial population evidence',fontsize=14)
fig.savefig(p/'scalability.svg');fig.savefig(p/'scalability.png',dpi=150)
