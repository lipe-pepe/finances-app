"use client";
// Contexto de cliente: liga o botão fixo e o "Editar" da lista ao painel de registro do
// celular (estado de interface que só existe no navegador).

import { createContext, useContext } from "react";
import type { ActualExpenseItem } from "@/features/control/queries";

export type ActualExpenseSheetApi = {
  openCreate: () => void;
  openEdit: (item: ActualExpenseItem) => void;
  close: () => void;
};

export const ActualExpenseSheetContext = createContext<ActualExpenseSheetApi | null>(null);

/** Painel de registro do Controle, ou `null` fora do provider (ex.: Planejamento). */
export function useActualExpenseSheet(): ActualExpenseSheetApi | null {
  return useContext(ActualExpenseSheetContext);
}
