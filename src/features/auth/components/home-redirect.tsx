"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getHomeHref } from "@/config/navigation";
import { useSession } from "@/features/auth/hooks";
import { LOGIN_PATH } from "@/features/auth/redirect";

/**
 * Sends "/" to the first page the user may open, or to login. Client-side so it also
 * works in static export, where server redirects don't exist.
 */
export function HomeRedirect() {
  const router = useRouter();
  const { status, subject } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    const target = status === "authenticated" ? getHomeHref(subject) : undefined;
    router.replace(target ?? LOGIN_PATH);
  }, [status, subject, router]);

  return (
    <div
      className="flex min-h-svh items-center justify-center"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="size-10 rounded-full" />
    </div>
  );
}
