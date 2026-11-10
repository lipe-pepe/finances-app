"use client";
// Client Component: as abas são interativas (seleção, foco por teclado), a troca de aba atualiza
// o endereço no navegador sem recarregar e os cards acompanham o slider em tempo real.

import { Tabs as TabsPrimitive } from "radix-ui";
import { useState, type ReactNode } from "react";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import {
  SummaryTabCard,
  type PlanningPart,
} from "@/features/planning/components/summary-tab-card";
import { useOverBudget } from "@/features/planning/hooks/use-over-budget";
import { formatBrl } from "@/lib/money";
import { getSectionPercentage, type PlanningSection } from "@/lib/planning";
import { TAB_LABELS, incomeCountLabel, momentSummary } from "@/lib/planning-labels";
import {
  PLANNING_TABS,
  buildPlanningTabUrl,
  parsePlanningTab,
  type PlanningTab,
} from "@/lib/planning-tab";
import { getUsageBarPercentage, getUsedPercentage } from "@/lib/spending";

type PlanningTabsProps = {
  /** Aba lida do endereço no servidor (?tab=) */
  initialTab: PlanningTab;
  revenueCents: number;
  incomeCount: number;
  expensesTotalCents: number;
  goalsTotalCents: number;
  /** Conteúdo de cada aba, renderizado no servidor */
  income: ReactNode;
  present: ReactNode;
  future: ReactNode;
};

// A aba do endereço (inglês) é também o nome da parte usado pelos tokens de cor
const PART_BY_TAB: Record<PlanningTab, PlanningPart> = {
  income: "income",
  present: "present",
  future: "future",
};

export function PlanningTabs({
  initialTab,
  revenueCents,
  incomeCount,
  expensesTotalCents,
  goalsTotalCents,
  income,
  present,
  future,
}: PlanningTabsProps) {
  // O valor do servidor só é usado na montagem: após uma Server Action a página é renderizada
  // de novo, mas a aba escolhida pelo usuário prevalece (FR-007 da feature 002)
  const [tab, setTab] = useState<PlanningTab>(initialTab);
  const { essentialPercentage } = useAllocation();
  const presentBudget = useOverBudget("expenses", revenueCents, expensesTotalCents);
  const futureBudget = useOverBudget("goals", revenueCents, goalsTotalCents);

  function handleTabChange(value: string) {
    const nextTab = parsePlanningTab(value);
    setTab(nextTab);
    // replaceState: atualiza o endereço sem recarregar e sem nova entrada no histórico
    window.history.replaceState(null, "", buildPlanningTabUrl(nextTab));
  }

  function momentCard(section: PlanningSection, totalCents: number, budget: typeof presentBudget) {
    const used = getUsedPercentage(totalCents, budget.plannedCents);
    return {
      amount: formatBrl(budget.plannedCents),
      summary: momentSummary(
        section,
        getSectionPercentage(section, essentialPercentage),
        totalCents,
        used,
      ),
      usage: getUsageBarPercentage(used),
      alert: budget.isOver,
    };
  }

  const cards: Record<
    PlanningTab,
    { amount: string; summary: string; usage?: number; alert: boolean }
  > = {
    income: { amount: formatBrl(revenueCents), summary: incomeCountLabel(incomeCount), alert: false },
    present: momentCard("expenses", expensesTotalCents, presentBudget),
    future: momentCard("goals", goalsTotalCents, futureBudget),
  };
  const contents: Record<PlanningTab, ReactNode> = { income, present, future };

  return (
    <TabsPrimitive.Root
      value={tab}
      onValueChange={handleTabChange}
      data-section={PART_BY_TAB[tab]}
      className="flex flex-col gap-9"
    >
      <TabsPrimitive.List
        aria-label="Partes do planejamento"
        className="grid grid-cols-1 gap-3 tablet:grid-cols-3"
      >
        {PLANNING_TABS.map((value) => (
          <SummaryTabCard
            key={value}
            value={value}
            part={PART_BY_TAB[value]}
            label={TAB_LABELS[value]}
            selected={value === tab}
            {...cards[value]}
          />
        ))}
      </TabsPrimitive.List>
      {PLANNING_TABS.map((value) => (
        <TabsPrimitive.Content
          key={value}
          value={value}
          className="mx-auto flex w-full max-w-3xl flex-col gap-9 outline-none"
        >
          {contents[value]}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
