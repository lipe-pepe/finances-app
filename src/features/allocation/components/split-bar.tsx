"use client";
// Client Component: acompanha a porcentagem do slider em tempo real, que só existe no
// navegador enquanto o usuário arrasta.

import { useAllocation } from "@/features/allocation/components/allocation-provider";

/** Barra da divisão da receita: laranja (Momento Presente) × azul (Momento Futuro) (FR-022). */
export function SplitBar() {
  const { essentialPercentage } = useAllocation();
  return (
    <div aria-hidden="true" className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      {/* A largura é um dado (percentual do slider), não um valor de estilo fixo */}
      <div className="bg-present" style={{ width: `${essentialPercentage}%` }} />
      <div className="flex-1 bg-future" />
    </div>
  );
}
