"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { findNavItem, navigation } from "@/config/navigation";

interface Crumb {
  title: string;
  href?: string;
}

function humanize(segment: string): string {
  const text = decodeURIComponent(segment).replace(/[-_]+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * "Group / Page / Sub-page" built from the navigation config; path segments below a
 * menu entry (e.g. /items/archive) are humanized. The last crumb is the current page.
 */
function buildCrumbs(pathname: string): Crumb[] {
  const item = findNavItem(pathname);
  if (!item) {
    return pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => ({ title: humanize(segment) }));
  }

  const group = navigation.find((candidate) => candidate.items.includes(item));
  const crumbs: Crumb[] = [];
  if (group) crumbs.push({ title: group.title });
  crumbs.push({ title: item.title, href: item.href });

  const rest = pathname.slice(item.href.length).split("/").filter(Boolean);
  let href = item.href;
  for (const segment of rest) {
    href = `${href}/${segment}`;
    crumbs.push({ title: humanize(segment), href });
  }
  return crumbs;
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.title}-${index}`}>
              {/* Only the last crumb is shown on small screens. */}
              <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.title}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{crumb.title}</span>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
