"use client";

import type * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

/**
 * Every app-wide client provider, in one place. The root layout stays a Server
 * Component and renders only this boundary.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteConfig.defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
