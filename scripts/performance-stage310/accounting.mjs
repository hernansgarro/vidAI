// Boundary-only Linux accounting. PID/TID identity is verified against trace marks.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
export const clockTicks=Number(execFileSync('getconf',['CLK_TCK'],{encoding:'utf8'}));
const read=p=>{try{return fs.readFileSync(p,'utf8');}catch{return null;}};
function stat(p){const s=read(p);if(!s)return null;const last=s.lastIndexOf(')'),a=s.slice(last+2).trim().split(/\s+/);return {name:s.slice(s.indexOf('(')+1,last),ppid:+a[1],utime:+a[11],stime:+a[12],starttime:a[19],processor:+a[36]};}
export function snapshot(rootPID){
 const started=performance.now(),all=new Map();
 for(const id of fs.readdirSync('/proc').filter(x=>/^\d+$/.test(x))){const s=stat('/proc/'+id+'/stat');if(s)all.set(+id,s);}
 const pids=new Set([rootPID]);let changed=true;while(changed){changed=false;for(const [pid,s]of all)if(pids.has(s.ppid)&&!pids.has(pid)){pids.add(pid);changed=true;}}
 const processes=[];
 for(const pid of pids){const s=all.get(pid);if(!s)continue;const tasks=[];let ids=[];try{ids=fs.readdirSync('/proc/'+pid+'/task');}catch{}
 for(const id of ids){const base='/proc/'+pid+'/task/'+id,t=stat(base+'/stat');if(!t)continue;const status=read(base+'/status')??'';tasks.push({pid,tid:+id,...t,schedstat:read(base+'/schedstat')?.trim().split(/\s+/).map(Number)??null,voluntary:+(status.match(/^voluntary_ctxt_switches:\s*(\d+)/m)?.[1]??NaN),involuntary:+(status.match(/^nonvoluntary_ctxt_switches:\s*(\d+)/m)?.[1]??NaN)});}
 processes.push({pid,...s,cmdline:read('/proc/'+pid+'/cmdline')?.replaceAll('\0',' '),tasks});}
 return {started,ended:performance.now(),wallEpoch:Date.now(),clockTicks,rootPID,processes,cgroupCPU:read('/sys/fs/cgroup/cpu.stat')};
}
export async function beginTrace(cdp){await cdp.send('Tracing.start',{transferMode:'ReturnAsStream',traceConfig:{recordMode:'recordContinuously',includedCategories:['toplevel','v8','blink.user_timing','disabled-by-default-v8.gc','disabled-by-default-v8.gc_stats'],enableSampling:false}});}
export async function endTrace(cdp){const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const {stream,...metadata}=await done;let text='';for(;;){const r=await cdp.send('IO.read',{handle:stream,size:1048576});text+=r.base64Encoded?Buffer.from(r.data,'base64').toString('utf8'):r.data;if(Buffer.byteLength(text)>16*1024*1024){await cdp.send('IO.close',{handle:stream});throw Error('Trace exceeds bounded evidence limit');}if(r.eof)break;}await cdp.send('IO.close',{handle:stream});return {metadata,trace:JSON.parse(text)};}
