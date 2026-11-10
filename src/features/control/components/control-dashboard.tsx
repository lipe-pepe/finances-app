"use client";
// Client Component: guarda a categoria selecionada e filtra os dados do mês no navegador, sem ida
// ao servidor a cada troca (FR-020, SC-004).

import { useId, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { ActualExpenseList } from "@/features/control/components/actual-expense-list";
import { SpendingChart } from "@/features/control/components/spending-chart";
import { SpendingSummary } from "@/features/control/components/spending-summary";
import type { ActualExpenseItem } from "@/features/control/queries";
import { CategorySelect } from "@/features/planning/components/category-select";
import type { CategoryOption } from "@/features/planning/queries";
import { formatMonthLabel } from "@/lib/calendar";
import { ALL_CATEGORIES_LABEL, MONTH_EXPENSES_TITLE } from "@/lib/control-labels";
import {
  ALL_CATEGORIES,
  buildCumulativeSeries,
  filterActualExpenses,
  getPlannedCents,
  sumActualCents,
  type CategorySelection,
} from "@/lib/spending";

type ControlDashboardProps = {
  today: string;
  categories: CategoryOption[];
  plannedCentsByCategory: Record<string, number>;
  actualExpenses: ActualExpenseItem[];
};

/** Dashboard do mês: seleção de categoria, resumo, gráfico e lista dos gastos realizados. */
export function ControlDashboard({
  today,
  categories,
  plannedCentsByCategory,
  actualExpenses,
}: ControlDashboardProps) {
  const selectId = useId();
  const headingId = useId();
  const listHeadingId = useId();
  const [selected, setSelected] = useState<CategorySelection>(ALL_CATEGORIES);

  // Se a categoria selecionada deixar de existir, volta para "Todos"
  const selection =
    selected === ALL_CATEGORIES || categories.some((category) => category.id === selected)
      ? selected
      : ALL_CATEGORIES;

  const view = useMemo(() => {
    const items = filterActualExpenses(actualExpenses, selection);
    return {
      items,
      plannedCents: getPlannedCents(plannedCentsByCategory, selection),
      spentCents: sumActualCents(items),
      series: buildCumulativeSeries(items, today),
    };
  }, [actualExpenses, plannedCentsByCategory, selection, today]);

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
        <SpendingSummary plannedCents={view.plannedCents} spentCents={view.spentCents} />
        <SpendingChart
          series={view.series}
          plannedCents={view.plannedCents}
          spentCents={view.spentCents}
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
