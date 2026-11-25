import type * as React from "react";

import Link from "next/link";

import { GuestGuard } from "@/components/guards/guest-guard";
import { Brand } from "@/components/layout/brand";
import { AuthCardSkeleton } from "@/components/layout/shell-skeletons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/config/site";

/** Minimal centered layout for sign-in and account recovery pages. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <Brand />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <GuestGuard fallback={<AuthCardSkeleton />}>{children}</GuestGuard>
        </div>
      </main>
    </div>
  );
}
