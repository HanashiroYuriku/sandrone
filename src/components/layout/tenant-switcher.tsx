"use client";

import { BuildingIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession, useSwitchTenant } from "@/features/auth/hooks";

/**
 * Switches the active tenant (sent as X-Tenant-ID). Rendered only when
 * NEXT_PUBLIC_MULTI_TENANT is on; switching clears cached data of the old tenant.
 */
export function TenantSwitcher() {
  const { isMobile } = useSidebar();
  const { user, activeTenant } = useSession();
  const switchTenant = useSwitchTenant();
  const tenants = user?.tenants ?? [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={tenants.length === 0}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BuildingIcon className="size-4" aria-hidden />
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTenant?.name ?? "No tenant"}</span>
                <span className="truncate text-xs text-muted-foreground">Tenant</span>
              </span>
              <ChevronsUpDownIcon className="ml-auto" aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Tenants</DropdownMenuLabel>
            {tenants.map((tenant) => (
              <DropdownMenuItem key={tenant.id} onSelect={() => switchTenant(tenant.id)}>
                <BuildingIcon aria-hidden />
                <span className="truncate">{tenant.name}</span>
                {tenant.id === activeTenant?.id ? (
                  <CheckIcon className="ml-auto" aria-label="Active" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
