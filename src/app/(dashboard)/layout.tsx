import type * as React from "react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardShellSkeleton } from "@/components/layout/shell-skeletons";

/** ERP / SaaS / admin shell for every page in this route group. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard fallback={<DashboardShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
