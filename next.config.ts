import type { NextConfig } from "next";

/**
 * Build target, chosen with BUILD_OUTPUT (env var or .env file):
 *
 * - "server" (default): a regular Next.js server (`next start`). Works on Vercel,
 *   any Node.js host, and unlocks proxy.ts, Route Handlers, Server Actions,
 *   request-time rendering and image optimization.
 * - "standalone": a self-contained server in `.next/standalone` with only the
 *   node_modules it needs. Use for Docker images and self-hosting.
 * - "export": static HTML/JS in `out/` for any static host or CDN (Nginx, S3,
 *   GitHub Pages, IIS — see deploy/). No Node.js server at runtime.
 *
 * The template's core features run in every mode, so they must not depend on
 * server-only APIs: auth/RBAC guards run on the client (the backend still
 * enforces access), only NEXT_PUBLIC_* env vars are read in the browser, and
 * lists use query params (nuqs) rather than dynamic route segments. Server-only
 * features are fine as opt-in additions for "server"/"standalone" projects.
 */
const BUILD_OUTPUTS = ["server", "standalone", "export"] as const;
type BuildOutput = (typeof BUILD_OUTPUTS)[number];

function resolveBuildOutput(value: string | undefined): BuildOutput {
  if (value === undefined || value === "") return "server";
  if ((BUILD_OUTPUTS as readonly string[]).includes(value)) return value as BuildOutput;
  throw new Error(`BUILD_OUTPUT must be one of ${BUILD_OUTPUTS.join(", ")} (got "${value}").`);
}

const buildOutput = resolveBuildOutput(process.env.BUILD_OUTPUT);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't let `next dev` generate AGENTS.md instruction files in the project root.
  agentRules: false,
  ...(buildOutput === "standalone" && { output: "standalone" }),
  ...(buildOutput === "export" && {
    output: "export",
    images: {
      // The Image Optimization API needs a Next.js server.
      unoptimized: true,
    },
    // Emits /route/index.html, which most static hosts resolve without rewrite rules.
    trailingSlash: true,
  }),
};

export default nextConfig;
