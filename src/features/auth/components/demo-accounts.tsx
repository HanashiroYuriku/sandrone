"use client";

import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { DEMO_PASSWORD, demoUsers } from "@/features/auth/mock-handlers";
import type { LoginFormValues } from "@/features/auth/schemas";

interface DemoAccountsProps {
  onPick: (values: LoginFormValues) => void;
  disabled?: boolean;
}

/** One-click sign-in with the mock API's demo users, each with different permissions. */
export function DemoAccounts({ onPick, disabled }: DemoAccountsProps) {
  return (
    <div className="space-y-4">
      <FieldSeparator>Demo accounts</FieldSeparator>
      <ul className="grid gap-2">
        {demoUsers.map((user) => (
          <li key={user.id}>
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-between py-2"
              disabled={disabled}
              onClick={() => onPick({ email: user.email, password: DEMO_PASSWORD })}
            >
              <span className="text-left">
                <span className="block font-medium capitalize">{user.roles[0]}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.permissions.includes("*")
                  ? "All access"
                  : `${user.permissions.length} permissions`}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-muted-foreground">
        Mock API is on (NEXT_PUBLIC_ENABLE_MOCK_API). Password for every account:{" "}
        <code className="font-mono">{DEMO_PASSWORD}</code>
      </p>
    </div>
  );
}
