# Deferred IDEA-010 / IDEA-011 — Cross-aquarium connections and portable living state

> **State:** Deferred design only. These proposals are not implemented, authorized, submitted upstream or part of local tube stages 1–3. The active personal cards are [IDEA-010](../ideas/IDEA_LAB.md#idea-010-remote-aquariums) and [IDEA-011](../ideas/IDEA_LAB.md#idea-011-portable-organism-state). Canonical shared work remains in [upstream #57](https://github.com/smeagol44/vidAI/issues/57) and issues [#121](https://github.com/smeagol44/vidAI/issues/121)/[#122](https://github.com/smeagol44/vidAI/issues/122). Original discussions survive in the Git history of [the contributor journal](../ideas/CONTRIBUTOR_IDEAS.md).

## Existing base — do not reimplement

- Local self-connected side windows/tubes, phone names/calls and per-window permissions, physical water channels, exact same-world living transfers and agreement restoration are **already implemented** through stage 3. Refer to the [completed-work register](../tracking/CONTRIBUTOR_COMPLETED.md) and current [Side Windows reference](../../wiki/Side-Windows.md), not old staged mockup instructions.
- The current physical side-window geometry uses a 300-world-unit height reference, with a single window when the tank is shorter; opening choices are not hardcoded to indices 1 and 3. Contiguous open sections share one uninterrupted visual channel. The fixed outward tube depth is 300 world units, with the accepted local handoff/rearm arrangement. Observer fades and tube rendering do not change creature perception or force.
- Local self-transfer is an authoritative extraction/insertion of the same full living individual, with its existing local ID and no concurrent duplicate, energy creation or birth. No remote directory/server, cross-world identity or standalone living-creature file format exists merely because this local feature works.

## IDEA-010 — Desired remote-user experience

- The phone workflow should allow a user to **explicitly publish availability** under a display name, see other users who opted in, select a peer and initiate a side-specific call. Loading a tank does not silently publish an account. Display names are not authenticated unique IDs.
- The receiving side's phone rings and shows a compact **nonmodal, nonblocking** Accept/Decline bubble. Ignoring an incoming invitation is allowed indefinitely **while the caller keeps waiting**; inactivity alone must not auto-reject it. The caller can cancel and choose another recipient, clearing the prior ring. A recipient's acceptance is explicit and **does not automatically approve any numbered window**.
- Every tank side connects to at most **one peer on that side**, while individual windows still require separate consent; multiple windows on the same side cannot route to different peers. Adjacent openings may render as one tube without losing their independently accepted indices.
- Turning directory availability off should stop *new* invitations/list exposure; whether it also disconnects an existing call, suspends prior accepted windows or leaves them active is **unresolved**. Also decide duplicate names/identity, phone availability across busy sides, simultaneous calls, cancellation/race handling, privacy, caller-specific cooldown, accessibility, touch behavior, and disconnect/reconnect semantics.
- **Cross-user Stage 4 only:** network discovery/presence, authentication/authorization, endpoint reliability and transport. A mediator/server may be necessary, but no architecture has been approved. A local self-call already works without network infrastructure; do not make it depend on Stage 4.

## IDEA-010 — Remote organism handoff and ecology

- A creature must **physically swim** to a real open tube end; the transfer event may atomically capture and place the **same complete living organism** at the destination. It is **not** scripted locomotion, new reproduction or arbitrary propulsion. Preserve articulated body, genome, pose, joint state, velocities, recurrent brain, lifetime learning, energy, age and relevant lineage.
- Preserve proportional signed vertical placement even when the source and destination window heights differ. For a source window center `cS` and height `hS`, and destination center `cD` and height `hD`, the reference point maps as `q = (yS - cS)/(hS/2)`; `yD = cD + q*(hD/2)`. **Do not scale the organism or its energy**. The origin/reference point and handling oversized bodies, collision clearance, high-speed crossings, limb clipping and directional rearming still require design.
- Open tubes are habitable channel space, not sterile teleport corridors. No free nutrient generation or bypass of the closed energy ledger. On remote arrival, the destination world's ordinary gravity, viscosity, ecology and physical rules apply, without invented genotype adaptation or energy subsidies.
- **Cross-world identifier policy is open.** A destination must not receive an ID collision with a live individual **or historical lineage reference**. Possible layers are a stable provenance identity, a current world-local ID and a bounded log of prior world-local aliases. On returning to a former world, a previous local alias may be restored **only with trustworthy ownership proof and no live/archive conflict**; otherwise issue a safe new alias and remap references. A remote sender's unverified payload is not proof of prior identity.
- A future remote handoff should validate a typed/versioned/size-bounded payload, destination capacity, authority, ordering and closed-world energy transfers. Design atomic/idempotent acknowledgements, duplicate/replay prevention, timeout/disconnection recovery and rollback or reconciliation. No signed-off implementation protocol exists.
- **Counters remain undecided:** distinguish births, imports and transfers. Restoring an existing living creature should not silently mint a birth, but the display/statistic policy needs a separate user decision. Preserve one live individual and faithful state regardless of counter naming.

## IDEA-011: Portable living-organism files

- This is a **separate future feature**: export/import the full authoritative state of **one already living organism**, not the genome-only Specimen Bank or a whole-world snapshot. A normal **copy/export to disk leaves the source creature alive** unless a distinct explicit transfer/removal operation follows. Never mistake file saving for a funded biological reproduction.
- Required future format design includes versioning, size limits, validation of all physical/neural/learning/genetic/energy/age fields, reference and lineage handling, historical saves, security of untrusted imports, and ID collision/remapping policy. Importing into a different world must not silently use `spawnOrganism` semantics (new PRNG-born ID, biological birth and funding) for an old living individual.
- Current local tube transfers **do not require** a downloadable file or a global provenance registry. Reuse of an eventual serializer across remote travel and file export is possible, but not an authorization to introduce cross-world transport.

## Outstanding decisions before any Work request

1. Remote directory, identity/presence/privacy and per-side availability/disconnect lifecycle.
2. Network authority, authenticated peers, idempotent handoff/recovery, unique IDs and archival lineage integrity.
3. Destination capacity, geometry/clearance and environment changes; single-creature state format and exact energy transfers.
4. Birth/import/transfer statistics and separately scoped portable files.
5. Fixed-tick determinism, snapshots, legacy history and test/protocol/CPU budget.
6. Explicit user approval for a bounded fork implementation. A fork merge still does not authorize an upstream PR.

Only the choices above should drive future implementation discussions. Superseded phone icons, yellow-window markers, old testing branch checkpoints and previous stage-specific mockup requests are retained in the repository's Git and PR history, **not** as active instructions here.
