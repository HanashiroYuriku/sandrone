import type * as React from "react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { KioskHeader } from "@/components/layout/kiosk-header";
import { KioskShellSkeleton } from "@/components/layout/shell-skeletons";

/**
 * Distraction-free, fullscreen kiosk/POS shell. `data-touch` raises hit targets and
 * row heights for everything inside (see globals.css).
 */
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard fallback={<KioskShellSkeleton />}>
      <div data-touch className="flex h-dvh flex-col overflow-hidden bg-background">
        <KioskHeader />
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
