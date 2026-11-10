"use client";
// Client Component: é um gatilho de aba (Radix Tabs) — foco, setas e seleção acontecem no
// navegador — e os valores acompanham o slider em tempo real.

import { Clock, TrendingUp, TriangleAlert, Wallet, type LucideIcon } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useId } from "react";
import { cn } from "cn";
import { UsageBar } from "@/components/usage-bar";
import type { PlanningTab } from "@/lib/planning-tab";
import { TAB_ALERT_SR_TEXT } from "@/lib/planning-labels";

/** Parte do planejamento; define a cor do card (tokens income/present/future). */
export type PlanningPart = "income" | "present" | "future";

// Classes completas por parte, para o Tailwind encontrá-las no código (cores = tokens)
const PART_STYLES: Record<
  PlanningPart,
  { icon: LucideIcon; idle: string; active: string; border: string }
> = {
  income: {
    icon: Wallet,
    idle: "bg-income-soft text-income-ink",
    active: "bg-income text-income-foreground",
    border: "border-income",
  },
  present: {
    icon: Clock,
    idle: "bg-present-soft text-present-ink",
    active: "bg-present text-present-foreground",
    border: "border-present",
  },
  future: {
    icon: TrendingUp,
    idle: "bg-future-soft text-future-ink",
    active: "bg-future text-future-foreground",
    border: "border-future",
  },
};

type SummaryTabCardProps = {
  value: PlanningTab;
  part: PlanningPart;
  label: string;
  /** Valor principal já formatado (receita total ou planejado do momento) */
  amount: string;
  /** Linha de resumo (ex.: "50% da receita · gastos R$ 2.750,00 (88%)") */
  summary: string;
  /** Preenchimento da barra de uso (0–100); sem valor, o card não tem barra (Receita) */
  usage?: number;
  /** O momento excede o planejado (FR-018) */
  alert: boolean;
  /** Aba aberta: borda e ícone preenchidos na cor da parte (FR-019) */
  selected: boolean;
};

/**
 * Card de resumo que funciona como aba do Planejamento (FR-017–FR-019). O nome acessível é só o
 * rótulo (com ", com alerta" quando excede); valor e resumo entram como descrição.
 */
export function SummaryTabCard({
  value,
  part,
  label,
  amount,
  summary,
  usage,
  alert,
  selected,
}: SummaryTabCardProps) {
  const id = useId();
  const style = PART_STYLES[part];
  const Icon = style.icon;

  return (
    <TabsPrimitive.Trigger
      value={value}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-amount ${id}-summary`}
      className={cn(
        "flex min-h-32 flex-col gap-2.5 rounded-2xl border-2 bg-card p-5 text-left transition-shadow outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? `${style.border} shadow-md` : "border-border",
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              selected ? style.active : style.idle,
            )}
          >
            <Icon className="size-4.5" />
          </span>
          <span id={`${id}-label`} className="text-base font-semibold text-foreground">
            {label}
            {alert && <span className="sr-only">{TAB_ALERT_SR_TEXT}</span>}
          </span>
        </span>
        {alert && <TriangleAlert aria-hidden="true" className="size-4 text-destructive" />}
      </span>
      <span
        id={`${id}-amount`}
        className="text-2xl font-semibold tracking-tight text-foreground tabular-nums"
      >
        {amount}
      </span>
      {usage !== undefined && <UsageBar value={usage} tone={alert ? "danger" : part} />}
      <span
        id={`${id}-summary`}
        className={cn("text-sm", alert ? "text-destructive" : "text-muted-foreground")}
      >
        {summary}
      </span>
    </TabsPrimitive.Trigger>
  );
}
