import { IncomeForm } from "@/features/incomes/components/income-form";
import { IncomeList } from "@/features/incomes/components/income-list";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { IncomeItem } from "@/features/planning/queries";

type IncomeSectionProps = {
  incomes: IncomeItem[];
  revenueCents: number;
};

/** Seção de ganhos: formulário em linha, lista e receita total (soma de todos os ganhos). */
export function IncomeSection({ incomes, revenueCents }: IncomeSectionProps) {
  return (
    <section aria-labelledby="incomes-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="incomes-title" className="text-xl font-semibold">
          Ganhos
        </h2>
        <p className="text-sm text-muted-foreground">
          Cadastre suas fontes de renda. A soma é a sua receita total.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <IncomeForm mode="create" />
      </div>
      <IncomeList incomes={incomes} />
      <SectionTotal label="Receita total" totalCents={revenueCents} />
    </section>
  );
}
