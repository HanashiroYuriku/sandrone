import type { Metadata } from "next";
import { ChartColumnIcon } from "lucide-react";

import { AccessDenied } from "@/components/guards/access-denied";
import { PermissionGuard } from "@/components/guards/permission-guard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PermissionGuard permission="dashboard.read" fallback={<AccessDenied />}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Key figures for your business at a glance.</p>
      </div>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartColumnIcon />
          </EmptyMedia>
          <EmptyTitle>No metrics yet</EmptyTitle>
          <EmptyDescription>
            KPI cards and charts show up here once data is available.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </PermissionGuard>
  );
}
