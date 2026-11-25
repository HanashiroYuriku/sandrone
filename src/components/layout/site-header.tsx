"use client";

import { SearchIcon } from "lucide-react";

import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { useCommandPalette } from "@/components/layout/command-palette-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsApplePlatform } from "@/hooks/use-keyboard-shortcut";

/** Topbar of the dashboard shell: sidebar toggle, breadcrumbs, search, theme. */
export function SiteHeader() {
  const openPalette = useCommandPalette((state) => state.setOpen);
  const isApple = useIsApplePlatform();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <AppBreadcrumbs />

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-9 justify-center px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5"
          onClick={() => openPalette(true)}
          aria-label="Search pages and actions"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <SearchIcon aria-hidden />
          <span className="hidden sm:inline">Search…</span>
          <KbdGroup className="ml-auto hidden sm:inline-flex">
            <Kbd>{isApple ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
