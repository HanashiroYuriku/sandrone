// Cross-platform `next build` with BUILD_OUTPUT set (no cross-env dependency).
// Usage: node scripts/build.mjs <server|standalone|export>
import { cpSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MODES = ["server", "standalone", "export"];
const mode = process.argv[2];

if (!MODES.includes(mode)) {
  console.error(`Usage: node scripts/build.mjs <${MODES.join("|")}>`);
  process.exit(1);
}

// Run Next's CLI with the current Node binary: no shell, so it behaves the same on every OS.
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, BUILD_OUTPUT: mode },
});

if (result.status !== 0) process.exit(result.status ?? 1);

// Next.js leaves static assets out of the standalone folder on purpose (they belong
// on a CDN). Copy them in so `node .next/standalone/server.js` works on its own.
if (mode === "standalone") {
  cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  if (existsSync("public")) cpSync("public", ".next/standalone/public", { recursive: true });
  console.log("\nStandalone server ready: node .next/standalone/server.js");
}
