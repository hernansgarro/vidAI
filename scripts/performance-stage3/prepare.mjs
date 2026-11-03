import {readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root = resolve('.'), target = resolve('.audit-stage3'); mkdirSync(target, {recursive: true});
const digest = {};
for (const file of readdirSync(root).filter(f => f.endsWith('.ts'))) {
  let source = readFileSync(resolve(root, file), 'utf8');
  digest[file] = createHash('sha256').update(source).digest('hex');
  const patch = (from, to) => {
    if (source.split(from).length !== 2) throw new Error(`Expected one source anchor: ${file}: ${from.slice(0, 90)}`);
    source = source.replace(from, to);
  };
  if (file === 'simulation.ts') {
    source = `import {probe} from '../scripts/performance-stage3/probe.mjs';\n${source}`;
    patch('  const channels = tubeGeometry(settings, state.selfTubes);\n  const transitBefore', '  probe.begin();\n  const channels = tubeGeometry(settings, state.selfTubes);\n  const transitBefore');
    patch('  let sharedHatchObstacles:', "  probe.switch('incubation-hatching');\n  let sharedHatchObstacles:");
    patch('  // Nutrient vision broadphase', "  probe.switch('vision-and-organism-update');\n  // Nutrient vision broadphase");
    patch('    // B. RECURRENT NEURAL EVALUATION.', "    probe.switch('neural-and-learning');\n    // B. RECURRENT NEURAL EVALUATION.");
    patch('    // A. MULTI-EYE OPTICAL RGB RAYCAST', "    probe.switch('vision-and-organism-update');\n    // A. MULTI-EYE OPTICAL RGB RAYCAST");
    patch('  // All bodies advance on the same substep clock.', "  probe.switch('physics-and-contacts');\n  // All bodies advance on the same substep clock.");
    patch('  for (let index = active.length - 1; index >= 0; index--) {\n    const org = active[index], g = org.genome;\n    let frameMechanicalWork', "  probe.switch('metabolism-feeding-reproduction');\n  for (let index = active.length - 1; index >= 0; index--) {\n    const org = active[index], g = org.genome;\n    let frameMechanicalWork");
    patch('  // 6. Bubbles', "  probe.switch('bubbles-tubes-finalization');\n  // 6. Bubbles");
    patch('  if (state.energyPool) state.energyPool.reserve += returnedEnergy;\n}', '  if (state.energyPool) state.energyPool.reserve += returnedEnergy;\n  probe.end();\n}');
    patch('    scratchMasses[i] = mass;', "    probe.count('mass-inertia-derivations');\n    scratchMasses[i] = mass;");
    patch('    org.rayHits = [];', "    probe.count('eye-rays', g.eyes.length * RAYS_PER_EYE);\n    probe.count('food-scan-multiplier', nutrients.length);\n    org.rayHits = [];");
    patch('        for (const candidate of candidates) {', "        probe.count('optical-candidates', candidates.length);\n        probe.count('optical-full-scan-alternative', sightEntries.length);\n        for (const candidate of candidates) {");
    patch('        for (const i of preyGrid.queryBounds(left, top, right, bottom).reverse()) {', "        const auditPrey = preyGrid.queryBounds(left, top, right, bottom).reverse();\n        probe.count('oral-prey-candidates', auditPrey.length);\n        for (const i of auditPrey) {");
    patch('      for (const i of oralFoodGrid.queryBounds(left, top, right, bottom).reverse()) {', "      const auditFood = oralFoodGrid.queryBounds(left, top, right, bottom).reverse();\n      probe.count('oral-food-candidates', auditFood.length);\n      probe.count('oral-food-full-scan-alternative', nutrients.length);\n      for (const i of auditFood) {");
    patch('      sightGrid = new OrderedSpatialIndex', "      probe.count('optical-index-builds');\n      sightGrid = new OrderedSpatialIndex");
  }
  if (file === 'selfTubes.ts') {
    source = `import {probe} from '../scripts/performance-stage3/probe.mjs';\n${source}`;
    patch('  if (inTubeWater(g, x, y)) return;', "  probe.count('tube-wall-queries');\n  if (inTubeWater(g, x, y)) return;");
    patch('    const record = structuredClone(source);', "    probe.count('tube-crossings');\n    const record = structuredClone(source);");
  }
  if (file === 'contacts.ts') {
    source = `import {probe} from '../scripts/performance-stage3/probe.mjs';\n${source}`;
    patch('    let contactCount = 0;', "    probe.count('contact-iterations');\n    let contactCount = 0;");
    patch('      const contact = rotatedContact', "      probe.count('contact-narrowphase');\n      const contact = rotatedContact");
  }
  writeFileSync(resolve(target, file), source);
}
for (const item of ['data', 'utils', 'playground_config.json']) cpSync(resolve(root, item), resolve(target, item), {recursive: true});
writeFileSync(resolve(target, 'sources.json'), JSON.stringify(digest, null, 2));
console.log('Prepared disposable diagnostic modules; production source unchanged.');
