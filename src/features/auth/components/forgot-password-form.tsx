"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CircleExclamationPointIcon, MailIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/features/auth/hooks";
import { type ForgotPasswordFormValues, forgotPasswordFormSchema } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const request = useForgotPassword();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  if (request.isSuccess) {
    return (
      <div className="space-y-6">
        <Alert>
          <MailIcon />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            If an account exists for {request.variables.email}, we sent a link to reset the
            password.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeftIcon aria-hidden />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit((values) => request.mutate(values))}>
      <FieldGroup>
        {request.isError ? (
          <Alert variant="destructive">
            <CircleExclamationPointIcon />
            <AlertDescription>{getErrorMessage(request.error)}</AlertDescription>
          </Alert>
        ) : null}

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoFocus
                disabled={request.isPending}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                We&apos;ll email you a link to choose a new password.
              </FieldDescription>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={request.isPending}>
          {request.isPending ? "Sending…" : "Send reset link"}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/login">
            <ArrowLeftIcon aria-hidden />
            Back to sign in
          </Link>
        </Button>
      </FieldGroup>
    </form>
  );
}
