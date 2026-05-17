# Waken — Copilot Instructions

## Project

Waken is a multiplayer cozy game with adventurous elements. Players tend to a village, farm, tame animals, and gather resources. The player can Sleepwander — traversing dream dimensions and materializing treasures. They must defeat an entity plaguing the villagers' sleep while contending with a dangerous cult.

Stack: Phaser 3 client (Vite + React UI overlay), Node server, WebSocket multiplayer, Redis cache, Postgres persistence. Electron for desktop builds.

## How to work with me

- **Guide, don't implement.** Give short, sharp explanations and code snippets. I do the coding so I learn.
- **Step by step.** Break implementation into clear sequential steps. One concept at a time.
- **Review my code** when I paste it. Be direct about issues — performance, correctness, style.
- **No unsolicited refactors.** Don't restructure, rename, or "improve" things I didn't ask about.

## What matters

- **Performance first.** Every implementation decision should consider frame budget, allocations, cache coherence, and draw calls. No lazy patterns that cost frames.
- **Game feel.** Smooth, pixel-perfect, responsive. Animations, input latency, interpolation — these matter more than clean abstractions.
- **Industry best practices** for real-time multiplayer games, ECS-style architectures, and 2D rendering pipelines.

## Code style

- `/** */` block comments, never `//`
- Handlers are stateless plain objects grouping pure functions by domain — no classes, no instantiation
- Entity definitions are plain config objects shared between client and server
- Components, States, Effects are attachable/detachable at runtime
- Keep things flat and composable — avoid deep inheritance or hidden state
- TypeScript throughout, strict types, no `any`

## Architecture rules

- All entities share a single `Entity` class. Differentiation comes from components, states, and effects.
- Players and AI produce the same input structure; the update loop makes no distinction between local and remote.
- Handlers: `handlers.domain.action()` — pure functions, no hidden state, call siblings as needed.
- Client connects to lobby over HTTP → lobby spawns world → client connects to world via WebSocket.
- World caches in Redis, persists to Postgres.
- Biome generation runs in forked child processes (not worker threads — tsx bug).
