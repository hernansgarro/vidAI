import assert from 'node:assert/strict';
import {test} from 'node:test';
import {scenarioObserverPreferences, restoreObserverPreferences} from '../observerPreferences';
import {createScenarioWorld} from '../environmentScenarios';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot} from '../persistence';

test('scenario observation defaults are independent, editable and never change simulated state', () => {
  for (const scenario of ['default', 'harsh-world'] as const) {
    const f = createScenarioWorld(DEFAULT_SETTINGS, scenario, 71, 'balanced', 'standard', 0);
    const enabled = scenario === 'default';
    assert.deepEqual(f.observerPreferences, {selectAddedCreature: enabled, trackSelectedCreature: enabled});
    const before = createSnapshot(f.state, f.settings);
    f.observerPreferences.selectAddedCreature = !enabled;
    assert.deepEqual(createSnapshot(f.state, f.settings), before);
    assert.deepEqual(scenarioObserverPreferences(scenario), {selectAddedCreature: enabled, trackSelectedCreature: enabled});
    const saved = createSnapshot(f.state, f.settings, {observerPreferences: f.observerPreferences});
    const loaded = restoreSnapshot(saved);
    assert.deepEqual(loaded.state.prng.getState(), f.state.prng.getState());
    assert.deepEqual(createSnapshot(loaded.state, loaded.settings).state, before.state);
    assert.deepEqual(restoreObserverPreferences(loaded.metadata.observerPreferences), f.observerPreferences);
  }
});
test('both checkboxes restore independently; omitted historical metadata keeps enabled defaults', () => {
  for (const selectAddedCreature of [false, true]) for (const trackSelectedCreature of [false, true]) {
    const value = {selectAddedCreature, trackSelectedCreature};
    assert.deepEqual(restoreObserverPreferences(value), value);
  }
  for (const value of [undefined, null, 'bad', {selectAddedCreature: 'false'}])
    assert.deepEqual(restoreObserverPreferences(value), {selectAddedCreature: true, trackSelectedCreature: true});
});
