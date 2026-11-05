# ChatGPT Work conversation continuity — temporary-access incident record

> **Fork-only operational note (2026-11-05).** This is a user-observed service/UI-access incident, **not** a diagnosed ChatGPT platform defect, a VIDA runtime regression, an upstream issue, or an assertion that conversation history was lost. Symptoms may resolve without code or account changes. This page deliberately excludes private chat links, screenshots, personal account information and confidential conversation contents.

## Observed symptoms (owner report)

- One active ChatGPT Work task stopped responding to new messages while its chat surface continued to display a running/thinking indicator; hard refresh did not restore interaction.
- In that conversation, the rename dialog displayed `New chat` despite the sidebar previously showing a generated conversation title; a later mobile conversation list also showed `New chat` with the original request preview.
- Additional web conversations intermittently displayed an unable-to-load-conversation error.
- The Android app displayed `Too many requests` while viewing Work and regular chats.
- The owner verified that the access problem **persisted after switching the phone off Wi-Fi to mobile data**.
- External development evidence remained available in GitHub. The original P8 Work task had preserved its implementation and full CI record; a separate continuation subsequently completed the existing fork PR [#114](https://github.com/hernansgarro/vidAI/pull/114) without recreating its work.

## Evidence boundary

These observations are compatible with a client/server synchronization failure, request limits, or another transient service/account condition, but **none is established as the cause**. Seeing `Too many requests` does not prove paid-usage exhaustion. A conversation failing to load does not prove history deletion. Do not claim an OpenAI acknowledgement, a confirmed incident root cause, or a support ticket number without direct evidence.

The issue is unrelated to the simulation's reproducible physical state and does not change the acceptance evidence of PRs. No credentials, user screenshots, conversation identifiers/URLs, usage or financial details are preserved in this public GitHub repository.

## Recovery and future checkpoints

1. Preserve conversation history and avoid deleting the affected chats. Independently verified GitHub PR/commit/CI records remain the development handoff.
2. If symptoms persist, use OpenAI Help Center support to report the date, affected web/mobile surfaces, the title mismatch, inability to send messages, and reproducibility across networks. Supply private conversation URL or sanitized screenshots **only through appropriate support channels if requested**.
3. Track the support case (if one is opened) in the support channel and review official OpenAI status for acknowledged incidents. This repo does not mirror a private support thread; absence of a public incident is not evidence of no defect.
4. If service recovers, update the observed outcome and date with verified evidence, and close the operational concern without rewriting history.
5. Follow the fork's [bounded Work/CI stop-and-retry policy](../procedures/WORK_CI_RETRY_BUDGET.md). A stalled Work chat is a reason to stop discretionary retries, record a durable GitHub checkpoint and resume from already-proven source state when possible.

**Current incident status at documentation time:** reported by owner, persistence verified across Wi-Fi/mobile data, **cause unresolved and possibly transient**; no confirmed provider ticket or recovery is recorded. No source, experiment, CI configuration, testing branch, upstream or user account settings changed as part of this incident note.
