import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActualExpenseForm } from "@/features/control/components/actual-expense-form";
import { ActualExpenseList } from "@/features/control/components/actual-expense-list";
import { getControlData } from "@/features/control/queries";
import { AppHeader } from "@/features/planning/components/app-header";
import { requireUserId } from "@/lib/auth";
import { formatMonthLabel, getToday } from "@/lib/calendar";
import { controlTitle } from "@/lib/control-labels";

// Página Controle: gastos realizados do mês atual, renderizada no servidor a cada requisição.
export default async function ControlPage() {
  const userId = await requireUserId();
  const today = getToday(new Date());
  const data = await getControlData(userId, today);

  return (
    <>
      <AppHeader current="control" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
        <h2 className="text-xl font-semibold">{controlTitle(formatMonthLabel(today))}</h2>
        <Card>
          <CardHeader>
            <CardTitle>Registrar gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <ActualExpenseForm mode="create" categories={data.categories} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ActualExpenseList
              actualExpenses={data.actualExpenses}
              categories={data.categories}
              showCategory
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
