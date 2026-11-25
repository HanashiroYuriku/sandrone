"use client";

import { useMemo } from "react";
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useCommandPalette } from "@/components/layout/command-palette-store";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { filterNavigation, navigation } from "@/config/navigation";
import { useLogout, useSession } from "@/features/auth/hooks";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

/** Global Cmd/Ctrl+K palette: jump to any page the user can open, switch theme, sign out. */
export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { subject } = useSession();
  const logout = useLogout();
  const { open, setOpen, toggle } = useCommandPalette();

  useKeyboardShortcut({ key: "k", mod: true }, toggle);

  const groups = useMemo(() => filterNavigation(navigation, subject), [subject]);

  /** Closes the palette before running the action, so focus returns to the page. */
  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search for a page or an action"
    >
      {/* The radix-nova CommandDialog is only the dialog frame; <Command> holds the cmdk state. */}
      <Command>
        <CommandInput placeholder="Search pages and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {groups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.title} ${item.description ?? ""}`}
                  keywords={item.keywords ? [...item.keywords] : undefined}
                  onSelect={() => run(() => router.push(item.href))}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  {item.description ? (
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem value="theme light" onSelect={() => run(() => setTheme("light"))}>
              <SunIcon />
              Light
            </CommandItem>
            <CommandItem value="theme dark" onSelect={() => run(() => setTheme("dark"))}>
              <MoonIcon />
              Dark
            </CommandItem>
            <CommandItem value="theme system" onSelect={() => run(() => setTheme("system"))}>
              <MonitorIcon />
              System
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem
              value="sign out log out"
              disabled={logout.isPending}
              onSelect={() => run(() => logout.mutate())}
            >
              <LogOutIcon />
              Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
