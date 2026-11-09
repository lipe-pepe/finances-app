"use client";
// Client Component: o formulário de login precisa de estado interativo (React Hook Form,
// validação em tempo real e estado de envio), o que não é possível no servidor.

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/auth/actions";
import { signInSchema, type SignInInput } from "@/features/auth/schemas";
import { applyFieldErrors, runAction } from "@/lib/handle-action-result";

export function LoginForm() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema, undefined, { raw: true }),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    const outcome = await runAction(() => signIn(values), {
      router,
      onValidationError: (fieldErrors) => applyFieldErrors(fieldErrors, setError),
    });
    setFormMessage(outcome.message);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        <FormFieldError id="email-error" message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <FormFieldError id="password-error" message={errors.password?.message} />
      </div>
      {formMessage && (
        <p role="alert" className="text-sm text-destructive">
          {formMessage}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
