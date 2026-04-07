import { Pool } from "pg";
import { DATABASE_URL } from "../server.js";

export const pg = new Pool({
  connectionString: DATABASE_URL,
});
