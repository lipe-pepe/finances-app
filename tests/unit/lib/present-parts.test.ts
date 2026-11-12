import { describe, expect, it } from "vitest";
import { calculatePlannedCents } from "@/lib/planning";
import {
  PRESENT_PARTS,
  buildPartSeries,
  getPartBarWidths,
  getPartCents,
  rescaleParts,
  splitFromThumbs,
  sumByPart,
  thumbsFromSplit,
  toPartPercentages,
  type PartPercentages,
} from "@/lib/present-parts";

const sum = (parts: PartPercentages) => parts.essentials + parts.education + parts.free;

describe("present-parts", () => {
  it("tem as três partes em ordem fixa", () => {
    expect(PRESENT_PARTS).toEqual(["essentials", "education", "free"]);
  });

  it("deriva Gastos Essenciais do Momento Presente", () => {
    expect(toPartPercentages(70, 5, 5)).toEqual({ essentials: 60, education: 5, free: 5 });
    expect(toPartPercentages(50, 0, 0)).toEqual({ essentials: 50, education: 0, free: 0 });
  });

  describe("rescaleParts", () => {
    const base = { essentials: 60, education: 5, free: 5 };

    it("reajusta na proporção pelo maior resto (exemplo da spec)", () => {
      expect(rescaleParts(base, 35)).toEqual({ essentials: 30, education: 3, free: 2 });
    });

    it("não muda quando o total é o mesmo", () => {
      expect(rescaleParts(base, 70)).toEqual(base);
    });

    it("com total antigo zero, tudo vai para Gastos Essenciais", () => {
      expect(rescaleParts({ essentials: 0, education: 0, free: 0 }, 40)).toEqual({
        essentials: 40,
        education: 0,
        free: 0,
      });
    });

    it("com novo total zero, tudo fica em zero", () => {
      expect(rescaleParts(base, 0)).toEqual({ essentials: 0, education: 0, free: 0 });
    });

    it("a soma é sempre o novo total", () => {
      const splits = [base, { essentials: 1, education: 1, free: 1 }, { essentials: 10, education: 33, free: 7 }];
      for (const split of splits) {
        for (let total = 0; total <= 100; total += 1) {
          const result = rescaleParts(split, total);
          expect(sum(result)).toBe(total);
          expect(Object.values(result).every((value) => Number.isInteger(value) && value >= 0)).toBe(true);
        }
      }
    });
  });

  it("converte entre thumbs do slider e partes", () => {
    expect(splitFromThumbs([60, 65], 70)).toEqual({ essentials: 60, education: 5, free: 5 });
    expect(thumbsFromSplit({ essentials: 60, education: 5, free: 5 })).toEqual([60, 65]);
    expect(splitFromThumbs([70, 70], 70)).toEqual({ essentials: 70, education: 0, free: 0 });
  });

  describe("getPartCents", () => {
    it("calcula o valor de cada parte", () => {
      expect(getPartCents(1_000_000, { essentials: 60, education: 5, free: 5 })).toEqual({
        essentials: 600000,
        education: 50000,
        free: 50000,
      });
    });

    it("a soma fecha com o Momento Presente, com o resto em Livre", () => {
      const parts = { essentials: 33, education: 33, free: 34 };
      const cents = getPartCents(33_333, parts);
      expect(cents.essentials + cents.education + cents.free).toBe(calculatePlannedCents(33_333, 100));
      expect(cents.essentials).toBe(calculatePlannedCents(33_333, 33));
      expect(cents.education).toBe(calculatePlannedCents(33_333, 33));
    });
  });

  it("soma valores por parte", () => {
    expect(
      sumByPart([
        { part: "education", amountCents: 100 },
        { part: "education", amountCents: 50 },
        { part: "free", amountCents: 10 },
      ]),
    ).toEqual({ essentials: 0, education: 150, free: 10 });
  });

  it("monta a série acumulada por parte", () => {
    const items = [
      { part: "essentials" as const, amountCents: 1000, spentOn: "2026-11-02" },
      { part: "education" as const, amountCents: 500, spentOn: "2026-11-03" },
      { part: "essentials" as const, amountCents: 200, spentOn: "2026-11-03" },
    ];
    const series = buildPartSeries(items, "2026-11-04");
    expect(series).toHaveLength(30);
    expect(series[0]).toEqual({ day: 1, essentials: 0, education: 0, free: 0 });
    expect(series[2]).toEqual({ day: 3, essentials: 1200, education: 500, free: 0 });
    expect(series[3]).toEqual({ day: 4, essentials: 1200, education: 500, free: 0 });
    expect(series[4]).toEqual({ day: 5, essentials: null, education: null, free: null });
  });

  describe("getPartBarWidths", () => {
    it("proporção do gasto sobre o limite", () => {
      const widths = getPartBarWidths({ essentials: 120000, education: 10000, free: 5000 }, 700000);
      expect(widths.essentials).toBeCloseTo(17.14, 2);
      expect(widths.education).toBeCloseTo(1.43, 2);
      expect(widths.free).toBeCloseTo(0.71, 2);
    });

    it("acima do limite soma 100% mantendo a proporção", () => {
      const widths = getPartBarWidths({ essentials: 600, education: 300, free: 100 }, 500);
      expect(widths.essentials + widths.education + widths.free).toBeCloseTo(100, 5);
      expect(widths.essentials).toBeCloseTo(60, 5);
      expect(widths.education).toBeCloseTo(30, 5);
    });

    it("com limite zero e gasto, divide pela proporção dos gastos", () => {
      const widths = getPartBarWidths({ essentials: 100, education: 100, free: 0 }, 0);
      expect(widths).toEqual({ essentials: 50, education: 50, free: 0 });
    });

    it("sem gasto, tudo zero", () => {
      expect(getPartBarWidths({ essentials: 0, education: 0, free: 0 }, 0)).toEqual({
        essentials: 0,
        education: 0,
        free: 0,
      });
    });
  });
});
