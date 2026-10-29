# Side Window Markers and Connection Demo — fork testing only

**Available only in `hernansgarro/vidAI:testing`.** These are static visual
divisions of the tank's two vertical sides. Production/main and the upstream
application do not include this feature.

The independent constant `MIN_WINDOW_HEIGHT = 300` is expressed in **world
units**, not screen pixels. For the actual positive tank height `H`:

```text
N = max(1, floor(H / 300))
sectionHeight = H / N
```

Each side has `N` equally tall sections: `L0`, `L1`, … on the left and `R0`,
`R1`, … on the right, numbered upward from the floor. Each label is placed at
its section's vertical midpoint. Small yellow circles outside the walls mark
only the `N - 1` internal boundaries. A boundary `i * H / N` above the floor
is drawn at canvas-world `y = H - i * H / N`; the floor and ceiling get no circles.

| Actual height | Sections per side | Section height | Circles per side |
| --- | ---: | ---: | ---: |
| 100 | 1 | 100 | 0 |
| 299 | 1 | 299 | 0 |
| 300 | 1 | 300 | 0 |
| 599 | 1 | 599 | 0 |
| 600 | 2 | 300 | 1 |
| 800 | 2 | 400 | 1 |
| 1500 | 5 | 300 | 4 |
| 1600 | 5 | 320 | 4 |
| 1799 | 5 | 359.8 | 4 |
| 1800 | 6 | 300 | 5 |
| 3000 | 10 | 300 | 9 |

Below 300 units, one full-height section on each side is the sole exception to
the 300-unit minimum. Existing resize controls still permit 600–3000 units;
the geometry also supports smaller positive heights without changing those controls.
The logical count has no additional cap and never depends on configured defaults.

Resizing the simulated tank redistributes the sections in both directions.
Imports use their validated tank dimensions. Browser size, camera pan and zoom
only change the view; they cannot change `N`. Markers have a 4-CSS-pixel radius,
sit 10 CSS pixels outside the walls and use the same camera transform as the
tank. Labels retain an 11-CSS-pixel font. Offscreen graphics are naturally
clipped by the viewport, with no clipping to the physical tank rectangle.

These graphics exist only in the renderer. They have no physical or sensory
representation, no saved state and no effect on the Worker, vision, collisions,
forces, energy, genetics, learning, ecology or exact historical continuation.
There are no real connections, callers, negotiated openings or creature transfers.

## Interactive visual rehearsal

The visible **Connections · demo only** label identifies every control as an
observer-interface prototype. No phone or icon creates a real connection.
Left and right phones independently toggle an illustrative peer, **Example West**
or **Example East**. There is no name entry, account, user directory or networking.
Turning a phone off does not silently cancel accepted demonstration agreements.

Click any numbered section's icon to cycle:

```text
Closed → Outgoing offer → Incoming offer → Accepted → Rejected → Unavailable → Closed
```

Clicking an accepted icon explicitly cancels that demonstration agreement and
shows rejection; its tooltip and accessible label describe that action. Neutral,
handshake, prohibition and directional hand SVGs do not depend on emoji fonts.
Outgoing and rejecting hands point outward (left on L, right on R); incoming
hands point inward. The SVGs retain the Unicode reference identities 🫱/🫲 and
🫸/🫷 while rendering as reliable vectors.

The window icons sit beyond the journal's reserved **300-world-unit** future
preview area, with 12 CSS pixels of clearance and constant 30-pixel hit targets.
This offset does not extend the simulated world or render a physical channel.
Yellow boundary circles and section labels remain separate and unchanged.
Phones sit below section 0, next to their own peer name and suspended-agreement chips.
The camera positions these UI elements in the existing canvas draw pass; unrelated
canvas input remains available, with no modal, new simulation controls or extra
frame-by-frame React updates.

**Pair L ↔ R** rehearses the two sides of this same aquarium with the fixed
illustrative name **This tank**. Outgoing offers on one side appear as incoming
on the matching index of the other; acceptance, rejection, unavailability and
explicit cancellation mirror both endpoints. Enabling paired rehearsal retains
any accepted demonstration agreement already present. This is not stage-3 signaling.

When resizing removes an accepted index, its icon disappears with the actual
section. A small lost-signal chip beside that side's phone identifies the hidden
agreement; no nonexistent section is drawn. Growing the tank restores the
accepted icon. Click its suspended chip to deliberately cancel it, or use
**Reset connection demonstration** to clear the full rehearsal. Demo states are
local to this interface session, survive dimension changes/imports, and never
enter simulation snapshots or browser synchronization; reload resets them.

The latest contributor journal is retained as design context. Its glass-tube,
diffuse-edge and buffer illustration remains pending the separately specified
scope adjustment stated there; this delivery implements the attached icon
rehearsal. Future identity, real signaling, transport and cross-user stages remain
unimplemented and require their own authorization.
