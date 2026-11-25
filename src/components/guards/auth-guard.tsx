"use client";

import type * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUserSync, useSession } from "@/features/auth/hooks";
import { buildLoginHref, LOGIN_PATH } from "@/features/auth/redirect";
import { useAuthStore } from "@/features/auth/store";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Shown while the session loads and during the redirect to login. */
  fallback: React.ReactNode;
}

/**
 * Renders children only for signed-in users; everyone else goes to
 * `/login?next=<current page>`. Runs on the client so it works in every build mode.
 * It controls what the UI shows; the backend must still reject unauthenticated calls.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { status } = useSession();
  const signedOut = useAuthStore((state) => state.signedOut);

  useCurrentUserSync(status === "authenticated");

  useEffect(() => {
    if (status !== "unauthenticated") return;
    // After a deliberate sign-out, don't carry this page over to the next user's login.
    router.replace(signedOut ? LOGIN_PATH : buildLoginHref());
  }, [status, signedOut, router]);

  return status === "authenticated" ? children : fallback;
}
