import type * as React from "react";

import { cn } from "@/lib/utils";

interface KioskSplitViewProps {
  /** Main area, e.g. the product catalog. Scrolls independently. */
  children: React.ReactNode;
  /** Side panel, e.g. the order summary. Stacks below the main area on small screens. */
  aside: React.ReactNode;
  /** Accessible name of the side panel. */
  asideLabel: string;
  className?: string;
}

/**
 * Two-pane kiosk layout: a scrolling main area beside a fixed-width panel on large
 * screens, stacked on tablets in portrait.
 */
export function KioskSplitView({ children, aside, asideLabel, className }: KioskSplitViewProps) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-rows-[1fr_auto] lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-1",
        className,
      )}
    >
      <section className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</section>
      <aside
        aria-label={asideLabel}
        className="flex max-h-[45dvh] min-h-0 flex-col border-t bg-muted/30 lg:max-h-none lg:border-t-0 lg:border-l"
      >
        {aside}
      </aside>
    </div>
  );
}
