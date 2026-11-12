"use client";
// Client Component: guarda a porcentagem do slider em tempo real e a compartilha com os
// valores planejados e alertas, sem ida ao servidor a cada movimento (FR-016a).

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  rescaleParts,
  toPartPercentages,
  type PartPercentages,
} from "@/lib/present-parts";

export type AllocationSaveStatus = "idle" | "saving" | "saved" | "error";

type AllocationContextValue = {
  essentialPercentage: number;
  /** Muda o Momento Presente e reajusta as partes na proporção, em tempo real (feature 006) */
  setEssentialPercentage: (value: number) => void;
  saveStatus: AllocationSaveStatus;
  setSaveStatus: (status: AllocationSaveStatus) => void;
  /** Partes do Momento Presente (somam essentialPercentage) */
  parts: PartPercentages;
  setParts: (parts: PartPercentages) => void;
  splitSaveStatus: AllocationSaveStatus;
  setSplitSaveStatus: (status: AllocationSaveStatus) => void;
};

const AllocationContext = createContext<AllocationContextValue | null>(null);

type AllocationProviderProps = {
  initialEssentialPercentage: number;
  initialEducationPercentage?: number;
  initialFreePercentage?: number;
  children: ReactNode;
};

export function AllocationProvider({
  initialEssentialPercentage,
  initialEducationPercentage = 0,
  initialFreePercentage = 0,
  children,
}: AllocationProviderProps) {
  // Os valores do servidor são lidos só na montagem; depois o cliente é a fonte de verdade
  const [essentialPercentage, setEssentialPercentageState] = useState(initialEssentialPercentage);
  const [parts, setParts] = useState(() =>
    toPartPercentages(initialEssentialPercentage, initialEducationPercentage, initialFreePercentage),
  );
  const [saveStatus, setSaveStatus] = useState<AllocationSaveStatus>("idle");
  const [splitSaveStatus, setSplitSaveStatus] = useState<AllocationSaveStatus>("idle");

  const setEssentialPercentage = useCallback((value: number) => {
    setEssentialPercentageState(value);
    setParts((current) => rescaleParts(current, value));
  }, []);

  const value = useMemo(
    () => ({
      essentialPercentage,
      setEssentialPercentage,
      saveStatus,
      setSaveStatus,
      parts,
      setParts,
      splitSaveStatus,
      setSplitSaveStatus,
    }),
    [essentialPercentage, setEssentialPercentage, saveStatus, parts, splitSaveStatus],
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
