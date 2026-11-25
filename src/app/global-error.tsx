"use client";

import { useEffect } from "react";

import "./globals.css";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the whole
 * document, so it renders its own <html>/<body> and can't rely on app providers.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background p-6 font-sans text-foreground antialiased">
        <title>Something went wrong</title>
        <main className="max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The application failed to load. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
