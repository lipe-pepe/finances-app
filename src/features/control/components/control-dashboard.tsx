"use client";
// Client Component: guarda a categoria selecionada e a parte ativa e filtra os dados do mês no
// navegador, sem ida ao servidor a cada troca (FR-020, SC-004; feature 006, FR-026–FR-028).

import { useId, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { ActualExpenseList } from "@/features/control/components/actual-expense-list";
import { PartUsageBar } from "@/features/control/components/part-usage-bar";
import { SpendingChart } from "@/features/control/components/spending-chart";
import { SpendingSummary } from "@/features/control/components/spending-summary";
import type { ActualExpenseItem } from "@/features/control/queries";
import { CategorySelect } from "@/features/planning/components/category-select";
import type { CategoryOption } from "@/features/planning/queries";
import { formatMonthLabel } from "@/lib/calendar";
import { ALL_CATEGORIES_LABEL, MONTH_EXPENSES_TITLE } from "@/lib/control-labels";
import {
  PRESENT_PARTS,
  buildPartSeries,
  sumByPart,
  type PartCents,
  type PartPercentages,
  type PresentPart,
} from "@/lib/present-parts";
import {
  ALL_CATEGORIES,
  filterActualExpenses,
  sumActualCents,
  type CategorySelection,
} from "@/lib/spending";

type ControlDashboardProps = {
  today: string;
  categories: CategoryOption[];
  actualExpenses: ActualExpenseItem[];
  partPercentages: PartPercentages;
  presentLimitCents: number;
  partLimitCents: PartCents;
};

/**
 * Dashboard do mês: seleção de categoria, barra de uso por parte (que ativa uma parte), resumo,
 * gráfico e lista dos gastos realizados. Sem parte ativa, tudo mostra o Momento Presente inteiro.
 */
export function ControlDashboard({
  today,
  categories,
  actualExpenses,
  partPercentages,
  presentLimitCents,
  partLimitCents,
}: ControlDashboardProps) {
  const selectId = useId();
  const headingId = useId();
  const listHeadingId = useId();
  const [selected, setSelected] = useState<CategorySelection>(ALL_CATEGORIES);
  // Parte ativa: começa sem nenhuma e não fica no endereço (FR-031)
  const [activePart, setActivePart] = useState<PresentPart | null>(null);

  // Se a categoria selecionada deixar de existir, volta para "Todos"
  const selection =
    selected === ALL_CATEGORIES || categories.some((category) => category.id === selected)
      ? selected
      : ALL_CATEGORIES;

  const view = useMemo(() => {
    // A categoria filtra só os gastos, nunca os limites (Clarifications da feature 006)
    const byCategory = filterActualExpenses(actualExpenses, { category: selection, part: null });
    const items = filterActualExpenses(byCategory, { category: ALL_CATEGORIES, part: activePart });
    return {
      items,
      spentByPart: sumByPart(byCategory),
      spentCents: sumActualCents(items),
      limitCents: activePart ? partLimitCents[activePart] : presentLimitCents,
      series: buildPartSeries(byCategory, today),
    };
  }, [actualExpenses, selection, activePart, partLimitCents, presentLimitCents, today]);

  function toggle(part: PresentPart) {
    setActivePart((current) => (current === part ? null : part));
  }

  return (
    <div className="flex flex-col gap-9">
      <section aria-labelledby={headingId} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id={headingId} className="text-sm font-medium text-muted-foreground">
            {formatMonthLabel(today)}
          </h2>
          <div className="flex w-full flex-col gap-1.5 sm:w-56">
            <Label htmlFor={selectId}>Categoria</Label>
            <CategorySelect
              id={selectId}
              value={selection}
              onChange={setSelected}
              categories={categories}
              emptyOption={{ value: ALL_CATEGORIES, label: ALL_CATEGORIES_LABEL }}
            />
          </div>
        </div>
        <PartUsageBar
          spentByPart={view.spentByPart}
          limitCents={presentLimitCents}
          percentages={partPercentages}
          activePart={activePart}
          onToggle={toggle}
        />
        <SpendingSummary limitCents={view.limitCents} spentCents={view.spentCents} />
        <SpendingChart
          series={view.series}
          parts={activePart ? [activePart] : PRESENT_PARTS}
          limits={partLimitCents}
          monthLabel={formatMonthLabel(today)}
        />
      </section>
      <section aria-labelledby={listHeadingId} className="flex flex-col gap-2 border-t pt-7">
        <h2 id={listHeadingId} className="text-lg font-semibold">
          {MONTH_EXPENSES_TITLE}
        </h2>
        <ActualExpenseList
          actualExpenses={view.items}
          categories={categories}
          showCategory={selection === ALL_CATEGORIES}
        />
      </section>
    </div>
  );
}
