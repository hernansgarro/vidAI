# Side Windows, Local Caller and Glass Tubes — fork testing only

**Available only in `hernansgarro/vidAI:testing`.** Stage 1 provides a visual
preview of lateral channels; stage 2 adds a local display name. The phone menu
also rehearses the local self-call workflow. Production/main and the upstream
application do not include these controls.

## Window geometry

The independent `MIN_WINDOW_HEIGHT = 300` is in world units, never screen pixels
or a fraction of a configured default. For positive actual tank height `H`:

```text
N = max(1, floor(H / 300))
sectionHeight = H / N
```

Each side has `N` uniformly sized sections, numbered upward from the floor:
`L0`, `L1`, … and `R0`, `R1`, …. Their labels remain at the section midpoints;
there are no yellow boundary dots. Growing or shrinking redistributes sections
by the same formula. Camera/browser changes affect only their screen positions.

| Actual height | Sections per side | Section height |
| --- | ---: | ---: |
| 100 | 1 | 100 |
| 299 | 1 | 299 |
| 300 | 1 | 300 |
| 599 | 1 | 599 |
| 600 | 2 | 300 |
| 800 | 2 | 400 |
| 1500 | 5 | 300 |
| 1600 | 5 | 320 |
| 1799 | 5 | 359.8 |
| 1800 | 6 | 300 |
| 3000 | 10 | 300 |

Below 300 units, the one full-height section is the sole minimum-height exception.
Existing resize controls remain 600–3000 units high; the geometry also handles
smaller positive heights without changing these controls or imposing a count cap.
Labels keep an 11-CSS-pixel font and sit 10 CSS pixels outside the wall.

## Phone, local name and self-selection

1. Press either side's phone. Enter a display name and press **Save**. The name
   stays in this page session only: it is not an account, verified unique identity,
   browser-stored profile or simulation-save field. Names are limited to 32
   characters; edits update the same local identity without clearing agreements.
2. Saving the first name makes both local phone endpoints available for this
   tank's self-call. Either side's **Turn availability off** hides that endpoint
   from new local calls; **Make phone available** restores it. Both must be
   available to start a self-call. Turning availability off during an existing
   connection does not disconnect it or cancel window agreements. Turning it
   off during a pending call explicitly cancels that invitation.
3. The **Available people · local** menu contains your own name, marked **You**,
   when both endpoints are available. Select it to call the opposite phone.
   The list contains no fabricated remote people and is not an online directory.
4. The receiving phone rings and automatically shows a compact bubble with your
   name and **Accept / Decline**. It does not steal focus, dim the page, pause the
   simulation, block other controls or require an answer. There is no response
   deadline. Ring motion respects reduced-motion settings. The caller can
   **Cancel call**, which clears the receiving bubble, then choose again.
5. Only the receiver's explicit **Accept** connects the sides. Answering a call
   opens no numbered windows. One local side-link exists at a time; concurrent
   calls are unavailable while it is pending or connected.

This replaces the former Pair L ↔ R simulation button. The menu can edit the
name, change availability, or **Disconnect · retain agreements**. Disconnection
suspends accepted windows and hides their tubes; reconnecting to the same local
self restores them. **Reset local connections** explicitly clears the local
name, availability, call and all agreements. Reload also clears the session.
Menus remain within the visible canvas viewport and close with their close
button or Escape. All name/menu typing is isolated from simulation shortcuts.

## Separate window consent and visual tubes

Window controls are unavailable until the local phone call is accepted. Press
any closed/rejected section to offer it: the sender shows an outgoing hand and
its counterpart shows an incoming hand. The receiver can press its incoming
hand to accept, or the small **×** to decline. Pressing the sender's outgoing
hand cancels the offer; it cannot accept its own offer. The directional SVGs
preserve the meanings of 🫱/🫲/🫸/🫷 without relying on installed emoji fonts.

After acceptance both ends show a handshake. Each accepted section displays a
**300-world-unit** outward glass/water extension on each side. Consecutive
accepted sections merge into a continuous corridor: only the bottom and top of
that group have horizontal glass edges. There are no internal crossbars between
adjacent accepted windows. Isolated and nonconsecutive groups work independently.
Opening every window extends only the tank floor and upper boundary.

The water/glass fades outward over the same 300 units, including the outer
100 units reserved in the design for future transport/rearm. The distal end is
visually uncapped: no perpendicular end wall, membrane or plug. The original
tank wall remains physically closed. These tubes contain no transported entities
and do not fade, move, duplicate or hide real organisms.

Press either handshake to close that preview tube and cancel its agreement.
Window controls remain beyond the 300-unit tip with 12 CSS pixels of clearance
and constant 30-pixel hit targets. Phone indicators remain separate below the floor.
Painting and camera positioning reuse the existing draw pass; there is no extra
animation loop or per-frame React update.

## Suspended agreements and simulation boundary

When reducing height removes an accepted index, its control and tube disappear;
a lost-signal chip beside each phone identifies the retained agreement. No
nonexistent section is drawn. Growing restores it. Click a chip to explicitly
cancel both endpoints' agreement. Disconnecting also shows the retained
agreements as suspended; availability alone does not cancel them.

All state and graphics belong to the human-observer interface. They are absent
from Worker data, snapshots and the organisms' sensory/physical scene. Physics,
forces, vision, genetics, learning, energy, ecology, PRNG and exact historical
continuation are unchanged. No wall openings, organism transfer, server, remote
presence, accounts or cross-browser communication are implemented. This local
interaction does not complete stage 3; physical transfer remains later work.
