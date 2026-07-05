import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "presight.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function applySchema(): void {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

export function isSeeded(): boolean {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    )
    .get();
  if (!row) return false;
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  return count > 0;
}

export { DB_PATH };
