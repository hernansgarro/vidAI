// Pure source-map/sample attribution. No simulation, browser or heap inspection.
import fs from'node:fs';import path from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';
import{TraceMap,originalPositionFor}from'@jridgewell/trace-mapping';
import{decodeFile,sha}from'../performance-stage39/archive.mjs';
const dir='docs/experiments/performance-stage-3-v14-execution',read=n=>decodeFile(dir,n),manifest=read('manifest'),assets=read('s39-lean-dist-assets').files,root=process.cwd(),maps=new Map(),sourceChecks=new Map();
function frameLocation(f){
 let file;try{file=path.basename(new URL(f.url).pathname);}catch{file='';}
 if(!file||!assets[file+'.map'])return{status:f.url?'unmapped-generated':'native-or-no-url',functionName:f.functionName,generated:{...f},key:(f.url||'<native>')+':'+f.lineNumber+':'+f.columnNumber+':'+f.functionName};
 if(!maps.has(file)){const raw=JSON.parse(assets[file+'.map']);maps.set(file,{raw,map:new TraceMap(raw,pathToFileURL(path.join(root,'s39-lean-dist/assets',file+'.map')).href)});}
 const{raw,map}=maps.get(file),pos=originalPositionFor(map,{line:f.lineNumber+1,column:Math.max(0,f.columnNumber)});if(pos.source===null||pos.line===null)return{status:'unmapped-generated',functionName:f.functionName,generated:{...f},key:f.url+':'+f.lineNumber+':'+f.columnNumber+':'+f.functionName};
 const index=map.resolvedSources.indexOf(pos.source),content=raw.sourcesContent?.[index];let resolved;try{resolved=pos.source.startsWith('file:')?fileURLToPath(pos.source):path.resolve(root,'s39-lean-dist/assets',pos.source);}catch{resolved=pos.source;}
 const relative=path.relative(root,resolved),inside=!relative.startsWith('..')&&!path.isAbsolute(relative),exists=inside&&fs.existsSync(resolved),matches=exists&&typeof content==='string'&&sha(content)===sha(fs.readFileSync(resolved));
 // The lean research pretransform changes this file without an original transform map.
 const instrumented=relative==='simulation.worker.ts'||relative.startsWith('scripts/performance-stage');
 const verifiedOriginal=matches&&!instrumented,status=verifiedOriginal?'verified-original':instrumented?'transformed-research-source':'unverified-map-source',source=inside?relative:pos.source;
 sourceChecks.set(source,{source,status,sourceContentSHA256:typeof content==='string'?sha(content):null,repositorySHA256:exists?sha(fs.readFileSync(resolved)):null,matchesRepository:matches,instrumented});
 return{status,verifiedOriginal,source,line:pos.line,column:pos.column===null?null:pos.column+1,functionName:pos.name??f.functionName,generated:{...f},key:source+':'+pos.line+':'+pos.column+':'+(pos.name??f.functionName)};
}
const add=(m,key,size,extra={})=>{const a=m.get(key)??{key,weightedBytes:0,samples:0,...extra};a.weightedBytes+=size;a.samples++;m.set(key,a);};
const profiles=[];
for(const slot of manifest.ledger.filter(x=>x.status==='retained'&&x.sampled)){
 const a=read(slot.id+'-allocation'),profile=a.profile,nodes=new Map();let treeSelfSize=0;
 const walk=(n,chain)=>{if(nodes.has(n.id))throw Error('Duplicate allocation node');const loc=frameLocation(n.callFrame),next=[...chain,loc];nodes.set(n.id,{node:n,chain:next,location:loc});treeSelfSize+=n.selfSize;for(const c of n.children)walk(c,next);};walk(profile.head,[]);
 const ordinals=new Set(),leaf=new Map(),owners=new Map(),groups=new Map(),inclusive=new Map();let total=0,original=0,mapped=0;
 for(const s of profile.samples){if(ordinals.has(s.ordinal)||!nodes.has(s.nodeId)||!Number.isFinite(s.size)||s.size<0)throw Error('Invalid allocation sample');ordinals.add(s.ordinal);const n=nodes.get(s.nodeId),stack=[...n.chain].reverse(),owner=stack.find(f=>f.verifiedOriginal)??stack.find(f=>f.source)??n.location;total+=s.size;if(owner.verifiedOriginal)original+=s.size;if(owner.source)mapped+=s.size;
 add(leaf,n.location.key,s.size,{location:n.location});add(owners,owner.key,s.size,{location:owner,exampleLeaf:n.location});const group=owner.source??'<native-or-unmapped>';add(groups,group,s.size,{status:owner.status});for(const source of new Set(n.chain.filter(f=>f.verifiedOriginal).map(f=>f.source)))add(inclusive,source,s.size);
 }
 const sorted=m=>[...m.values()].sort((a,b)=>b.weightedBytes-a.weightedBytes).map(x=>({...x,sharePercent:total?x.weightedBytes/total*100:null}));
 const groupRows=sorted(groups);if(groupRows.reduce((n,g)=>n+g.weightedBytes,0)!==total)throw Error('Exclusive allocation groups do not close');
 profiles.push({id:slot.id,parameters:a.samplerStart.parameters,profileJSONBytes:a.profileJSONBytes,nodes:nodes.size,samples:profile.samples.length,weightedSampleBytes:total,treeSelfSizeBytes:treeSelfSize,treeMinusSamplesBytes:treeSelfSize-total,verifiedOriginalWeightPercent:total?original/total*100:null,mappedIncludingTransformedWeightPercent:total?mapped/total*100:null,exclusiveSourceGroups:groupRows,topOriginalOwnerSites:sorted(owners).slice(0,20),topLeafSites:sorted(leaf).slice(0,20),inclusiveOriginalSourceGroups:sorted(inclusive),scopeNote:'Sampling bracket includes explicit pre/post-roll. Weighted samples are estimates, not CPU, retained/wire bytes or exact allocations; inclusive groups overlap and must not be summed.'});
}
const top=p=>p.topOriginalOwnerSites.slice(0,10).map(x=>x.key),s0=profiles[0]?new Set(top(profiles[0])):new Set(),s1=profiles[1]?new Set(top(profiles[1])):new Set(),intersection=[...s0].filter(k=>s1.has(k)),combined=new Set([...s0,...s1]);
const sources=[...new Set(profiles.flatMap(p=>p.exclusiveSourceGroups.map(x=>x.key)))].map(source=>({source,observations:profiles.map(p=>({id:p.id,...(p.exclusiveSourceGroups.find(x=>x.key===source)??{weightedBytes:0,samples:0,sharePercent:0})}))}));
const result={stage:'3.12',sourceSHA:manifest.sourceSHA,profiles,sourceChecks:[...sourceChecks.values()],sourceGroupComparisons:sources,top10Agreement:{intersection:intersection.length,union:combined.size,jaccard:combined.size?intersection.length/combined.size:null,sharedSites:intersection},limitations:['Native/no-url/unmapped samples are retained explicitly; closest verified original caller is ownership context, not proof of an exact allocating expression.','simulation.worker.ts is marked transformed research source regardless of source-map content; no false original line claim for injected guard.','Poisson sampling interval262144bytes, two profiles, one150bodyCI scenario; no population-wide inference, CPU-cost ranking or safe optimization saving.','V8 inspector may force GC at profile materialization after useful/CPU/trace stop; profile tail and pre-roll are explicit, no tick-by-tick allocation census.']};
fs.writeFileSync(dir+'/allocation-attribution.json',JSON.stringify(result,null,2));console.log(JSON.stringify({profiles:profiles.map(p=>({id:p.id,samples:p.samples,weightedBytes:p.weightedSampleBytes,coverage:p.verifiedOriginalWeightPercent,groups:p.exclusiveSourceGroups,topSites:p.topOriginalOwnerSites.slice(0,10)})),agreement:result.top10Agreement},null,2));
