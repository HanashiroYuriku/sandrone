import { LayoutDashboardIcon, type LucideIcon, PackageIcon, StoreIcon } from "lucide-react";

import { type AccessRule, type AccessSubject, canAccess } from "@/lib/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the command palette. */
  description?: string;
  /** Extra search terms for the command palette. */
  keywords?: readonly string[];
  /** Hidden from users who don't pass the rule. The page must still guard itself. */
  access?: AccessRule;
}

export interface NavGroup {
  title: string;
  items: readonly NavItem[];
}

/**
 * The app menu. The sidebar, breadcrumbs, command palette and post-login redirect
 * all read from here, so adding a page usually means adding one entry.
 */
export const navigation: readonly NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
        description: "KPIs and analytics",
        keywords: ["home", "analytics", "kpi", "reports"],
        access: { permission: "dashboard.read" },
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Items",
        href: "/items",
        icon: PackageIcon,
        description: "Manage the item catalog",
        keywords: ["products", "inventory", "catalog", "stock"],
        access: { permission: "items.read" },
      },
      {
        title: "Kiosk",
        href: "/kiosk",
        icon: StoreIcon,
        description: "Open the point-of-sale screen",
        keywords: ["pos", "cashier", "checkout", "sale"],
        access: { permission: "kiosk.access" },
      },
    ],
  },
];

/** Groups and items the subject may see; empty groups are dropped. */
export function filterNavigation(
  groups: readonly NavGroup[],
  subject: AccessSubject | null,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(subject, item.access)),
    }))
    .filter((group) => group.items.length > 0);
}

function matchesPath(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === href || normalized.startsWith(`${href}/`);
}

/** The menu entry for the current path, preferring the most specific href. */
export function findNavItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const group of navigation) {
    for (const item of group.items) {
      if (matchesPath(pathname, item.href) && item.href.length > (best?.href.length ?? -1)) {
        best = item;
      }
    }
  }
  return best;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return matchesPath(pathname, href);
}

/** Where to send a user after login: the first page they're allowed to open. */
export function getHomeHref(subject: AccessSubject | null): string | undefined {
  return filterNavigation(navigation, subject)[0]?.items[0]?.href;
}
