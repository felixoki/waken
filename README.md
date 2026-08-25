# Waken

Waken is a multiplayer cozy game with adventurous elements. Players tend to a small village and its needs, including farming crops, taming animals, and gathering resources.

The player possesses a rare gift: Sleepwander. They can traverse dimensions within dreams and materialize treasures from them. Their mission is to defeat a cunning entity that has long plagued the villagers' sleep. But they aren't the only ones who can walk the dream world. A dangerous cult seeks to empower the evil being further. And the dreamy realms they inhabit can be just as perilous as the creature they're hunting.

![Waken](client/public/assets/images/hero_mountains.png)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs dependencies for both client and server workspaces.

### 2. Run development servers

```bash
npm run dev
```

This runs both the server (port 3001) and client (port 3000) concurrently.

Alternatively, run them separately:

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

## Building for production

```bash
npm run build
```

## Server commands

```bash
npm run server:deploy    # Deploy to production
npm run server:connect   # SSH into server
npm run server:logs      # View logs
npm run server:status    # Check status
npm run server:restart   # Restart server
```

## Client target

```bash
npm run client:local     # Point to localhost
npm run client:remote    # Point to production
```

## Architecture

The client connects to a lobby server over HTTP which spawns and assigns world instances. Each world maintains its own WebSocket connection to connected clients, caches live state in Redis, and persists player data to Postgres.

```mermaid
graph LR
  Client["Client :3000"]
  Lobby["Lobby :3100"]
  World["World :3001+"]
  PG["Postgres :5432"]
  RD["Redis :6379"]

  Client -- HTTP --> Lobby
  Lobby -- spawn --> World
  Client -- WebSocket --> World
  World -- cache --> RD
  World -- persist --> PG
  Lobby -- read/write --> PG
```

Production: `178.104.59.213`

## System design

### Entity system

All entities share a single `Entity` class. What an entity *is* is defined by its components, what it's *doing* by its current state, and what's *happening to it* by its effects, all attachable and detachable at runtime. Every entity produces the same input structure each tick (players from the keyboard, AI from a behavior queue), which is resolved into state transitions. Players broadcast their input over the network; the update loop makes no distinction between local and remote. Entity definitions are plain config objects shared between client and server; an orc and a tree use the same structure, just different fields.

```mermaid
classDiagram
  class Entity {
    components: Map~Component~
    effects: Map~Effect~
    states: Map~State~
    update(input)
    transitionTo(state)
    addComponent() / removeComponent()
    addEffect() / removeEffect()
  }

  class Player {
    inputManager: InputManager
    _getInput() → keyboard
  }

  class Component {
    attach()
    update()
    detach()
  }

  class State {
    enter(entity)
    update(entity)
    exit(entity)
  }

  class Behavior {
    update(entity) → Input
    reset()
  }

  class Effect {
    attach()
    update()
    detach()
  }

  class BehaviorQueue {
    add(behavior)
    update() → Input
  }

  class StateResolver {
    resolve(input, prev) → state
  }

  Player --|> Entity : extends
  Entity *-- Component : attach / detach
  Entity *-- State : enter / exit
  Entity *-- Effect : attach / detach
  Entity *-- BehaviorQueue
  BehaviorQueue o-- Behavior : queues
  StateResolver --> Entity : drives
  Player ..> StateResolver : keyboard input
  BehaviorQueue ..> StateResolver : AI input
```

### Authority and chunks

Every client runs the full simulation, but only one decides what non-player entities do. The first player to join a world becomes the **host** and holds authority: their client generates AI input, resolves combat hits, and keeps the broad view of active chunks. Everyone else is an **observer**. They still render and physically simulate those entities, but they don't think for them. Instead they receive the host's entity input over the network and replay it, so an orc lunges at the same moment on every screen. If the host disconnects, authority transfers to another player automatically. Players are the exception: each client always drives its own player and broadcasts that input to the rest. Nobody has authority over your character but you.

The world is diced into fixed-size **chunks**, and each chunk is a socket room. A client joins the `chunk:key` room for every chunk within an activation radius of two of its player and leaves it when the player moves away, so entity events only reach the clients who can actually see them. The host additionally tracks the full set of active chunks across the world, which is how it drives entities that no single observer is close enough to receive. When a chunk goes unused, it deactivates and its **stale entities** are cleaned up on the clients that were subscribed, so observers don't keep simulating orcs in a region nobody occupies.

