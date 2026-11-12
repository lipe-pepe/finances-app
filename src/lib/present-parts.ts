import { calculatePlannedCents, sumCents } from "@/lib/planning";
import { buildCumulativeSeries } from "@/lib/spending";

// Partes do Momento Presente (feature 006): regras puras, porcentagens inteiras da Receita e
// valores em centavos. Ver specs/006-present-moment-parts/data-model.md.

export const PRESENT_PARTS = ["essentials", "education", "free"] as const;
export type PresentPart = (typeof PRESENT_PARTS)[number];

/** Porcentagens da Receita por parte; a soma é a porcentagem do Momento Presente. */
export type PartPercentages = Record<PresentPart, number>;

/** Valores em centavos por parte. */
export type PartCents = Record<PresentPart, number>;

/** Ponto da série do gráfico: gasto acumulado de cada parte até o dia (null depois do último). */
export type PartSeriesPoint = { day: number } & Record<PresentPart, number | null>;

function emptyParts(): PartCents {
  return { essentials: 0, education: 0, free: 0 };
}

/** Gastos Essenciais é derivado: Momento Presente − Educação − Livre. */
export function toPartPercentages(
  presentPercentage: number,
  educationPercentage: number,
  freePercentage: number,
): PartPercentages {
  return {
    essentials: presentPercentage - educationPercentage - freePercentage,
    education: educationPercentage,
    free: freePercentage,
  };
}

/**
 * Reajusta as partes para um novo total do Momento Presente mantendo a proporção (FR-008):
 * parte inteira de cada proporção + pontos restantes para as maiores frações (empate na ordem
 * das partes). Total antigo zero → tudo em Gastos Essenciais.
 */
export function rescaleParts(parts: PartPercentages, newTotal: number): PartPercentages {
  const oldTotal = sumCents(PRESENT_PARTS.map((part) => parts[part]));
  if (oldTotal <= 0) {
    return { essentials: newTotal, education: 0, free: 0 };
  }

  const exact = PRESENT_PARTS.map((part) => (parts[part] * newTotal) / oldTotal);
  const result = exact.map(Math.floor);
  let remaining = newTotal - sumCents(result);
  const order = PRESENT_PARTS.map((_, index) => index).sort(
    (a, b) => exact[b] - result[b] - (exact[a] - result[a]) || a - b,
  );
  for (const index of order) {
    if (remaining <= 0) break;
    result[index] += 1;
    remaining -= 1;
  }

  return { essentials: result[0], education: result[1], free: result[2] };
}

/** Thumbs do slider [fim de Essenciais, fim de Educação] → partes. */
export function splitFromThumbs([first, second]: number[], presentPercentage: number): PartPercentages {
  return {
    essentials: first,
    education: second - first,
    free: presentPercentage - second,
  };
}

/** Partes → posições dos dois thumbs do slider. */
export function thumbsFromSplit(parts: PartPercentages): [number, number] {
  return [parts.essentials, parts.essentials + parts.education];
}

/**
 * Valor de cada parte em centavos. Essenciais e Educação são arredondados ao centavo; Livre fica
 * com a diferença, para que a soma feche com o valor do Momento Presente (research R7).
 */
export function getPartCents(revenueCents: number, parts: PartPercentages): PartCents {
  const presentCents = calculatePlannedCents(
    revenueCents,
    parts.essentials + parts.education + parts.free,
  );
  const essentials = calculatePlannedCents(revenueCents, parts.essentials);
  const education = calculatePlannedCents(revenueCents, parts.education);
  return { essentials, education, free: presentCents - essentials - education };
}

/** Soma `amountCents` por parte. */
export function sumByPart(items: { part: PresentPart; amountCents: number }[]): PartCents {
  const totals = emptyParts();
  for (const item of items) {
    totals[item.part] += item.amountCents;
  }
  return totals;
}

type PartEntry = { part: PresentPart; amountCents: number; spentOn: string };

/** Gasto acumulado por dia de cada parte, com a mesma regra de dias da série única. */
export function buildPartSeries(items: PartEntry[], today: string): PartSeriesPoint[] {
  // O último dia exibido é o mesmo para as três partes (o maior entre hoje e o último gasto)
  const lastSpentOn = items.reduce((last, item) => (item.spentOn > last ? item.spentOn : last), today);
  const byPart = Object.fromEntries(
    PRESENT_PARTS.map((part) => [
      part,
      buildCumulativeSeries(
        items
          .filter((item) => item.part === part)
          .map((item) => ({ amountCents: item.amountCents, categoryId: "", spentOn: item.spentOn })),
        lastSpentOn,
      ),
    ]),
  ) as Record<PresentPart, ReturnType<typeof buildCumulativeSeries>>;

  return byPart.essentials.map((point, index) => ({
    day: point.day,
    essentials: point.spentCents,
    education: byPart.education[index].spentCents,
    free: byPart.free[index].spentCents,
  }));
}

/**
 * Largura (%) de cada trecho da barra de uso: gasto da parte sobre o limite do Momento Presente.
 * Acima do limite (ou com limite zero), as larguras somam 100% mantendo a proporção (FR-024).
 */
export function getPartBarWidths(spentByPart: PartCents, limitCents: number): PartCents {
  const totalSpent = sumCents(PRESENT_PARTS.map((part) => spentByPart[part]));
  if (totalSpent <= 0) return emptyParts();
  const base = limitCents > 0 && totalSpent <= limitCents ? limitCents : totalSpent;
  const widths = emptyParts();
  for (const part of PRESENT_PARTS) {
    widths[part] = (spentByPart[part] / base) * 100;
  }
  return widths;
}
