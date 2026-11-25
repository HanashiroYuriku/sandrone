// Cross-platform `next build` with BUILD_OUTPUT set (no cross-env dependency).
// Usage: node scripts/build.mjs <server|standalone|export>
import { cpSync, existsSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
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
  process.stdout.write("\nStandalone server ready: node .next/standalone/server.js\n");
}

/**
 * Static export writes per-segment prefetch files as flat names such as
 * `__next.!KGF1dGgp.login.__PAGE__.txt`. On Windows, Next.js joins the segment path
 * with backslashes, so it creates nested folders (`__next.!KGF1dGgp/login/__PAGE__.txt`)
 * that the router never requests, and every prefetch 404s. Flatten them back.
 * A no-op on Linux/macOS, where the files are already flat.
 */
function flattenSegmentFiles(dir) {
  let fixed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const fullPath = join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) {
      fixed += flattenSegmentFiles(fullPath);
      continue;
    }
    for (const relative of readdirSync(fullPath, { recursive: true })) {
      const source = join(fullPath, relative);
      if (!statSync(source).isFile()) continue;
      const flatName = `${entry.name}.${relative.split(/[\\/]/).join(".")}`;
      renameSync(source, join(dir, flatName));
      fixed += 1;
    }
    rmSync(fullPath, { recursive: true, force: true });
  }
  return fixed;
}

if (mode === "export" && existsSync("out")) {
  const fixed = flattenSegmentFiles("out");
  if (fixed > 0) process.stdout.write(`\nFlattened ${fixed} segment prefetch files in out/\n`);
}
