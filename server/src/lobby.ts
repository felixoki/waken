import "dotenv/config";
import { ChildProcess, fork } from "child_process";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { LOBBY_PORT, DATABASE_URL, REDIS_URL } from "./server.js";
import { randomUUID } from "crypto";
import { pg } from "./db/postgres.js";
import { migrate } from "./db/migrate.js";

type World = {
  child: ChildProcess;
  port: number;
  lastActiveAt: number;
};

const app = express();

const host = (req: express.Request) =>
  process.env.PUBLIC_HOST || req.hostname || "localhost";

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

const running = new Map<string, World>();

const next = { port: 3001 };
const allocate = () => next.port++;

const getEntryPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const ext = __filename.endsWith(".ts") ? "ts" : "js";
  return path.join(__dirname, `index.${ext}`);
};

const start = (id: string) => {
  const existing = running.get(id);
  if (existing) return existing;

  const port = allocate();
  const entry = getEntryPath();
  console.log("Starting world", { id, port, entry, execArgv: process.execArgv });

  const child = fork(entry, [], {
    env: {
      ...process.env,
      PORT: String(port),
      WORLD_ID: id,
      DATABASE_URL,
      REDIS_URL,
    },
    stdio: "inherit",
  });

  const info: World = { child, port, lastActiveAt: Date.now() };
  running.set(id, info);

  child.on("exit", () => {
    running.delete(id);
  });

  child.on("error", (error) => {
    console.error("World process spawn error", { id, port, error });
  });

  return info;
};

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.post("/worlds", async (req, res) => {
  const playerId = String(req.body.playerId || "");
  const name = String(req.body.name || "default");

  if (!playerId) return res.status(400).json({ error: "Missing playerId" });

  const worldId = randomUUID();

  await pg.query(
    "INSERT INTO worlds (id, name, owner_id) VALUES ($1, $2, $3)",
    [worldId, name, playerId],
  );
  await pg.query(
    "INSERT INTO world_members (world_id, player_id) VALUES ($1, $2)",
    [worldId, playerId],
  );

  const world = start(worldId);
  return res.json({ worldId, host: host(req), port: world.port });
});

app.get("/worlds", async (req, res) => {
  const id = String(req.query.playerId || "");
  if (!id) return res.status(400).json({ error: "Missing playerId" });

  const result = await pg.query(
    `SELECT w.id, w.name, w.owner_id, w.created_at
     FROM worlds w
     JOIN world_members wm ON wm.world_id = w.id
     WHERE wm.player_id = $1
     ORDER BY w.created_at DESC`,
    [id],
  );

  res.json(result.rows);
});

app.post("/worlds/:id/start", async (req, res) => {
  const worldId = req.params.id;
  const world = start(worldId);
  res.json({ worldId, host: host(req), port: world.port });
});

app.post("/worlds/:id/join", async (req, res) => {
  const worldId = req.params.id;
  const playerId = String(req.body.playerId || "");
  if (!playerId) return res.status(400).json({ error: "playerId required" });

  await pg.query(
    `INSERT INTO world_members (world_id, player_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [worldId, playerId],
  );

  const world = start(worldId);
  res.json({ worldId, host: host(req), port: world.port });
});

setInterval(() => {
  const now = Date.now();
  const idle = 10 * 60 * 1000;

  for (const [worldId, world] of running)
    if (now - world.lastActiveAt > idle) {
      world.child.kill("SIGTERM");
      running.delete(worldId);
    }
}, 30_000);

await migrate();

app.listen(LOBBY_PORT, "0.0.0.0", () => {
  console.log(`Lobby running on ${LOBBY_PORT}`);
});
