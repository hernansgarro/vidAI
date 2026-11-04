// Finite codec/budget checks only: no simulation, clocked trial or browser.
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Archive,decodeFile} from './archive.mjs';
const root=mkdtempSync(path.join(os.tmpdir(),'stage39-codec-'));
try{
 const a=new Archive(root),genome={id:'g',brain:[.1,-0,1e-12],nested:{enabled:true}},value={state:{organisms:[{genome,energy:10},{genome:structuredClone(genome),energy:20}],lineage:[['id',{genome}]]},settings:{x:0},nested:[null,false,'exact'],learned:Array.from({length:96},(_,i)=>({edge:'IH:long-repeated-edge-identifier-'+i,delta:Math.sin(i),eligibility:Math.cos(i),consolidation:i/100})),floats:Array.from({length:40},(_,i)=>Math.tanh(i/7))};
 const r=a.archive('roundtrip',value);assert.deepEqual(decodeFile(root,'roundtrip'),JSON.parse(JSON.stringify(value)));assert.equal(a.genomes.size,1);assert.equal(a.receipts.filter(x=>x.name.startsWith('genomes/')).length,1);assert.equal(r.expandedBytes,Buffer.byteLength(JSON.stringify(value)));
 assert.throws(()=>a.archive('roundtrip',value),/EEXIST/);
 const smallRoot=path.join(root,'small'),small=new Archive(smallRoot,{normalLimit:64,emergencyLimit:4096});let budget;
 try{small.archive('too-large',{payload:'x'.repeat(1024)});}catch(e){budget=e.budget;}
 assert.ok(budget);small.archive('failure',{reason:'forced budget refusal',budget},{emergency:true});assert.equal(decodeFile(smallRoot,'failure').reason,'forced budget refusal');assert.equal(small.normalBytes,0);
 const dictionary=path.join(root,'genomes', [...a.genomes][0]+'.json.gz');const old=readFileSync(dictionary);writeFileSync(dictionary,old.subarray(0,10));assert.throws(()=>decodeFile(root,'roundtrip'));
 console.log('Archive checks passed: exact JSON/genome deduplication, exclusive writes, budget refusal, independent emergency retention and corruption rejection.');
}finally{rmSync(root,{recursive:true,force:true});}
