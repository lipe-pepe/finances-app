"use client";
// Client Component: formulário com React Hook Form (estado, validação em tempo real e envio)
// e alternância do modo de edição, que exigem interatividade no navegador.

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIncome, updateIncome } from "@/features/incomes/actions";
import { incomeSchema, type IncomeInput } from "@/features/incomes/schemas";
import type { IncomeItem } from "@/features/planning/queries";
import { applyFieldErrors, runAction } from "@/lib/handle-action-result";
import { centsToInputString } from "@/lib/money";

type IncomeFormProps = { mode: "create" } | { mode: "edit"; income: IncomeItem };

export function IncomeForm(props: IncomeFormProps) {
  const [editing, setEditing] = useState(false);

  if (props.mode === "edit" && !editing) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${props.income.name}`}
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
    );
  }

  return <IncomeFormFields {...props} onDone={() => setEditing(false)} />;
}

function IncomeFormFields(props: IncomeFormProps & { onDone: () => void }) {
  const router = useRouter();
  const fieldId = useId();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const isEdit = props.mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema, undefined, { raw: true }),
    defaultValues: isEdit
      ? { name: props.income.name, amount: centsToInputString(props.income.amountCents) }
      : { name: "", amount: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    const outcome = await runAction(
      () => (isEdit ? updateIncome(props.income.id, values) : createIncome(values)),
      {
        router,
        onValidationError: (fieldErrors) => applyFieldErrors(fieldErrors, setError),
        onSuccess: () => {
          if (isEdit) {
            props.onDone();
          } else {
            reset({ name: "", amount: "" });
          }
        },
      },
    );
    setFormMessage(outcome.message);
  });

  const nameId = `${fieldId}-name`;
  const amountId = `${fieldId}-amount`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={nameId}>Nome do ganho</Label>
          <Input
            id={nameId}
            placeholder="Ex.: Salário"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            {...register("name")}
          />
          <FormFieldError id={`${nameId}-error`} message={errors.name?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={amountId}>Valor (R$)</Label>
          <Input
            id={amountId}
            inputMode="decimal"
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? `${amountId}-error` : undefined}
            {...register("amount")}
          />
          <FormFieldError id={`${amountId}-error`} message={errors.amount?.message} />
        </div>
      </div>
      {formMessage && (
        <p role="alert" className="text-sm text-destructive">
          {formMessage}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : isEdit ? "Salvar" : "Adicionar ganho"}
        </Button>
        {isEdit && (
          <Button type="button" variant="outline" onClick={props.onDone} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
