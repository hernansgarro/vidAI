/** Ephemeral observer-interface state. Never import into simulation or saves. */
export type DemoSide = 'L' | 'R';
export const WINDOW_DEMO_STATES = ['closed', 'outgoing', 'incoming', 'accepted', 'rejected', 'unavailable'] as const;
export type WindowDemoState = typeof WINDOW_DEMO_STATES[number];
export const WINDOW_DEMO_LABELS: Record<WindowDemoState, string> = {
  closed: 'Closed', outgoing: 'Outgoing offer', incoming: 'Incoming offer',
  accepted: 'Accepted', rejected: 'Rejected', unavailable: 'Unavailable',
};
export type WindowDemo = {paired: boolean; phones: Record<DemoSide, boolean>;
  windows: Record<DemoSide, Record<number, WindowDemoState>>};
export type WindowDemoAction = {type: 'phone'; side: DemoSide} | {type: 'cycle'; side: DemoSide; index: number}
  | {type: 'set'; side: DemoSide; index: number; state: WindowDemoState} | {type: 'pair'} | {type: 'reset'};
export function createWindowDemo(): WindowDemo {
  return {paired: false, phones: {L: false, R: false}, windows: {L: {}, R: {}}};
}
export function oppositeDemoSide(side: DemoSide): DemoSide {return side === 'L' ? 'R' : 'L';}
export function oppositeDemoState(state: WindowDemoState): WindowDemoState {
  return state === 'outgoing' ? 'incoming' : state === 'incoming' ? 'outgoing' : state;
}
export function windowDemoState(demo: WindowDemo, side: DemoSide, index: number): WindowDemoState {
  return demo.windows[side][index] ?? 'closed';
}
export function nextWindowDemoState(state: WindowDemoState): WindowDemoState {
  return WINDOW_DEMO_STATES[(WINDOW_DEMO_STATES.indexOf(state) + 1) % WINDOW_DEMO_STATES.length];
}
export function demoHandDirection(side: DemoSide, state: WindowDemoState): 'left' | 'right' {
  const outward = side === 'L' ? 'left' : 'right';
  return state === 'incoming' ? (outward === 'left' ? 'right' : 'left') : outward;
}
export function suspendedDemoAgreements(demo: WindowDemo, side: DemoSide, count: number): number[] {
  return Object.entries(demo.windows[side]).filter(([index, state]) => Number(index) >= count && state === 'accepted')
    .map(([index]) => Number(index)).sort((a, b) => a - b);
}
export function windowDemoReducer(demo: WindowDemo, action: WindowDemoAction): WindowDemo {
  if (action.type === 'reset') return createWindowDemo();
  if (action.type === 'phone') {
    const connected = !demo.phones[action.side];
    return {...demo, phones: demo.paired ? {L: connected, R: connected} : {...demo.phones, [action.side]: connected}};
  }
  if (action.type === 'pair') {
    if (demo.paired) return {...demo, paired: false};
    const windows: WindowDemo['windows'] = {L: {}, R: {}};
    const indices = new Set([...Object.keys(demo.windows.L), ...Object.keys(demo.windows.R)]);
    for (const key of indices) {
      const index = Number(key), left = windowDemoState(demo, 'L', index), right = windowDemoState(demo, 'R', index);
      // Pairing is a visual rehearsal: preserve any accepted demo agreement.
      const state = left === 'accepted' || right === 'accepted' ? 'accepted'
        : left !== 'closed' ? left : oppositeDemoState(right);
      if (state !== 'closed') {windows.L[index] = state; windows.R[index] = oppositeDemoState(state);}
    }
    return {paired: true, phones: {L: true, R: true}, windows};
  }
  const state = action.type === 'cycle' ? nextWindowDemoState(windowDemoState(demo, action.side, action.index)) : action.state;
  const windows = {L: {...demo.windows.L}, R: {...demo.windows.R}};
  const set = (side: DemoSide, value: WindowDemoState) => {
    if (value === 'closed') delete windows[side][action.index]; else windows[side][action.index] = value;
  };
  set(action.side, state);
  if (demo.paired) set(oppositeDemoSide(action.side), oppositeDemoState(state));
  return {...demo, windows};
}
