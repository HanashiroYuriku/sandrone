import type { Metadata } from "next";
import { PackageIcon } from "lucide-react";

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
  title: "Items",
};

export default function ItemsPage() {
  return (
    <PermissionGuard permission="items.read" fallback={<AccessDenied />}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
        <p className="text-sm text-muted-foreground">Manage the products and services you sell.</p>
      </div>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>No items yet</EmptyTitle>
          <EmptyDescription>Items you add to the catalog are listed here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </PermissionGuard>
  );
}
