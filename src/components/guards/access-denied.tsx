import Link from "next/link";
import { ShieldXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

/** Page-level fallback for `<PermissionGuard>` when a user opens a page they can't use. */
export function AccessDenied({
  title = "You don't have access to this page",
  description = "Ask an administrator to grant you the required permission.",
}: AccessDeniedProps) {
  return (
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldXIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/">Go to your home page</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
