import {forwardRef, memo, useImperativeHandle, useMemo, useReducer, useRef, useState, type ForwardedRef} from 'react';
import {CircleSlash, Handshake, Minus, Phone, PhoneOff, RotateCcw, WifiOff} from 'lucide-react';
import {drawGlassTubes, glassTubeRuns, GLASS_TUBE_LENGTH, sideWindowLayout} from './sideWindows';
import {createWindowDemo, demoHandDirection, oppositeDemoSide, suspendedDemoAgreements,
  windowDemoReducer, windowDemoState, WINDOW_DEMO_LABELS, type DemoSide, type WindowDemoState} from './windowDemo';
import './sideWindowDemo.css';

type Camera = {readonly current: {x: number; y: number; zoom: number}};
type Anchor = {node: HTMLDivElement; x: number; y: number; dx: number; dy: number; floating?: DemoSide};
export type SideWindowDemoHandle = {sync(): void; paint(ctx: CanvasRenderingContext2D, zoom: number): void};

function HandGlyph({side, state}: {side: DemoSide; state: WindowDemoState}) {
  const direction = demoHandDirection(side, state), rejection = state === 'rejected';
  const reference = rejection ? (direction === 'right' ? '🫸' : '🫷') : (direction === 'right' ? '🫱' : '🫲');
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-hand-direction={direction}
    data-unicode-reference={reference} style={{transform: direction === 'left' ? 'scaleX(-1)' : undefined}}>
    {rejection ? <>
      <path d="M3 19h4V9a1.3 1.3 0 0 1 2.6 0v3-7a1.3 1.3 0 0 1 2.6 0v7-8a1.3 1.3 0 0 1 2.6 0v8-6a1.3 1.3 0 0 1 2.6 0v8l1.2-1.7a1.5 1.5 0 0 1 2.4 1.8l-3 5A5 5 0 0 1 14 21H7"/>
      <path d="M3 16h4"/>
    </> : <>
      <path d="M2 12h4l2-6a1.4 1.4 0 0 1 2.7.8L10 10h9.5a1.3 1.3 0 0 1 0 2.6H14h6.5a1.3 1.3 0 0 1 0 2.6H14h5a1.3 1.3 0 0 1 0 2.6H13h3a1.3 1.3 0 0 1 0 2.6h-5a7 7 0 0 1-5-2H2"/>
      <path d="M5 12v6"/>
    </>}
  </svg>;
}

export function WindowDemoIcon({side, state}: {side: DemoSide; state: WindowDemoState}) {
  if (state === 'outgoing' || state === 'incoming' || state === 'rejected') return <HandGlyph side={side} state={state}/>;
  if (state === 'accepted') return <Handshake size={20} aria-hidden="true"/>;
  if (state === 'unavailable') return <CircleSlash size={19} aria-hidden="true"/>;
  return <Minus size={18} aria-hidden="true"/>;
}

