import type {MaintainedWorldGrid} from '../../maintainedGrid';
import type {GridEntry} from '../../centralSpatialGrid';
import type {WorldGridValue} from '../../maintainedGrid';

/** REJECTABLE TEST-ONLY C prototype. Never imported by the application.
 * Exact-argument keys, no geometric hits, <=32 arrays of <=256 references.
 * Deliberately conservative: EVERY mutation invalidates even same-cell updates.
 */
export function installP10Cache(grid: MaintainedWorldGrid) {
  const cache = new Map<string, GridEntry<WorldGridValue>[]>();
  const stats = {hits: 0, misses: 0, invalidations: 0, maxEntries: 0, maxReferences: 0};
  const restore: (() => void)[] = [];
  const encode = (value: unknown): unknown => typeof value === 'number'
    ? Object.is(value,-0) ? '-0' : String(value) : Array.isArray(value) ? value.map(encode)
      : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encode(v)])) : value;
  const mutate = ['syncFood','syncEgg','syncOrganism','remove','removeOrganism','refreshRanks','synchronize','dispose'] as const;
  for (const name of mutate) {
    const original = grid[name];
    (grid as any)[name] = (...args: any[]) => {
      cache.clear(); stats.invalidations++;
      return (original as any).apply(grid,args);
    };
    restore.push(()=>{(grid as any)[name]=original;});
  }
  for (const name of ['queryBounds','queryRay'] as const) {
    const original = grid[name];
    (grid as any)[name] = (...args: any[]) => {
      // A filter closes over mouth state and has no stable key. Never cache it.
      if (args.some(a=>typeof a==='function')) return (original as any).apply(grid,args);
      const key = name+JSON.stringify(encode(args));
      const found = cache.get(key);
      if (found) {stats.hits++;return found.slice();}
      stats.misses++;
      const result = (original as any).apply(grid,args) as GridEntry<WorldGridValue>[];
      if (result.length<=256) {
        if (cache.size===32) cache.delete(cache.keys().next().value!);
        cache.set(key,result.slice());
        stats.maxEntries=Math.max(stats.maxEntries,cache.size);
        stats.maxReferences=Math.max(stats.maxReferences,[...cache.values()].reduce((n,v)=>n+v.length,0));
      }
      return result;
    };
    restore.push(()=>{(grid as any)[name]=original;});
  }
  return {stats, get size(){return cache.size;}, uninstall(){restore.reverse().forEach(f=>f());cache.clear();}};
}
