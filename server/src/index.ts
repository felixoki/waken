import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerHandlers } from "./socket/index.js";
import { SERVER_PORT, WORLD_ID } from "./server.js";
import { AUTOSAVE_INTERVAL, TICK_RATE } from "./globals.js";
import { World } from "./World.js";
import { save } from "./db/save.js";
import { load } from "./db/load.js";
import { EntityConfig } from "./types/index.js";

const app = express();
const server = createServer(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, worldId: WORLD_ID });
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const world = new World(io);

let restored = false;

if (WORLD_ID) {
  const state = await load.world(WORLD_ID);

  if (state?.entities?.length) {
    state.entities.forEach((entity: EntityConfig) => {
      world.entities.add(entity.id, entity);
      world.chunks.registerEntity(entity.id, entity.map, entity.x, entity.y);
    });
    restored = true;
  }

  if (state?.time) world.setTime(state.time);
}

if (!restored) world.load();

setInterval(() => {
  world.update(TICK_RATE);
}, TICK_RATE);

io.on("connection", (socket) => {
  registerHandlers(io, socket, world);
});

if (WORLD_ID)
  setInterval(async () => {
    await save.world(WORLD_ID, {
      entities: world.entities.all,
      chunks: {},
      time: world.getTime(),
    });
  }, AUTOSAVE_INTERVAL);

server.listen(SERVER_PORT, "0.0.0.0", () => {
  console.log(`World ${WORLD_ID} running on port ${SERVER_PORT}`);
});
