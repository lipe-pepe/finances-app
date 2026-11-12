"use client";
// Client Component: campo de formulário (React Hook Form) com estado de seleção e eventos.

import { cn } from "cn";
import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import { PART_FIELD_LABEL, PART_LABELS } from "@/lib/part-labels";
import { PRESENT_PARTS, type PresentPart } from "@/lib/present-parts";

/** Classe da cor de cada parte (tokens do tema; feature 006). */
export const PART_DOT_CLASSES: Record<PresentPart, string> = {
  essentials: "bg-part-essentials",
  education: "bg-part-education",
  free: "bg-part-free",
};

type PartPickerProps = {
  /** Retorno de `register("part")` do React Hook Form */
  registration: UseFormRegisterReturn;
  error?: string;
};

/**
 * Seletor da parte do gasto (FR-011, FR-015): três rádios nativos em botões segmentados, com o
 * ponto de cor e o nome da parte (nunca só a cor).
 */
export function PartPicker({ registration, error }: PartPickerProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1.5 text-sm font-medium">{PART_FIELD_LABEL}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {PRESENT_PARTS.map((part) => (
          <label
            key={part}
            className={cn(
              "flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-center text-sm font-medium transition-colors",
              "hover:bg-muted has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring",
            )}
          >
            <input type="radio" value={part} className="sr-only" {...registration} />
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
            <span className="min-w-0 break-words">{PART_LABELS[part]}</span>
          </label>
        ))}
      </div>
      <FormFieldError id={errorId} message={error} />
    </fieldset>
  );
}
