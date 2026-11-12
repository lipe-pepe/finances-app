"use client";
// Client Component: guarda a parte selecionada e mostra só os dados dela; valores e alertas
// acompanham as porcentagens em tempo real (feature 007, US3).

import { cn } from "cn";
import { useId, useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { PartBudget } from "@/features/expenses/components/part-budget";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import type { CategoryOption } from "@/features/planning/queries";
import { PART_SELECT_LABEL, partOptionLabel } from "@/lib/part-labels";
import { isOverBudget } from "@/lib/planning";
import { PRESENT_PARTS, getPartCents, type PartCents, type PresentPart } from "@/lib/present-parts";

type PresentPartPanelProps = {
  /** Lista e total de cada parte, renderizados no servidor */
  panels: Record<PresentPart, ReactNode>;
  categories: CategoryOption[];
  revenueCents: number;
  plannedCentsByPart: PartCents;
};

/**
 * Momento Presente uma parte por vez (FR-008–FR-015): seletor (padrão Gastos Essenciais, sem
 * guardar a escolha), resumo da parte, formulário que cria o gasto na parte selecionada e a lista.
 */
export function PresentPartPanel({ panels, categories, revenueCents, plannedCentsByPart }: PresentPartPanelProps) {
  const selectId = useId();
  const [selectedPart, setSelectedPart] = useState<PresentPart>("essentials");
  const { parts } = useAllocation();
  const limits = getPartCents(revenueCents, parts);
  const optionLabel = (part: PresentPart) =>
    partOptionLabel(part, isOverBudget(plannedCentsByPart[part], limits[part]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={selectId}>{PART_SELECT_LABEL}</Label>
        <Select value={selectedPart} onValueChange={(value) => setSelectedPart(value as PresentPart)}>
          <SelectTrigger id={selectId} className="min-h-11 w-full sm:w-64">
            <SelectValue>
              <PartOption part={selectedPart} label={optionLabel(selectedPart)} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRESENT_PARTS.map((part) => (
              <SelectItem key={part} value={part} className="min-h-11">
                <PartOption part={part} label={optionLabel(part)} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PartBudget part={selectedPart} revenueCents={revenueCents} plannedCents={plannedCentsByPart[selectedPart]} />
      <div className="rounded-2xl border bg-card p-4">
        <ExpenseForm mode="create" part={selectedPart} categories={categories} />
      </div>
      <div data-testid="part-panel">{panels[selectedPart]}</div>
    </div>
  );
}

function PartOption({ part, label }: { part: PresentPart; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
      {label}
    </span>
  );
}
