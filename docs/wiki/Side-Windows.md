# Side Window Markers — fork testing only

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
No connections, callers, portals, negotiation, agreements or creature transfer
are implemented.
