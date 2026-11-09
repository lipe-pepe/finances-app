"use client";
// Client Component: as abas são interativas (seleção, foco por teclado) e a troca de aba
// atualiza o endereço no navegador sem recarregar a página.

import { useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_LABELS } from "@/lib/planning-labels";
import {
  PLANNING_TABS,
  buildPlanningTabUrl,
  parsePlanningTab,
  type PlanningTab,
} from "@/lib/planning-tab";

type PlanningTabsProps = {
  /** Aba lida do endereço no servidor (?tab=) */
  initialTab: PlanningTab;
  revenueCents: number;
  expensesTotalCents: number;
  goalsTotalCents: number;
  /** Conteúdo de cada aba, renderizado no servidor */
  income: ReactNode;
  present: ReactNode;
  future: ReactNode;
};

export function PlanningTabs({ initialTab, income, present, future }: PlanningTabsProps) {
  // O valor do servidor só é usado na montagem: após uma Server Action a página é renderizada
  // de novo, mas a aba escolhida pelo usuário prevalece (FR-007)
  const [tab, setTab] = useState<PlanningTab>(initialTab);

  function handleTabChange(value: string) {
    const nextTab = parsePlanningTab(value);
    setTab(nextTab);
    // replaceState: atualiza o endereço sem recarregar e sem nova entrada no histórico (FR-006a)
    window.history.replaceState(null, "", buildPlanningTabUrl(nextTab));
  }

  const contents: Record<PlanningTab, ReactNode> = { income, present, future };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
      <TabsList className="w-full">
        {PLANNING_TABS.map((value) => (
          <TabsTrigger key={value} value={value} className="flex-1">
            {TAB_LABELS[value]}
          </TabsTrigger>
        ))}
      </TabsList>
      {PLANNING_TABS.map((value) => (
        <TabsContent key={value} value={value} className="flex flex-col gap-6">
          {contents[value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