```mermaid
block-beta
  %% One line per row, one square per chunk. Cell size comes from the width/height/x/y/rx CSS
  %% geometry properties in the classDefs: mermaid's own sizing is never square, and the padding
  %% config that could fix it is silently dropped by some renderers. Pinning the rect geometry
  %% needs no config at all. block-beta rather than a flowchart because it packs a real grid --
  %% 8px gaps instead of a flowchart's fixed 50px node spacing.
  columns 12
  a0["<br/><br/>"] a1["<br/><br/>"] a2["<br/><br/>"] a3["<br/><br/>"] a4["<br/><br/>"] a5["<br/><br/>"] a6["<br/><br/>"] a7["<br/><br/>"] a8["<br/><br/>"] a9["<br/><br/>"] a10["<br/><br/>"] a11["<br/><br/>"]
  b0["<br/><br/>"] b1["<br/><br/>"] b2["<br/><br/>"] b3["<br/><br/>"] b4["<br/><br/>"] b5["<br/><br/>"] b6["<br/><br/>"] b7["<br/><br/>"] b8["<br/><br/>"] b9["<br/><br/>"] b10["<br/><br/>"] b11["<br/><br/>"]
  c0["<br/><br/>"] c1["<br/><br/>"] c2["<br/><br/>"] c3["<br/><br/>"] c4["<br/><br/>"] c5["<br/><br/>"] c6["<br/><br/>"] c7["<br/><br/>"] c8["<br/><br/>"] c9["<br/><br/>"] c10["<br/><br/>"] c11["<br/><br/>"]
  d0["<br/><br/>"] d1["<br/><br/>"] d2["<br/><br/>"] d3["<br/><br/>"] d4["<br/><br/>"] d5["<br/><br/>"] d6["<br/><br/>"] d7["<br/><br/>"] d8["<br/><br/>"] d9["<br/><br/>"] d10["<br/><br/>"] d11["<br/><br/>"]
  e0["<br/><br/>"] e1["<br/><br/>"] e2["<br/><br/>"] e3["<br/><br/>"] e4["<br/><br/>"] e5["<br/><br/>"] e6["<br/><br/>"] e7["<br/><br/>"] e8["<br/><br/>"] e9["<br/><br/>"] e10["<br/><br/>"] e11["<br/><br/>"]
  f0["<br/><br/>"] f1["<br/><br/>"] f2["<br/><br/>"] f3["<br/><br/>"] f4["<br/><br/>"] f5["<br/><br/>"] f6["<br/><br/>"] f7["<br/><br/>"] f8["<br/><br/>"] f9["<br/><br/>"] f10["<br/><br/>"] f11["<br/><br/>"]
  g0["<br/><br/>"] g1["<br/><br/>"] g2["<br/><br/>"] g3["<br/><br/>"] g4["<br/><br/>"] g5["<br/><br/>"] g6["<br/><br/>"] g7["<br/><br/>"] g8["<br/><br/>"] g9["<br/><br/>"] g10["<br/><br/>"] g11["<br/><br/>"]

  classDef on fill:#3b82f61a,stroke:#3b82f6,stroke-width:1.5px,width:32px,height:32px,x:-16px,y:-16px,rx:4px,ry:4px
  classDef off fill:none,stroke:#94a3b8,stroke-width:1px,stroke-dasharray:3 2,width:32px,height:32px,x:-16px,y:-16px,rx:4px,ry:4px
  classDef host fill:#3b82f6,stroke:#3b82f6,stroke-width:1.5px,width:32px,height:32px,x:-16px,y:-16px,rx:4px,ry:4px
  classDef obs fill:#3b82f666,stroke:#3b82f6,stroke-width:3px,width:32px,height:32px,x:-16px,y:-16px,rx:4px,ry:4px

  class b0,b1,b2,b3,b4,b7,b8,b9,b10,b11,c0,c1,c2,c3,c4,c7,c8,c9,c10,c11,d0,d1,d3,d4,d7,d8,d10,d11,e0,e1,e2,e3,e4,e7,e8,e9,e10,e11,f0,f1,f2,f3,f4,f7,f8,f9,f10,f11 on
  class a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,b5,b6,c5,c6,d5,d6,e5,e6,f5,f6,g0,g1,g2,g3,g4,g5,g6,g7,g8,g9,g10,g11 off
  class d2 host
  class d9 obs
```

### Handlers

Handlers are stateless plain objects grouping pure functions by domain (`combat`, `move`, `state`, `player`, etc.). No classes, no instantiation, just `handlers.combat.resolve()`. Both client and server export a single `handlers` object; each handler operates on data passed in and calls sibling handlers as needed. This keeps game logic flat, composable, and free of hidden state.