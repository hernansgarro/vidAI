import {forwardRef, memo, useImperativeHandle, useReducer, useRef, type ForwardedRef} from 'react';
import {CircleSlash, Handshake, Minus, Phone, PhoneOff, RotateCcw, WifiOff} from 'lucide-react';
import {sideWindowLayout} from './sideWindows';
import {createWindowDemo, demoHandDirection, nextWindowDemoState, suspendedDemoAgreements,
  windowDemoReducer, windowDemoState, WINDOW_DEMO_LABELS, type DemoSide, type WindowDemoState} from './windowDemo';
import './sideWindowDemo.css';

/** Space reserved by the current design journal for a later glass-channel preview.
 * It is only a control offset; the physical world is never expanded. */
const PREVIEW_CLEARANCE_WORLD = 300;
type Camera = {readonly current: {x: number; y: number; zoom: number}};
type Anchor = {node: HTMLDivElement; x: number; y: number; dx: number; dy: number};
export type SideWindowDemoHandle = {sync(): void};

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
  const anchors = useRef(new Map<string, Anchor>());
  const previousCamera = useRef('');
  const {count, sectionHeight} = sideWindowLayout(height);
  const place = (anchor: Anchor) => {
    const {x, y, zoom} = camera.current;
    anchor.node.style.transform = `translate3d(${viewportWidth / 2 + (anchor.x - x) * zoom + anchor.dx}px,${viewportHeight / 2 + (anchor.y - y) * zoom + anchor.dy}px,0)`;
  };
  const bind = (key: string, x: number, y: number, dx: number, dy = 0) => (node: HTMLDivElement | null) => {
    if (!node) {anchors.current.delete(key); return;}
    const anchor = {node, x, y, dx, dy}; anchors.current.set(key, anchor); place(anchor);
  };
  useImperativeHandle(ref, () => ({
    // Called from the existing canvas draw, after its camera update. No extra
    // animation loop, frame-by-frame React state or one-frame camera mismatch.
    sync() {
      const {x, y, zoom} = camera.current, signature = `${x},${y},${zoom},${viewportWidth},${viewportHeight}`;
      if (signature !== previousCamera.current) {
        for (const anchor of anchors.current.values()) place(anchor);
        previousCamera.current = signature;
      }
    },
  }), [camera, width, height, viewportWidth, viewportHeight]);

  return <div className="side-demo-layer" role="region" aria-label="Connection visual demonstration">
    <div className="side-demo-toolbar">
      <span>Connections · demo only</span>
      <button type="button" aria-pressed={demo.paired} data-testid="side-demo-pair"
        title="Pair the two sides only in this visual demonstration; no connection or wall opening"
        onClick={() => dispatch({type: 'pair'})}>Pair L ↔ R</button>
      <button type="button" aria-label="Reset connection demonstration" title="Reset all demonstration states"
        onClick={() => dispatch({type: 'reset'})}><RotateCcw size={13} aria-hidden="true"/></button>
    </div>
    {(['L', 'R'] as const).map(side => {
      const sign = side === 'L' ? -1 : 1, wall = side === 'L' ? 0 : width;
      const peer = demo.paired ? 'This tank' : side === 'L' ? 'Example West' : 'Example East';
      const suspended = suspendedDemoAgreements(demo, side, count);
      return <div key={side}>
        {Array.from({length: count}, (_, index) => {
          const id = `${side}${index}`, state = windowDemoState(demo, side, index), next = nextWindowDemoState(state);
          const action = state === 'accepted' ? 'Cancel demo agreement and show rejection' : `Next: ${WINDOW_DEMO_LABELS[next]}`;
          return <div key={id} className="side-demo-anchor"
            ref={bind(id, wall + sign * PREVIEW_CLEARANCE_WORLD, height - (index + .5) * sectionHeight, sign * 12)}>
            <div className={`side-demo-window-position side-demo-${side}`}>
              <button type="button" className="side-demo-window" data-state={state} data-testid={`side-demo-window-${id}`}
                aria-label={`${id} demo: ${WINDOW_DEMO_LABELS[state]}. ${action}`}
                title={`${id} · ${WINDOW_DEMO_LABELS[state]} (visual demo only). ${action}. Click to cycle states.`}
                onClick={() => dispatch({type: 'cycle', side, index})}>
                <WindowDemoIcon side={side} state={state}/>
              </button>
            </div>
          </div>;
        })}
        <div className="side-demo-anchor" ref={bind(`phone-${side}`, wall, height, sign * 10, 20)}>
          <div className={`side-demo-phone-position side-demo-${side}`}>
            <div className="side-demo-phone-row">
              <button type="button" className="side-demo-phone" aria-pressed={demo.phones[side]}
                data-testid={`side-demo-phone-${side}`} aria-label={`${side === 'L' ? 'Left' : 'Right'} phone demo: ${demo.phones[side] ? 'connected' : 'disconnected'}`}
                title="Toggle a simulated connection only. Accepted window demos are retained."
                onClick={() => dispatch({type: 'phone', side})}>
                {demo.phones[side] ? <Phone size={17} aria-hidden="true"/> : <PhoneOff size={17} aria-hidden="true"/>}
              </button>
              <span className="side-demo-peer">{demo.phones[side] ? peer : 'Offline'}<small>visual demo</small></span>
            </div>
            {suspended.length > 0 && <div className="side-demo-suspended" aria-label={`${side} suspended demonstration agreements`}>
              {suspended.map(index => <button type="button" key={index} data-testid={`side-demo-suspended-${side}${index}`}
                title={`${side}${index} unavailable — demo agreement retained. Click to cancel it.`}
                aria-label={`Cancel suspended demo agreement ${side}${index}`}
                onClick={() => dispatch({type: 'set', side, index, state: 'closed'})}>
                <WifiOff size={12} aria-hidden="true"/>{side}{index}<span aria-hidden="true">×</span>
              </button>)}
            </div>}
          </div>
        </div>
      </div>;
    })}
  </div>;
}

export default memo(forwardRef(SideWindowDemo));
