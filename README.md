# Waken

Waken is a multiplayer cozy game with adventurous elements. Players tend to a small village and its needs, including farming crops, taming animals, and gathering resources.

The player possesses a rare gift: Sleepwander. They can traverse dimensions within dreams and materialize treasures from them. Their mission is to defeat a cunning entity that has long plagued the villagers' sleep. But they aren't the only ones who can walk the dream world. A dangerous cult seeks to empower the evil being further. And the dreamy realms they inhabit can be just as perilous as the creature they're hunting.

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