// Lossless research evidence codec. Never imported by the simulation/product.
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export const sha=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const marker='$stage39.genome.sha256';
export function decodeFile(root,name){
 const envelope=JSON.parse(gunzipSync(fs.readFileSync(path.join(root,name+'.json.gz'))));
 const decode=v=>{
  if(Array.isArray(v))return v.map(decode);
  if(v&&typeof v==='object'){
   if(Object.keys(v).length===1&&typeof v[marker]==='string'){
    const raw=gunzipSync(fs.readFileSync(path.join(root,'genomes',v[marker]+'.json.gz')));if(sha(raw)!==v[marker])throw Error('Genome dictionary hash mismatch');return JSON.parse(raw);
   }
   return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decode(x)]));
  }
  return v;
 };
 if(envelope.format!=='stage39-lossless-v1')throw Error('Unknown archive envelope');
 const value=decode(envelope.value),raw=Buffer.from(JSON.stringify(value));
 if(sha(raw)!==envelope.expandedSHA256||raw.length!==envelope.expandedBytes)throw Error('Expanded evidence differs');
 return value;
}
export class Archive{
 constructor(root,{normalLimit=192*1024*1024,emergencyLimit=2*1024*1024}={}){this.root=root;this.normalLimit=normalLimit;this.emergencyLimit=emergencyLimit;this.normalBytes=0;this.emergencyBytes=0;this.logicalBytes=0;this.receipts=[];this.genomes=new Set();fs.mkdirSync(root,{recursive:true});}
 writeRaw(name,raw,emergency=false){
  const current=emergency?this.emergencyBytes:this.normalBytes,limit=emergency?this.emergencyLimit:this.normalLimit;
  if(current+raw.length>limit){const e=Error('Research archive budget refusal');e.budget={name,proposedStoredBytes:raw.length,availableStoredBytes:limit-current,emergency};throw e;}
  const file=path.join(this.root,name+'.json.gz');fs.mkdirSync(path.dirname(file),{recursive:true});const bytes=gzipSync(raw),fd=fs.openSync(file,'wx');try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  const retained=fs.readFileSync(file);if(sha(retained)!==sha(bytes)||!gunzipSync(retained).equals(raw))throw Error('Archive readback failed');
  if(emergency)this.emergencyBytes+=raw.length;else this.normalBytes+=raw.length;
  const r={name,sha256:sha(retained),bytes:retained.length,storedRawBytes:raw.length,emergency};this.receipts.push(r);return r;
 }
 packValue(value){
  const encode=(v,key)=>{
   if(key==='genome'&&v&&typeof v==='object'&&!Array.isArray(v)){
    const raw=Buffer.from(JSON.stringify(v)),h=sha(raw);
    if(!this.genomes.has(h)){this.writeRaw('genomes/'+h,raw);this.genomes.add(h);}
    return {[marker]:h};
   }
   if(Array.isArray(v))return v.map(x=>encode(x,null));
   if(v&&typeof v==='object'){
    if(Object.keys(v).length===1&&marker in v)throw Error('Reserved archive marker collision');
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x,k)]));
   }
   return v;
  };
  return encode(value,null);
 }
 archive(name,value,{emergency=false}={}){
  const original=Buffer.from(JSON.stringify(value));
  // Emergency metadata must be small and genome-free, independent of the normal budget.
  const normalized=JSON.parse(original),packed=emergency?normalized:this.packValue(normalized);
  const envelope={format:'stage39-lossless-v1',expandedSHA256:sha(original),expandedBytes:original.length,value:packed};
  const receipt=this.writeRaw(name,Buffer.from(JSON.stringify(envelope)),emergency);receipt.expandedBytes=original.length;receipt.expandedSHA256=sha(original);this.logicalBytes+=original.length;
  const decoded=decodeFile(this.root,name);if(JSON.stringify(decoded)!==original.toString())throw Error('Exact JSON roundtrip failed');return receipt;
 }
}
