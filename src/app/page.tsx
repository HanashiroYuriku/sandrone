import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/config/site";

const tokens = [
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "destructive", className: "bg-destructive" },
  { name: "chart-1", className: "bg-chart-1" },
  { name: "chart-2", className: "bg-chart-2" },
  { name: "chart-3", className: "bg-chart-3" },
  { name: "chart-4", className: "bg-chart-4" },
  { name: "chart-5", className: "bg-chart-5" },
] as const;

/**
 * Foundation check page: confirms fonts, theme switching and design tokens render.
 * Phase 3 replaces this with the entry route for the layout shells.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{siteConfig.name}</h1>
          <p className="max-w-prose text-muted-foreground">{siteConfig.description}</p>
        </div>
        <ThemeToggle />
      </header>

      <section aria-labelledby="tokens-heading" className="space-y-4">
        <h2 id="tokens-heading" className="text-sm font-medium text-muted-foreground">
          Design tokens
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokens.map((token) => (
            <li key={token.name} className="flex items-center gap-3 rounded-lg border p-3">
              <span
                aria-hidden
                className={`size-6 shrink-0 rounded-md border ${token.className}`}
              />
              <span className="font-mono text-xs">{token.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
