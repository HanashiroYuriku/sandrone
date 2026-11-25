"use client";

import type * as React from "react";

import { useCan } from "@/features/auth/hooks";
import type { AccessRule } from "@/lib/permissions";

interface PermissionGuardProps extends AccessRule {
  children: React.ReactNode;
  /** Rendered when access is denied (and while the session loads). Defaults to nothing. */
  fallback?: React.ReactNode;
}

/**
 * Shows children only when the signed-in user passes every given condition.
 *
 *   <PermissionGuard permission="items.create">
 *     <Button>New item</Button>
 *   </PermissionGuard>
 *
 *   <PermissionGuard anyPermission={["items.update", "items.delete"]} fallback={<AccessDenied />}>
 *     ...
 *   </PermissionGuard>
 *
 * Hiding UI is not security: the backend must enforce the same permission.
 */
export function PermissionGuard({
  children,
  fallback = null,
  permission,
  anyPermission,
  allPermissions,
  roles,
}: PermissionGuardProps) {
  const allowed = useCan({ permission, anyPermission, allPermissions, roles });
  return allowed ? children : fallback;
}
