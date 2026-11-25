import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestionMarkIcon, HouseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * 404 for unmatched URLs. Kept a Server Component: Next.js ships the root not-found
 * with every page, so it should stay free of client-side code.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionMarkIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <HouseIcon aria-hidden />
              Go home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
