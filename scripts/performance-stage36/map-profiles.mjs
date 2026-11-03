// Analysis-only reconstruction of source locations. No browser or simulation runs.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{SourceMapConsumer}=require('source-map-js');
const dir='docs/experiments/performance-stage-3-v7',data=JSON.parse(fs.readFileSync(dir+'/findings.json'));
const tmp=new URL('./build-map-analysis-temporary.mjs',import.meta.url);
const text=fs.readFileSync(new URL('./build.mjs',import.meta.url),'utf8').replaceAll("'s36-control-dist'","'s36-map-dist'").replaceAll("'s36-diagnostic-dist'","'s36-map-diagnostic-dist'").replace('build:{outDir,emptyOutDir:true}',"build:{outDir,emptyOutDir:true,sourcemap:'hidden'}");
fs.writeFileSync(tmp,text,{flag:'wx'});
try{const {prepare}=await import(tmp.href);const server=await prepare(false,4186);await new Promise(r=>server.httpServer.close(r));}finally{fs.unlinkSync(tmp);}
const assets='s36-map-dist/assets/',files=fs.readdirSync(assets),mappings=[],provenance=[];
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const t of data.diagnostics.filter(t=>t.id.startsWith('D')))for(const profile of t.profiles)for(const leaf of profile.topLeaves){
 if(!leaf.url||leaf.line===null||leaf.column===null)continue;
 const filename=leaf.url.split('/').at(-1),mapfile=files.find(f=>f===filename+'.map');if(!mapfile)throw Error('Reconstructed asset identifier does not match loaded profile: '+filename);
 if(!provenance.some(p=>p.asset===filename))provenance.push({asset:filename,sha256:sha(fs.readFileSync(assets+filename)),mapSHA256:sha(fs.readFileSync(assets+mapfile))});
 const raw=JSON.parse(fs.readFileSync(assets+mapfile)),consumer=new SourceMapConsumer(raw),original=consumer.originalPositionFor({line:leaf.line+1,column:leaf.column});
 if(!original.source)continue;const content=consumer.sourceContentFor(original.source,true),sourceLine=content?.split('\n')[original.line-1]??'';
 mappings.push({id:t.id,role:profile.role,...leaf,original,sourceLine:sourceLine.trim()});
}
fs.writeFileSync(dir+'/source-mapping.json',JSON.stringify({definition:'Offline hidden-source-map reconstruction; asset content-hash filenames match recorded loaded script URLs. No original CI response-body digest was captured. Unchanged source-module mappings are usable; build-transformed Worker source line numbers are not original repository line numbers. Profile interval shares are not OS CPU percentages.',provenance,mappings},null,2));
console.log('Mapped '+mappings.length+' sampled leaf locations without simulation');
