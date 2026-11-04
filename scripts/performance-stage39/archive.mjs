// Lossless research evidence codec. Never imported by the simulation/product.
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
export const sha=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const marker='$stage39.genome.sha256',numbers='$stage39.float64le',table='$stage39.columns',edge='$stage39.edgeIndex';
export function decodeFile(root,name){
 const envelope=JSON.parse(gunzipSync(fs.readFileSync(path.join(root,name+'.json.gz'))));
 const labels=envelope.edgeDictionarySHA256?(()=>{const raw=gunzipSync(fs.readFileSync(path.join(root,'labels',envelope.edgeDictionarySHA256+'.json.gz')));if(sha(raw)!==envelope.edgeDictionarySHA256)throw Error('Edge dictionary hash mismatch');return JSON.parse(raw);})():[];
 const decode=v=>{
  if(Array.isArray(v))return v.map(decode);
  if(v&&typeof v==='object'){
   if(Object.keys(v).length===1&&typeof v[numbers]==='string'){const b=Buffer.from(v[numbers],'base64');if(b.length%8)throw Error('Invalid float64 evidence');return Array.from({length:b.length/8},(_,i)=>b.readDoubleLE(i*8));}
   if(Object.keys(v).length===1&&Number.isInteger(v[edge])){if(typeof labels[v[edge]]!=='string')throw Error('Missing edge dictionary entry');return labels[v[edge]];}
   if(Object.keys(v).length===1&&v[table]){const {keys,columns}=v[table],cs=columns.map(decode);return Array.from({length:cs[0].length},(_,i)=>Object.fromEntries(keys.map((k,j)=>[k,cs[j][i]])));}
   if(Object.keys(v).length===1&&typeof v[marker]==='string'){
    const raw=gunzipSync(fs.readFileSync(path.join(root,'genomes',v[marker]+'.json.gz')));if(sha(raw)!==v[marker])throw Error('Genome dictionary hash mismatch');return JSON.parse(raw);
   }
   return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decode(x)]));
  }
  return v;
 };
 if(!['stage39-lossless-v1','stage39-lossless-v2'].includes(envelope.format))throw Error('Unknown archive envelope');
 const value=decode(envelope.value),raw=Buffer.from(JSON.stringify(value));
 if(sha(raw)!==envelope.expandedSHA256||raw.length!==envelope.expandedBytes)throw Error('Expanded evidence differs');
 return value;
}
export class Archive{
 constructor(root,{normalLimit=192*1024*1024,emergencyLimit=2*1024*1024}={}){this.root=root;this.normalLimit=normalLimit;this.emergencyLimit=emergencyLimit;this.normalBytes=0;this.emergencyBytes=0;this.logicalBytes=0;this.receipts=[];this.genomes=new Set();this.labels=new Set();fs.mkdirSync(root,{recursive:true});}
 writeRaw(name,raw,emergency=false){
  const current=emergency?this.emergencyBytes:this.normalBytes,limit=emergency?this.emergencyLimit:this.normalLimit;
  if(current+raw.length>limit){const e=Error('Research archive budget refusal');e.budget={name,proposedStoredBytes:raw.length,availableStoredBytes:limit-current,emergency};throw e;}
  const file=path.join(this.root,name+'.json.gz');fs.mkdirSync(path.dirname(file),{recursive:true});const bytes=gzipSync(raw),fd=fs.openSync(file,'wx');try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  const retained=fs.readFileSync(file);if(sha(retained)!==sha(bytes)||!gunzipSync(retained).equals(raw))throw Error('Archive readback failed');
  if(emergency)this.emergencyBytes+=raw.length;else this.normalBytes+=raw.length;
  const r={name,sha256:sha(retained),bytes:retained.length,storedRawBytes:raw.length,emergency};this.receipts.push(r);return r;
 }
 packValue(value){
  const strings=new Set(),scan=v=>{if(Array.isArray(v)){for(const x of v)scan(x);}else if(v&&typeof v==='object'){for(const[k,x]of Object.entries(v)){if(k==='edge'&&typeof x==='string')strings.add(x);else if(k!=='genome')scan(x);}}};scan(value);const labels=[...strings].sort(),indices=new Map(labels.map((x,i)=>[x,i]));let dictionary=null;if(labels.length){const raw=Buffer.from(JSON.stringify(labels));dictionary=sha(raw);if(!this.labels.has(dictionary)){this.writeRaw('labels/'+dictionary,raw);this.labels.add(dictionary);}}
  const encode=(v,key)=>{
   if(key==='genome'&&Array.isArray(v))return v.map(x=>encode(x,'genome'));
   if(key==='edge'&&typeof v==='string')return {[edge]:indices.get(v)};
   if(key==='genome'&&v&&typeof v==='object'&&!Array.isArray(v)){
    const raw=Buffer.from(JSON.stringify(v)),h=sha(raw);
    if(!this.genomes.has(h)){this.writeRaw('genomes/'+h,raw);this.genomes.add(h);}
    return {[marker]:h};
   }
   if(Array.isArray(v)){
    if(v.length>=16&&v.every(x=>typeof x==='number'&&Number.isFinite(x))){const b=Buffer.allocUnsafe(v.length*8);v.forEach((x,i)=>b.writeDoubleLE(x,i*8));return {[numbers]:b.toString('base64')};}
    if(v.length>=8&&v.every(x=>x&&typeof x==='object'&&!Array.isArray(x))){const keys=Object.keys(v[0]),order=JSON.stringify(keys);if(keys.length>=2&&v.every(x=>JSON.stringify(Object.keys(x))===order))return {[table]:{keys,columns:keys.map(k=>encode(v.map(x=>x[k]),k))}};}
    return v.map(x=>encode(x,key==='edge'?'edge':null));
   }
   if(v&&typeof v==='object'){
    if(Object.keys(v).length===1&&[marker,numbers,table,edge].some(k=>k in v))throw Error('Reserved archive marker collision');
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x,k)]));
   }
   return v;
  };
  return {value:encode(value,null),dictionary};
 }
 archive(name,value,{emergency=false}={}){
  const original=Buffer.from(JSON.stringify(value));
  // Emergency metadata must be small and genome-free, independent of the normal budget.
  const normalized=JSON.parse(original),packed=emergency?{value:normalized,dictionary:null}:this.packValue(normalized);
  const envelope={format:'stage39-lossless-v2',expandedSHA256:sha(original),expandedBytes:original.length,edgeDictionarySHA256:packed.dictionary,value:packed.value};
  const receipt=this.writeRaw(name,Buffer.from(JSON.stringify(envelope)),emergency);receipt.expandedBytes=original.length;receipt.expandedSHA256=sha(original);this.logicalBytes+=original.length;
  const decoded=decodeFile(this.root,name);if(JSON.stringify(decoded)!==original.toString())throw Error('Exact JSON roundtrip failed');return receipt;
 }
}
