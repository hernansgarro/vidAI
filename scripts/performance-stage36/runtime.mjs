// Explicit research-build diagnostics. Never imported by ordinary production builds.
export const a = {
 active:false, rows:{}, counts:{}, pumpEnd:null, sentAt:null, controlStart:null,
 start:0,end:0,ticks:0,
 reset(){this.rows={};this.counts={};this.pumpEnd=null;this.sentAt=null;this.controlStart=null;this.ticks=0;this.start=performance.now();this.end=0;},
 add(k,v){if(!this.active)return;const r=this.rows[k]??(this.rows[k]=[]);if(r.length<20000)r.push(v);else throw Error('Diagnostic array ceiling');},
 inc(k){if(this.active)this.counts[k]=(this.counts[k]??0)+1;},
 dump(){return {rows:this.rows,counts:this.counts,start:this.start,end:this.end,ticks:this.ticks,controlStart:this.controlStart,timeOrigin:performance.timeOrigin};}
};
if(typeof window!=='undefined')globalThis.__s36Runtime=a;