function SideWindowDemo({width, height, camera, viewportWidth, viewportHeight}: {
  width: number; height: number; camera: Camera; viewportWidth: number; viewportHeight: number;
}, ref: ForwardedRef<SideWindowDemoHandle>) {
  const [demo, dispatch] = useReducer(windowDemoReducer, undefined, createWindowDemo);
  const [panel, setPanel] = useState<DemoSide | null>(null);
  const [draft, setDraft] = useState('');
  const anchors = useRef(new Map<string, Anchor>());
  const previousCamera = useRef('');
  const {count, sectionHeight} = sideWindowLayout(height);
  const connected = demo.call?.status === 'connected';
  const tubes = useMemo(() => {
    const accepted = (side: DemoSide) => connected ? Object.entries(demo.windows[side])
      .filter(([, state]) => state === 'accepted').map(([index]) => Number(index)) : [];
    return {L: glassTubeRuns(height, accepted('L')), R: glassTubeRuns(height, accepted('R'))};
  }, [demo.windows, connected, height]);
  const place = (anchor: Anchor) => {
    const {x, y, zoom} = camera.current;
    let left = viewportWidth / 2 + (anchor.x - x) * zoom + anchor.dx;
    let top = viewportHeight / 2 + (anchor.y - y) * zoom + anchor.dy;
    if (anchor.floating) {
      left -= anchor.floating === 'L' ? anchor.node.offsetWidth : 0;
      top -= anchor.node.offsetHeight + 12;
      left = Math.max(12, Math.min(left, viewportWidth - anchor.node.offsetWidth - 12));
      top = Math.max(12, Math.min(top, viewportHeight - anchor.node.offsetHeight - 12));
    }
    anchor.node.style.transform = `translate3d(${left}px,${top}px,0)`;
  };
  const bind = (key: string, x: number, y: number, dx: number, dy = 0, floating?: DemoSide) => (node: HTMLDivElement | null) => {
    if (!node) {anchors.current.delete(key); return;}
    const anchor = {node, x, y, dx, dy, floating}; anchors.current.set(key, anchor); place(anchor);
  };
  useImperativeHandle(ref, () => ({
    // Existing draw pass owns positioning and painting. No additional animation loop.
    sync() {
      const {x, y, zoom} = camera.current, signature = `${x},${y},${zoom},${viewportWidth},${viewportHeight}`;
      if (signature !== previousCamera.current) {
        for (const anchor of anchors.current.values()) place(anchor);
        previousCamera.current = signature;
      }
    },
    paint(ctx, zoom) {drawGlassTubes(ctx, width, zoom, tubes);},
  }), [camera, width, height, viewportWidth, viewportHeight, tubes]);
  const openPhone = (side: DemoSide) => {setDraft(demo.name); setPanel(panel === side ? null : side);};

  return <div className="side-demo-layer" role="region" aria-label="Local aquarium connections"
    onKeyDown={event => {
      // Name typing and native control keys must never trigger simulation shortcuts.
      event.stopPropagation();
      if (event.key === 'Escape') setPanel(null);
    }}>
    <div className="side-demo-toolbar">
      <span>Connections · local preview</span>
      <button type="button" aria-label="Reset local connections" title="Clear local name, calls and window agreements"
        onClick={() => {dispatch({type: 'reset'}); setPanel(null); setDraft('');}}><RotateCcw size={13} aria-hidden="true"/></button>
    </div>
    {(['L', 'R'] as const).map(side => {
      const sign = side === 'L' ? -1 : 1, wall = side === 'L' ? 0 : width;
      const incoming = demo.call?.status === 'pending' && demo.call.from !== side;
      const outgoing = demo.call?.status === 'pending' && demo.call.from === side;
      const suspended = suspendedDemoAgreements(demo, side, count);
      return <div key={side}>
        {Array.from({length: count}, (_, index) => {
          const id = `${side}${index}`, stored = windowDemoState(demo, side, index);
          const state = connected ? stored : 'unavailable';
          const action = !connected ? 'Choose a person through the phone first' : state === 'incoming' ? 'Accept window offer'
            : state === 'outgoing' ? 'Cancel outgoing window offer' : state === 'accepted' ? 'Close this preview tube' : 'Offer this window';
          return <div key={id} className="side-demo-anchor"
            ref={bind(id, wall + sign * GLASS_TUBE_LENGTH, height - (index + .5) * sectionHeight, sign * 12)}>
            <div className={`side-demo-window-position side-demo-${side}`}>
              <button type="button" className="side-demo-window" data-state={state} data-testid={`side-demo-window-${id}`}
                aria-label={`${id}: ${WINDOW_DEMO_LABELS[state]}. ${action}`} disabled={!connected}
                title={`${id} · ${WINDOW_DEMO_LABELS[state]}. ${action}. Visual only; physical wall stays closed.`}
                onClick={() => dispatch({type: 'window', side, index, count})}>
                <WindowDemoIcon side={side} state={state}/>
              </button>
              {state === 'incoming' && <button type="button" className="side-demo-decline"
                aria-label={`Decline window offer ${id}`} title="Decline this window offer"
                onClick={() => dispatch({type: 'reject', side, index})}>×</button>}
            </div>
          </div>;
        })}
        <div className="side-demo-anchor" ref={bind(`phone-${side}`, wall, height, sign * 10, 20)}>
          <div className={`side-demo-phone-position side-demo-${side}`}>
            <div className="side-demo-phone-row">
              <button type="button" className="side-demo-phone" aria-expanded={panel === side || incoming}
                data-connected={connected} data-ringing={incoming} data-testid={`side-demo-phone-${side}`}
                aria-label={`${side === 'L' ? 'Left' : 'Right'} phone: ${incoming ? 'incoming self-call' : connected ? 'connected to ' + demo.name : demo.available[side] ? 'available' : 'off'}`}
                title="Local caller name and people menu" onClick={() => openPhone(side)}>
                {connected || incoming || outgoing || demo.available[side] ? <Phone size={17} aria-hidden="true"/> : <PhoneOff size={17} aria-hidden="true"/>}
              </button>
              <span className="side-demo-peer">{demo.name || 'Phone off'}<small>{incoming ? 'Incoming call' : outgoing ? 'Calling opposite side…' : connected ? 'Self-connected · visual only' : demo.available[side] ? 'Available · this tank only' : 'Unavailable'}</small></span>
            </div>
            {suspended.length > 0 && <div className="side-demo-suspended" aria-label={`${side} suspended window agreements`}>
              {suspended.map(index => <button type="button" key={index} data-testid={`side-demo-suspended-${side}${index}`}
                title={`${side}${index} suspended — agreement retained. Click to cancel it.`}
                aria-label={`Cancel suspended agreement ${side}${index}`}
                onClick={() => dispatch({type: 'clear', side, index})}>
                <WifiOff size={12} aria-hidden="true"/>{side}{index}<span aria-hidden="true">×</span>
              </button>)}
            </div>}
          </div>
        </div>
        {(incoming || outgoing || panel === side) && <div className={`side-demo-anchor side-demo-card side-demo-card-${side}`}
          style={{width: Math.min(280, viewportWidth - 24), maxHeight: Math.max(120, viewportHeight - 24)}}
          ref={bind(`panel-${side}`, wall, height, sign * 10, 20, side)}
          role="region" aria-label={`${side} phone menu`}>
          {incoming ? <>
            <div role="status" className="side-demo-call-title">{demo.name} is calling</div>
            <p>From the opposite side of this tank. Windows remain closed until separately accepted.</p>
            <div className="side-demo-card-actions">
              <button type="button" data-testid={`side-call-accept-${side}`} onClick={() => {dispatch({type: 'answer', side, accept: true}); setPanel(null);}}>Accept</button>
              <button type="button" onClick={() => {dispatch({type: 'answer', side, accept: false}); setPanel(null);}}>Decline</button>
            </div>
          </> : outgoing ? <>
            <div role="status">Calling {demo.name} · opposite side</div>
            <p>Waiting for the other phone to accept. You can keep using the aquarium.</p>
            <button type="button" onClick={() => {dispatch({type: 'cancel-call', side}); setPanel(side);}}>Cancel call</button>
          </> : <>
            <div className="side-demo-card-heading"><strong>{side === 'L' ? 'Left' : 'Right'} phone</strong>
              <button type="button" aria-label={`Close ${side} phone menu`} onClick={() => setPanel(null)}>×</button></div>
            <form onSubmit={event => {event.preventDefault(); dispatch({type: 'name', name: draft});}}>
              <label htmlFor={`caller-name-${side}`}>Your display name</label>
              <div className="side-demo-name-row"><input id={`caller-name-${side}`} value={draft} required maxLength={32}
                autoComplete="off" placeholder="Your name" onChange={event => setDraft(event.target.value)} autoFocus={!demo.name}/>
                <button type="submit" disabled={!draft.trim()}>Save</button></div>
            </form>
            <small>Name stays in this page session. No account or online directory.</small>
            {demo.name && <>
              <button type="button" className="side-demo-availability" aria-pressed={demo.available[side]}
                onClick={() => dispatch({type: 'availability', side})}>{demo.available[side] ? 'Turn availability off' : 'Make phone available'}</button>
              {connected ? <>
                <p>Connected to {demo.name} · same tank. Offer a numbered window, then accept at its opposite end.</p>
                <button type="button" onClick={() => dispatch({type: 'disconnect', side})}>Disconnect · retain agreements</button>
              </> : <>
                <h3>Available people · local</h3>
                {demo.available.L && demo.available.R ? <button type="button" className="side-demo-person" data-testid={`side-person-self-${side}`}
                  onClick={() => {dispatch({type: 'call', side}); setPanel(null);}}>{demo.name} <small>You · opposite {oppositeDemoSide(side)} phone</small></button>
                  : <p>No available opposite phone. Enable availability on both sides to call yourself.</p>}
              </>}
            </>}
          </>}
        </div>}
      </div>;
    })}
  </div>;
}

export default memo(forwardRef(SideWindowDemo));
