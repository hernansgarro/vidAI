import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createWindowDemo, demoHandDirection, suspendedDemoAgreements, windowDemoReducer,
  windowDemoState, WINDOW_DEMO_STATES} from '../windowDemo';

test('each side cycles all mock states and phones independently without mutating prior state', () => {
  const initial = createWindowDemo(); let demo = initial;
  for (const expected of [...WINDOW_DEMO_STATES.slice(1), 'closed']) {
    demo = windowDemoReducer(demo, {type: 'cycle', side: 'L', index: 2});
    assert.equal(windowDemoState(demo, 'L', 2), expected);
    assert.equal(windowDemoState(demo, 'R', 2), 'closed');
  }
  demo = windowDemoReducer(demo, {type: 'phone', side: 'L'});
  assert.deepEqual(demo.phones, {L: true, R: false});
  assert.deepEqual(initial, createWindowDemo());
});

test('extended and rejecting hands point outward; incoming hands reverse according to side', () => {
  assert.equal(demoHandDirection('L', 'outgoing'), 'left'); assert.equal(demoHandDirection('R', 'outgoing'), 'right');
  assert.equal(demoHandDirection('L', 'incoming'), 'right'); assert.equal(demoHandDirection('R', 'incoming'), 'left');
  assert.equal(demoHandDirection('L', 'rejected'), 'left'); assert.equal(demoHandDirection('R', 'rejected'), 'right');
});

test('paired rehearsal mirrors offers and agreements, retaining any already accepted window', () => {
  let demo = windowDemoReducer(createWindowDemo(), {type: 'set', side: 'R', index: 4, state: 'accepted'});
  demo = windowDemoReducer(demo, {type: 'pair'});
  assert.equal(windowDemoState(demo, 'L', 4), 'accepted'); assert.deepEqual(demo.phones, {L: true, R: true});
  demo = windowDemoReducer(demo, {type: 'cycle', side: 'L', index: 2});
  assert.equal(windowDemoState(demo, 'L', 2), 'outgoing'); assert.equal(windowDemoState(demo, 'R', 2), 'incoming');
  demo = windowDemoReducer(demo, {type: 'set', side: 'R', index: 2, state: 'accepted'});
  assert.equal(windowDemoState(demo, 'L', 2), 'accepted');
  demo = windowDemoReducer(demo, {type: 'phone', side: 'L'});
  assert.deepEqual(demo.phones, {L: false, R: false});
  assert.equal(windowDemoState(demo, 'L', 2), 'accepted', 'phone changes never silently cancel agreements');
});

test('height loss suspends accepted agreements without creating sections; regrowth restores until explicit cancellation', () => {
  let demo = windowDemoReducer(createWindowDemo(), {type: 'set', side: 'L', index: 4, state: 'accepted'});
  demo = windowDemoReducer(demo, {type: 'set', side: 'L', index: 3, state: 'outgoing'});
  assert.deepEqual(suspendedDemoAgreements(demo, 'L', 5), []);
  assert.deepEqual(suspendedDemoAgreements(demo, 'L', 2), [4]);
  assert.equal(windowDemoState(demo, 'L', 4), 'accepted');
  assert.deepEqual(suspendedDemoAgreements(demo, 'L', 5), []);
  demo = windowDemoReducer(demo, {type: 'set', side: 'L', index: 4, state: 'closed'});
  assert.deepEqual(suspendedDemoAgreements(demo, 'L', 2), []); assert.equal(windowDemoState(demo, 'L', 4), 'closed');
  assert.deepEqual(windowDemoReducer(demo, {type: 'reset'}), createWindowDemo());
});
