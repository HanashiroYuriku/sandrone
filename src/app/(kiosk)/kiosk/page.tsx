import type { Metadata } from "next";
import { LayoutGridIcon, ShoppingCartIcon } from "lucide-react";

import { AccessDenied } from "@/components/guards/access-denied";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { KioskSplitView } from "@/components/layout/kiosk-split-view";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Kiosk",
};

export default function KioskPage() {
  return (
    <PermissionGuard permission="kiosk.access" fallback={<AccessDenied />}>
      <KioskSplitView
        asideLabel="Order summary"
        aside={
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCartIcon />
              </EmptyMedia>
              <EmptyTitle>Cart is empty</EmptyTitle>
              <EmptyDescription>Tap a product to add it to the order.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <Empty className="h-full border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGridIcon />
            </EmptyMedia>
            <EmptyTitle>No products available</EmptyTitle>
            <EmptyDescription>Products in the catalog appear here as touch tiles.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </KioskSplitView>
    </PermissionGuard>
  );
}
