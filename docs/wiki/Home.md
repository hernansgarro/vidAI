# VIDA — Current Feature Reference

Documentation for the **current 2D VIDA simulation**. Each page describes what the latest game does, how its mechanisms work, and its known limitations. Feature pages are **updated in place** rather than duplicated for each release.

## Simulation systems

- [Movement and Motor Control](https://github.com/smeagol44/vidAI/wiki/Motor-Control) — optional oscillators, direct joint positioning, inherited motor parameters, physical work and limits.
- [Senses and Visually Guided Behavior](https://github.com/smeagol44/vidAI/wiki/Sensory-Behavior) — true retinal rays, inherited neural steering, measured food approach and unresolved threat recognition.

More current-feature pages will be added as those systems are worked on; this is not an attempt to document all existing systems at once.

## Reading and maintaining this Wiki

- **[Play VIDA](https://smeagol44.github.io/vidAI/)** · **[Source repository](https://github.com/smeagol44/vidAI)**
- Keep pages concise, with diagrams, grounded settings and explicit limitations.
- No historical changelogs or milestone journals here. The repository's `docs/PROJECT_STATUS.md` records experiments and version changes separately.
- These pages are maintained from `docs/wiki/` in the main repository and synchronized into the Wiki by GitHub Actions. Future edits should update those source pages to avoid being overwritten at the next synchronization.
