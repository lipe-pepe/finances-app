"use client";
// Client Component: formulário com React Hook Form (Princípio IV) — estado, validação em tempo
// real, seletor de categoria controlado, data padrão de hoje e alternância do modo de edição.

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActualExpense, updateActualExpense } from "@/features/control/actions";
import { useActualExpenseSheet } from "@/features/control/components/actual-expense-sheet-context";
import type { ActualExpenseItem } from "@/features/control/queries";
import { createActualExpenseSchema, type ActualExpenseInput } from "@/features/control/schemas";
import { CategorySelect } from "@/features/planning/components/category-select";
import { PartPicker } from "@/features/planning/components/part-picker";
import type { CategoryOption } from "@/features/planning/queries";
import { formatMonthLabel, getMonthRange, getToday } from "@/lib/calendar";
import { dateHint } from "@/lib/control-labels";
import { useIsNarrow } from "@/hooks/use-is-narrow";
import { applyFieldErrors, runAction } from "@/lib/handle-action-result";
import { centsToInputString } from "@/lib/money";

type ActualExpenseFormProps = {
  categories: CategoryOption[];
  /** Chamado após salvar com sucesso (ex.: fechar o painel do celular) */
  onSuccess?: () => void;
  /** Chamado ao cancelar a edição (ex.: fechar o painel do celular) */
  onCancel?: () => void;
} & (
  | { mode: "create" }
  | {
      mode: "edit";
      actualExpense: ActualExpenseItem;
      /** `false` = edição controlada de fora (painel), sem o botão de lápis */
      showTrigger?: boolean;
    }
);

export function ActualExpenseForm(props: ActualExpenseFormProps) {
  const [editing, setEditing] = useState(false);
  const sheet = useActualExpenseSheet();
  const narrow = useIsNarrow();
  const controlled = props.mode === "edit" && props.showTrigger === false;

  if (props.mode === "edit" && !editing && !controlled) {
    const { actualExpense } = props;
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${actualExpense.name}`}
        // No celular, a edição abre no painel do Controle (FR-015a); senão, na própria linha
        onClick={() => (sheet && narrow ? sheet.openEdit(actualExpense) : setEditing(true))}
      >
        <Pencil />
      </Button>
    );
  }

  return (
    <ActualExpenseFormFields
      {...props}
      onDone={() => {
        setEditing(false);
        props.onCancel?.();
      }}
    />
  );
}

function emptyValues(today: string): ActualExpenseInput {
  return { name: "", amount: "", categoryId: "", spentOn: today, part: "essentials" };
}

function ActualExpenseFormFields(
  props: ActualExpenseFormProps & { onDone: () => void },
) {
  const router = useRouter();
  const fieldId = useId();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const isEdit = props.mode === "edit";
  const hasCategories = props.categories.length > 0;

  // "Hoje" no fuso da aplicação, igual ao usado pelo servidor ao validar (research R3)
  const today = getToday(new Date());
  const { first, last } = getMonthRange(today);
  const schema = useMemo(() => createActualExpenseSchema(today), [today]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ActualExpenseInput>({
    resolver: zodResolver(schema, undefined, { raw: true }),
    defaultValues: isEdit
      ? {
          name: props.actualExpense.name,
          amount: centsToInputString(props.actualExpense.amountCents),
          categoryId: props.actualExpense.categoryId,
          spentOn: props.actualExpense.spentOn,
          part: props.actualExpense.part,
        }
      : emptyValues(today),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    const outcome = await runAction(
      () =>
        isEdit
          ? updateActualExpense(props.actualExpense.id, values)
          : createActualExpense(values),
      {
        router,
        onValidationError: (fieldErrors) => applyFieldErrors(fieldErrors, setError),
        onSuccess: () => {
          if (isEdit) {
            props.onDone();
          } else {
            reset(emptyValues(getToday(new Date())));
          }
          props.onSuccess?.();
        },
      },
    );
    setFormMessage(outcome.message);
  });

  const nameId = `${fieldId}-name`;
  const amountId = `${fieldId}-amount`;
  const categoryId = `${fieldId}-category`;
  const dateId = `${fieldId}-date`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-3">
      <div className="grid gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={nameId}>Nome do gasto</Label>
          <Input
            id={nameId}
            placeholder="Ex.: Mercado"
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
        <PartPicker registration={register("part")} error={errors.part?.message} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={dateId}>Data</Label>
          <Input
            id={dateId}
            type="date"
            min={first}
            max={last}
            aria-invalid={Boolean(errors.spentOn)}
            aria-describedby={
              errors.spentOn ? `${dateId}-hint ${dateId}-error` : `${dateId}-hint`
            }
            {...register("spentOn")}
          />
          <p id={`${dateId}-hint`} className="text-xs text-muted-foreground">
            {dateHint(formatMonthLabel(today))}
          </p>
          <FormFieldError id={`${dateId}-error`} message={errors.spentOn?.message} />
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
        <Button type="submit" disabled={isSubmitting || !hasCategories}>
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
