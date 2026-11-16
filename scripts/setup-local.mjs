// Uses only Node built-ins so a fresh clone can run this before npm install.
import { existsSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
if (Number(process.versions.node.split(".")[0]) < 22)
  throw Error("Use Node.js 22 or newer, then run npm run setup again.");
if (
  process.env.NODE_ENV === "production" ||
  process.env.TEST_DEPLOYMENT === "true"
)
  throw Error("This setup command is only for a local developer checkout.");

if (!existsSync(".env.local") && !existsSync(".env")) {
  const config = readFileSync(".env.example", "utf8")
    .replace('AUTH_DELIVERY_MODE="provider"', 'AUTH_DELIVERY_MODE="console"')
    .replace(
      'IDENTITY_ENCRYPTION_KEY=""',
      `IDENTITY_ENCRYPTION_KEY="${randomBytes(32).toString("hex")}"`,
    );
  writeFileSync(".env.local", config, { flag: "wx", mode: 0o600 });
  console.log(
    "Created private local settings with a unique encryption key and local test verification codes.",
  );
} else console.log("Keeping your existing environment files unchanged.");
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
if (
  process.env.NODE_ENV === "production" ||
  process.env.TEST_DEPLOYMENT === "true"
)
  throw Error("Production/test-server environments cannot run local setup.");
const appUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
);
if (!["localhost", "127.0.0.1", "[::1]"].includes(appUrl.hostname))
  throw Error(
    "NEXT_PUBLIC_APP_URL must point to localhost for developer setup.",
  );
if (!/^[a-f0-9]{64}$/i.test(process.env.IDENTITY_ENCRYPTION_KEY ?? ""))
  throw Error(
    "Set IDENTITY_ENCRYPTION_KEY to a stable 64-character hex key in your existing local environment file. Setup will not overwrite it.",
  );
const url = process.env.DATABASE_URL ?? "file:./dev.db";
if (!url.startsWith("file:"))
  throw Error("Local setup requires a SQLite file database.");
const dbPath = path.resolve(root, url.slice(5));
const resolved = existsSync(dbPath)
  ? realpathSync(dbPath)
  : path.join(realpathSync(path.dirname(dbPath)), path.basename(dbPath));
if (!resolved.startsWith(realpathSync(root) + path.sep))
  throw Error("The developer database must be inside this checkout.");
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.NODE_ENV = "development";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(npm, ["ci", "--no-audit", "--no-fund"]);
// Explicitly initialize a fresh SQLite file before Prisma migrate deploy.
// Some Prisma engine versions fail to open a database that does not exist yet.
const { default: SQLite } = await import("better-sqlite3");
const sqlite = new SQLite(dbPath);
sqlite.pragma("user_version");
sqlite.close();
run(process.execPath, ["node_modules/prisma/build/index.js", "generate"]);
run(process.execPath, [
  "node_modules/prisma/build/index.js",
  "migrate",
  "deploy",
]);
run(process.execPath, ["scripts/seed-samples.mjs"]);
run(process.execPath, ["scripts/seed-promotion.mjs"]);
console.log(
  "\nAddisRoom is ready: 6 demo rentals, sample photos, map locations and 3 sample advertisements.",
);
console.log(
  "Your logo, fonts and interface assets are included in public/. Existing records are preserved.",
);
console.log("Run npm run dev and open http://localhost:3000.");
