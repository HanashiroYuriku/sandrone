"use client";

import type * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getHomeHref } from "@/config/navigation";
import { useSession } from "@/features/auth/hooks";
import { readNextParam } from "@/features/auth/redirect";

interface GuestGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

/** For login-type pages: signed-in users are sent on to `next` or their home page. */
export function GuestGuard({ children, fallback }: GuestGuardProps) {
  const router = useRouter();
  const { status, subject } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(readNextParam() ?? getHomeHref(subject) ?? "/");
    }
  }, [status, subject, router]);

  return status === "unauthenticated" ? children : fallback;
}
