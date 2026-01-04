import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { registerHandlers } from "./socket/index.js";
import { PlayerStore } from "./stores/Player.js";
import { CLIENT_URL, SERVER_PORT } from "./globals.js";
import { EntityStore } from "./stores/Entity.js";
import { MapLoader } from "./loaders/Map.js";
import { MAPS } from "./configs.js";
import { MapName } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const client = {
  url: CLIENT_URL,
  dist: path.join(__dirname, "../../client/dist"),
};

app.use(express.static(client.dist));

app.get("*", (_req, res) => {
  res.sendFile(path.join(client.dist, "index.html"));
});

const io = new Server(server, {
  cors: {
    origin: client.url,
    methods: ["GET", "POST"],
  },
});

const players = new PlayerStore();
const entities = new EntityStore();

/**
 * Map loading will be dynmically later on
 */
const loader = new MapLoader();
const village = loader.load(MAPS.village.json);
const ents = loader.parseEntities(MapName.VILLAGE, village);
for (const e of ents) entities.add(e.id, e);

io.on("connection", (socket) => {
  registerHandlers(io, socket, { players, entities });
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
