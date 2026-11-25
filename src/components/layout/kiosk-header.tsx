"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  LogOutIcon,
  MaximizeIcon,
  MinimizeIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHomeHref } from "@/config/navigation";
import { useLogout, useSession } from "@/features/auth/hooks";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useNow } from "@/hooks/use-now";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn, formatDate, getInitials } from "@/lib/utils";

function ConnectionBadge() {
  const online = useOnlineStatus();
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-8 gap-1.5 px-3 text-sm",
        online ? "border-success/40 text-success" : "border-destructive/40 text-destructive",
      )}
      role="status"
      aria-live="polite"
    >
      {online ? <WifiIcon aria-hidden /> : <WifiOffIcon aria-hidden />}
      {online ? "Online" : "Offline"}
    </Badge>
  );
}

function Clock() {
  const now = useNow();
  return (
    <time
      className="hidden text-sm text-muted-foreground tabular-nums sm:block"
      dateTime={now === null ? undefined : new Date(now).toISOString()}
    >
      {now === null
        ? " "
        : formatDate(now, { weekday: "short", hour: "2-digit", minute: "2-digit" })}
    </time>
  );
}

/** Status bar of the kiosk shell: connectivity, clock, cashier, fullscreen and exit. */
export function KioskHeader() {
  const { user, subject, activeTenant } = useSession();
  const { isFullscreen, isSupported, toggle } = useFullscreen();
  const logout = useLogout();

  // Users who can open other pages get a way back; kiosk-only users can only sign out.
  const homeHref = getHomeHref(subject);
  const exitHref = homeHref && homeHref !== "/kiosk" ? homeHref : undefined;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
      {exitHref ? (
        <Button
          asChild
          variant="ghost"
          size="icon-lg"
          className="touch-target"
          aria-label="Exit kiosk"
        >
          <Link href={exitHref}>
            <ArrowLeftIcon />
          </Link>
        </Button>
      ) : null}
      <Brand />
      {activeTenant ? (
        <span className="hidden truncate text-sm text-muted-foreground md:inline">
          {activeTenant.name}
        </span>
      ) : null}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Clock />
        <ConnectionBadge />
        {user ? (
          <span className="hidden items-center gap-2 lg:flex">
            <Avatar className="size-8">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm leading-tight">
              <span className="block font-medium">{user.name}</span>
              <span className="block text-xs text-muted-foreground capitalize">
                {user.roles[0] ?? "Cashier"}
              </span>
            </span>
          </span>
        ) : null}
        <ThemeToggle />
        {isSupported ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="touch-target"
            onClick={() => void toggle()}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </Button>
        ) : null}
        {exitHref ? null : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="touch-target"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOutIcon aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
