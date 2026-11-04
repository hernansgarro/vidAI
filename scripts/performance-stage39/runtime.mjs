// All-real research counters/timers; no subsystem substitution or state mutation.
export const r={
 level:'off',ordinal:0,active:false,detail:false,
 configure(level='off'){if(!['off','counter','phase'].includes(level))throw Error('Invalid profile');this.level=level;this.ordinal=0;this.reset();},
 reset(){this.counts={};this.ticks=[];this.transport=[];this.phaseName='unattributed';this.sampled=0;},
 begin(){this.ordinal++;this.detail=this.active&&this.level!=='off'&&this.ordinal%16===1;if(this.detail)this.sampled++;this.phaseName='unattributed';if(this.active&&this.level==='phase'){this.row={};this.start=this.last=performance.now();}},
 phase(name){if(this.active&&this.level==='phase'){const now=performance.now();this.row[this.phaseName]=(this.row[this.phaseName]??0)+now-this.last;this.last=now;}this.phaseName=name;},
 finish(){if(this.active&&this.level==='phase'){this.phase('unattributed');const end=performance.now();this.row.unattributed=(this.row.unattributed??0)+end-this.last;this.ticks.push({tick:this.ordinal,total:end-this.start,...this.row});if(this.ticks.length>1000)throw Error('Tick diagnostic cap');}this.detail=false;},
 count(k,n=1){this.counts[k]=(this.counts[k]??0)+n;},
 dump(){return {level:this.level,ordinal:this.ordinal,counts:this.counts,sampled:this.sampled,ticks:this.ticks,transport:this.transport};}
};r.reset();
