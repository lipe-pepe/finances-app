"use client";
// Client Component: guarda a porcentagem do slider em tempo real e a compartilha com os
// valores planejados e alertas, sem ida ao servidor a cada movimento (FR-016a).

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AllocationSaveStatus = "idle" | "saving" | "saved" | "error";

type AllocationContextValue = {
  essentialPercentage: number;
  setEssentialPercentage: (value: number) => void;
  saveStatus: AllocationSaveStatus;
  setSaveStatus: (status: AllocationSaveStatus) => void;
};

const AllocationContext = createContext<AllocationContextValue | null>(null);

type AllocationProviderProps = {
  initialEssentialPercentage: number;
  children: ReactNode;
};

export function AllocationProvider({ initialEssentialPercentage, children }: AllocationProviderProps) {
  // O valor do servidor é lido só na montagem; depois o cliente é a fonte de verdade
  const [essentialPercentage, setEssentialPercentage] = useState(initialEssentialPercentage);
  const [saveStatus, setSaveStatus] = useState<AllocationSaveStatus>("idle");

  const value = useMemo(
    () => ({ essentialPercentage, setEssentialPercentage, saveStatus, setSaveStatus }),
    [essentialPercentage, saveStatus],
  );

  return <AllocationContext.Provider value={value}>{children}</AllocationContext.Provider>;
}

export function useAllocation(): AllocationContextValue {
  const context = useContext(AllocationContext);
  if (!context) {
    throw new Error("useAllocation deve ser usado dentro de AllocationProvider.");
  }
  return context;
}
