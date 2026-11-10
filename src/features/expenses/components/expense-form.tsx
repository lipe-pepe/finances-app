"use client";
// Client Component: formulário com React Hook Form (estado, validação em tempo real, seletor de
// categoria controlado e envio) e alternância do modo de edição.

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpense, updateExpense } from "@/features/expenses/actions";
import { expenseSchema, type ExpenseInput } from "@/features/expenses/schemas";
import { CategorySelect } from "@/features/planning/components/category-select";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";
import { applyFieldErrors, runAction } from "@/lib/handle-action-result";
import { centsToInputString } from "@/lib/money";

type ExpenseFormProps = { categories: CategoryOption[] } & (
  | { mode: "create" }
  | { mode: "edit"; expense: ExpenseItem }
);

export function ExpenseForm(props: ExpenseFormProps) {
  const [editing, setEditing] = useState(false);

  if (props.mode === "edit" && !editing) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${props.expense.name}`}
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
    );
  }

  return <ExpenseFormFields {...props} onDone={() => setEditing(false)} />;
}

const EMPTY_VALUES: ExpenseInput = { name: "", amount: "", categoryId: "" };

function ExpenseFormFields(props: ExpenseFormProps & { onDone: () => void }) {
  const router = useRouter();
  const fieldId = useId();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const isEdit = props.mode === "edit";
  const hasCategories = props.categories.length > 0;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema, undefined, { raw: true }),
    defaultValues: isEdit
      ? {
          name: props.expense.name,
          amount: centsToInputString(props.expense.amountCents),
          categoryId: props.expense.categoryId,
        }
      : EMPTY_VALUES,
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    const outcome = await runAction(
      () => (isEdit ? updateExpense(props.expense.id, values) : createExpense(values)),
      {
        router,
        onValidationError: (fieldErrors) => applyFieldErrors(fieldErrors, setError),
        onSuccess: () => (isEdit ? props.onDone() : reset(EMPTY_VALUES)),
      },
    );
    setFormMessage(outcome.message);
  });

  const nameId = `${fieldId}-name`;
  const amountId = `${fieldId}-amount`;
  const categoryId = `${fieldId}-category`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_11rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={nameId}>Nome do gasto</Label>
          <Input
            id={nameId}
            placeholder="Ex.: Aluguel"
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={categoryId}>Categoria</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <CategorySelect
                id={categoryId}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                categories={props.categories}
                invalid={Boolean(errors.categoryId)}
                describedBy={errors.categoryId ? `${categoryId}-error` : undefined}
                disabled={!hasCategories}
              />
            )}
          />
          <FormFieldError id={`${categoryId}-error`} message={errors.categoryId?.message} />
        </div>
      </div>
      {!hasCategories && (
        <p className="text-sm text-muted-foreground">Nenhuma categoria disponível.</p>
      )}
      {formMessage && (
        <p role="alert" className="text-sm text-destructive">
          {formMessage}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="section" disabled={isSubmitting || !hasCategories}>
          {isSubmitting ? "Salvando…" : isEdit ? "Salvar" : "Adicionar gasto"}
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
