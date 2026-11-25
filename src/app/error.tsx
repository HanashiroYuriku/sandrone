"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCwIcon, TriangleExclamationPointIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ErrorPageProps {
  /** Errors thrown in Client Components may be any value, not only `Error`. */
  error: unknown;
  /** Re-fetches and re-renders the failed segment. */
  retry: () => void;
}

function getDigest(error: unknown): string | undefined {
  if (error instanceof Error && "digest" in error && typeof error.digest === "string") {
    return error.digest;
  }
  return undefined;
}

/** Error boundary for every route below the root layout. */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    // Hook your error reporting (Sentry, Datadog, …) in here.
    console.error(error);
  }, [error]);

  const digest = getDigest(error);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleExclamationPointIcon />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            An unexpected error occurred. Try again, or go back to the home page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button type="button" onClick={() => retry()}>
            <RotateCwIcon aria-hidden />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </EmptyContent>
        {digest ? (
          <p className="font-mono text-xs text-muted-foreground">Reference: {digest}</p>
        ) : null}
      </Empty>
    </main>
  );
}
