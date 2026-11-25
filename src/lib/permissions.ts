/**
 * Lightweight, provider-agnostic RBAC.
 *
 * Permissions are "resource.action" strings ("items.create", "reports.export").
 * Wildcards are supported in GRANTED permissions:
 *   "*"         every permission
 *   "items.*"   every action on items
 *   "*.read"    read on every resource
 *
 * This only decides what the UI shows. The backend must enforce the same rules.
 */

export type Permission = `${string}.${string}`;
export type GrantedPermission = Permission | "*";
export type Role = string;

/** Whatever your auth provider returns, reduced to what access checks need. */
export interface AccessSubject {
  roles: readonly Role[];
  permissions: readonly GrantedPermission[];
}

/** Declarative rule used by guards and navigation config. All given conditions must pass. */
export interface AccessRule {
  /** Requires this permission. */
  permission?: Permission;
  /** Requires at least one of these permissions. */
  anyPermission?: readonly Permission[];
  /** Requires all of these permissions. */
  allPermissions?: readonly Permission[];
  /** Requires at least one of these roles. */
  roles?: readonly Role[];
}

function grants(granted: GrantedPermission, required: Permission): boolean {
  if (granted === "*" || granted === required) return true;

  const [grantedResource, grantedAction] = granted.split(".", 2);
  const [requiredResource, requiredAction] = required.split(".", 2);

  const resourceMatches = grantedResource === "*" || grantedResource === requiredResource;
  const actionMatches = grantedAction === "*" || grantedAction === requiredAction;
  return resourceMatches && actionMatches;
}

export function hasPermission(
  subject: AccessSubject | null | undefined,
  permission: Permission,
): boolean {
  if (!subject) return false;
  return subject.permissions.some((granted) => grants(granted, permission));
}

export function hasAnyPermission(
  subject: AccessSubject | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(subject, permission));
}

export function hasAllPermissions(
  subject: AccessSubject | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(subject, permission));
}

export function hasRole(subject: AccessSubject | null | undefined, role: Role): boolean {
  return subject?.roles.includes(role) ?? false;
}

export function hasAnyRole(
  subject: AccessSubject | null | undefined,
  roles: readonly Role[],
): boolean {
  return roles.some((role) => hasRole(subject, role));
}

/** True when the subject satisfies every condition in the rule. An empty rule always passes. */
export function canAccess(
  subject: AccessSubject | null | undefined,
  rule: AccessRule | undefined,
): boolean {
  if (!rule) return true;
  if (rule.permission && !hasPermission(subject, rule.permission)) return false;
  if (rule.anyPermission?.length && !hasAnyPermission(subject, rule.anyPermission)) return false;
  if (rule.allPermissions?.length && !hasAllPermissions(subject, rule.allPermissions)) return false;
  if (rule.roles?.length && !hasAnyRole(subject, rule.roles)) return false;
  return true;
}

/**
 * Expands roles into permissions for backends that only send roles.
 * Merge the result with any permissions granted directly to the user.
 */
export function resolveRolePermissions(
  roles: readonly Role[],
  rolePermissions: Readonly<Record<Role, readonly GrantedPermission[]>>,
): GrantedPermission[] {
  const resolved = new Set<GrantedPermission>();
  for (const role of roles) {
    for (const permission of rolePermissions[role] ?? []) resolved.add(permission);
  }
  return [...resolved];
}
