// Reuse the current rental-only demo catalogue. Never deletes or replaces records.
import path from "node:path";
import { spawnSync } from "node:child_process";
if (process.env.NODE_ENV === "production")
  throw Error("Sample data seeding is for local development only.");
const raw = process.env.DATABASE_URL ?? "file:./dev.db";
if (!raw.startsWith("file:"))
  throw Error("A local SQLite database is required.");
const dbPath = path.resolve(raw.slice(5));
if (!dbPath.startsWith(process.cwd() + path.sep))
  throw Error("The sample database must be inside this checkout.");
const result = spawnSync(process.execPath, ["deploy/seed-test.mjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: `file:${dbPath}`,
    TEST_DEPLOYMENT: "true",
  },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
