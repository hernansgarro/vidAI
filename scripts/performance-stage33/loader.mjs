/** Stage3.3 read-only, in-memory loader. No app module imports this file. */
import {registerHooks, stripTypeScriptTypes} from 'node:module';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=process.cwd(), cfg=JSON.parse(process.env.VIDA_STAGE33_SLOT??'{}');
globalThis.__stage33Sources={};
registerHooks({
 resolve(specifier,context,next) {
  if(specifier.startsWith('.')||specifier.startsWith('file:')) {
   let path=specifier.startsWith('file:')?fileURLToPath(specifier):resolve(dirname(fileURLToPath(context.parentURL??pathToFileURL(root+'/entry.mjs').href)),specifier);
   if(!extname(path)) {if(existsSync(path+'.ts'))path+='.ts';else if(existsSync(path+'.json'))path+='.json';}
   if(existsSync(path)&&/\.(ts|json)$/.test(path))return {url:pathToFileURL(path).href,shortCircuit:true};
  }
  return next(specifier,context);
 },
 load(url,context,next) {
  if(!url.startsWith('file:')||!/\.(ts|json)$/.test(url))return next(url,context);
  const path=fileURLToPath(url), original=readFileSync(path,'utf8');let source=original;
  if(url.endsWith('.json'))return {format:'module',source:'export default '+original+';',shortCircuit:true};
  const patch=(from,to)=>{if(source.split(from).length!==2)throw new Error('Unique diagnostic anchor failed: '+path+' '+from);source=source.replace(from,to);};
  if(cfg.mode==='diagnostic'&&path===resolve(root,'simulation.ts')) {
   patch('  let weightedVy = 0;','  let weightedVy = 0;\n  const __comStart = globalThis.__stage33.start();');
   patch('  return {\n    x: totalMass > 0 ?', "  globalThis.__stage33.end('com',__comStart,org.genome.parts);\n  return {\n    x: totalMass > 0 ?");
   patch('  // Local geometry/masses stay constant while projection changes poses.', '  const __projectionStart = globalThis.__stage33.start();\n  // Local geometry/masses stay constant while projection changes poses.');
   patch('    entry.paX = pa.x; entry.paY = pa.y; entry.pbX = pb.x; entry.pbY = pb.y;\n  }\n  for (let iteration', "    entry.paX = pa.x; entry.paY = pa.y; entry.pbX = pb.x; entry.pbY = pb.y;\n  }\n  globalThis.__stage33.end('projectionSetup',__projectionStart,parts,1);\n  for (let iteration");
   patch('  const partCount = org.segments.length;\n  for (let i = 0; i < partCount; i++) {','  const partCount = org.segments.length;\n  const __massStart = globalThis.__stage33.start();\n  for (let i = 0; i < partCount; i++) {');
   patch('  let frameMechanicalWork = 0;', "  globalThis.__stage33.end('substepMetadata',__massStart,g.parts);\n  let frameMechanicalWork = 0;");
  }
  if(cfg.mode==='diagnostic'&&path===resolve(root,'contacts.ts')) {
   patch('function bodies(organisms: Organism[], density: number): Body[] {','function bodies(organisms: Organism[], density: number): Body[] {\n  const __bodyStart = globalThis.__stage33.start();');
   patch('  bodyPool.length = list.length;\n  return list;', "  globalThis.__stage33.end('contactBodies',__bodyStart,list,0,true);\n  bodyPool.length = list.length;\n  return list;");
  }
  const sha=s=>createHash('sha256').update(s).digest('hex');
  globalThis.__stage33Sources[path.slice(root.length+1)]={original:sha(original),loaded:sha(source)};
  return {format:'module',source:stripTypeScriptTypes(source,{mode:'transform',sourceUrl:url}),shortCircuit:true};
 }
});
