import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pg } from "./postgres.js";
import { tryCatch } from "../utils/tryCatch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const result = await tryCatch(pg.query(sql));

  if (result.error) throw result.error;
}
