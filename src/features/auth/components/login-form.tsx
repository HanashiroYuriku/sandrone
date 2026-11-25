"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleExclamationPointIcon, EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { env } from "@/config/env";
import { DemoAccounts } from "@/features/auth/components/demo-accounts";
import { useLogin } from "@/features/auth/hooks";
import { type LoginFormValues, loginFormSchema } from "@/features/auth/schemas";
import { ApiError, getErrorMessage } from "@/lib/api-client";

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onError: (error) => {
        // Map server-side validation errors back onto the fields.
        if (ApiError.is(error)) {
          for (const field of ["email", "password"] as const) {
            const message = error.fieldErrors[field]?.[0];
            if (message) form.setError(field, { message });
          }
        }
      },
    });
  }

  // While redirecting after success the form stays disabled.
  const busy = login.isPending || login.isSuccess;
  const formError =
    login.error && !(ApiError.is(login.error) && login.error.isValidationError)
      ? getErrorMessage(login.error)
      : null;

  return (
    <div className="space-y-6">
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} aria-busy={busy}>
        <FieldGroup>
          {formError ? (
            <Alert variant="destructive">
              <CircleExclamationPointIcon />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  autoFocus
                  disabled={busy}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={busy}
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            <LogInIcon aria-hidden />
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      {env.NEXT_PUBLIC_ENABLE_MOCK_API ? (
        <DemoAccounts
          disabled={busy}
          onPick={(values) => {
            form.reset(values);
            onSubmit(values);
          }}
        />
      ) : null}
    </div>
  );
}
