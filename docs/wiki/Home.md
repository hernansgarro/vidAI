# VIDA — Current Feature Reference

This directory contains **current-state** feature documentation, intended to be copied into the [VIDA GitHub Wiki](https://github.com/smeagol44/vidAI/wiki) when Wiki write access is available.

Documentation describes **what the latest game does**, not version history, milestone logs or experiments. Update the relevant page **in place** whenever its implementation changes.

## Simulation systems

- [Movement and Motor Control](Motor-Control.md) — optional oscillators, direct joint positioning, neural commands, inherited motor parameters, physical work and limitations.
- [Senses and Visually Guided Behavior](Sensory-Behavior.md) — physical retinal rays, inherited sensory steering, test-supported food approach and unresolved threat recognition.

Further pages belong here only as the corresponding systems are reviewed or modified; historical findings stay in `docs/PROJECT_STATUS.md`.

## Editorial rules

- State what ships now. Avoid release-by-release changelogs.
- Keep one well-organized page per feature; update it, don't create a new dated copy.
- Show the mechanism and limitations, with short diagrams and verified values.
- Link to implementation and fast regression tests for maintainers.
