import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { registerHandlers } from "./socket/index.js";
import { CLIENT_URL, SERVER_PORT, TICK_RATE } from "./globals.js";
import { World } from "./World.js";

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

const world = new World();

setInterval(() => {
  world.update(TICK_RATE);
}, TICK_RATE);

io.on("connection", (socket) => {
  registerHandlers(io, socket, world);
});

server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
