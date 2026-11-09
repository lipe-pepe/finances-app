import { AppHeader } from "@/features/planning/components/app-header";
import { requireUserId } from "@/lib/auth";
import { formatMonthLabel, getToday } from "@/lib/calendar";
import { controlTitle } from "@/lib/control-labels";

// Página Controle: gastos realizados do mês atual, renderizada no servidor a cada requisição.
export default async function ControlPage() {
  await requireUserId();
  const today = getToday(new Date());

  return (
    <>
      <AppHeader current="control" />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <h2 className="text-xl font-semibold">{controlTitle(formatMonthLabel(today))}</h2>
      </main>
    </>
  );
}
