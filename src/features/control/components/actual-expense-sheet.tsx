"use client";
// Client Component: painel de registro e edição do celular (diálogo com foco, Esc e toque
// fora) e o botão fixo no rodapé que o abre (FR-013–FR-015a).

import { Plus } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActualExpenseForm } from "@/features/control/components/actual-expense-form";
import {
  ActualExpenseSheetContext,
  useActualExpenseSheet,
  type ActualExpenseSheetApi,
} from "@/features/control/components/actual-expense-sheet-context";
import type { ActualExpenseItem } from "@/features/control/queries";
import type { CategoryOption } from "@/features/planning/queries";
import { useIsNarrow } from "@/hooks/use-is-narrow";
import {
  EDIT_SHEET_TITLE,
  REGISTER_BUTTON_LABEL,
  REGISTER_SHEET_TITLE,
} from "@/lib/control-labels";

type SheetState = { open: false } | { open: true; item: ActualExpenseItem | null };

type ActualExpenseSheetProviderProps = {
  categories: CategoryOption[];
  children: ReactNode;
};

export function ActualExpenseSheetProvider({ categories, children }: ActualExpenseSheetProviderProps) {
  const narrow = useIsNarrow();
  const [state, setState] = useState<SheetState>({ open: false });
  // Elemento que abriu o painel, para devolver o foco ao fechar (FR-014)
  const returnFocusTo = useRef<HTMLElement | null>(null);

  // Ao passar de 720 px, o formulário volta para a coluna e o painel fecha (caso de borda)
  if (!narrow && state.open) {
    setState({ open: false });
  }

  const api = useMemo<ActualExpenseSheetApi>(() => {
    const open = (item: ActualExpenseItem | null) => {
      returnFocusTo.current = document.activeElement as HTMLElement | null;
      setState({ open: true, item });
    };
    return {
      openCreate: () => open(null),
      openEdit: (item) => open(item),
      close: () => setState({ open: false }),
    };
  }, []);

  const item = state.open ? state.item : null;

  return (
    <ActualExpenseSheetContext.Provider value={api}>
      {children}
      <Sheet open={state.open} onOpenChange={(open) => !open && api.close()}>
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          className="max-h-[90svh] overflow-y-auto rounded-t-2xl pb-safe-bottom"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusTo.current?.focus();
          }}
        >
          <SheetHeader className="pr-14">
            <SheetTitle className="text-lg font-semibold">
              {item ? EDIT_SHEET_TITLE : REGISTER_SHEET_TITLE}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-5">
            {item ? (
              <ActualExpenseForm
                key={item.id}
                mode="edit"
                showTrigger={false}
                actualExpense={item}
                categories={categories}
                onSuccess={api.close}
                onCancel={api.close}
              />
            ) : (
              <ActualExpenseForm mode="create" categories={categories} onSuccess={api.close} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </ActualExpenseSheetContext.Provider>
  );
}

/** Botão fixo no rodapé, só abaixo de 720 px, que abre o painel de registro (FR-013). */
export function RegisterExpenseButton() {
  const sheet = useActualExpenseSheet();
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background p-3 pb-[calc(0.75rem+var(--spacing-safe-bottom))] tablet:hidden">
      <Button
        aria-haspopup="dialog"
        className="h-13 w-full text-base font-semibold"
        onClick={() => sheet?.openCreate()}
      >
        <Plus aria-hidden="true" className="size-5" />
        {REGISTER_BUTTON_LABEL}
      </Button>
    </div>
  );
}
