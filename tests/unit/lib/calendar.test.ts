import { describe, expect, it } from "vitest";
import {
  APP_TIME_ZONE,
  formatDateBr,
  formatMonthLabel,
  fromDbDate,
  getDaysInMonth,
  getMonthRange,
  getToday,
  isInMonth,
  isValidCalendarDate,
  toDbDate,
} from "@/lib/calendar";

describe("calendar", () => {
  it("usa o fuso de Brasília", () => {
    expect(APP_TIME_ZONE).toBe("America/Sao_Paulo");
  });

  it("calcula o dia de hoje no fuso da aplicação", () => {
    expect(getToday(new Date("2026-11-10T02:30:00Z"))).toBe("2026-11-09");
    expect(getToday(new Date("2026-11-10T03:00:00Z"))).toBe("2026-11-10");
  });

  it("calcula o primeiro e o último dia do mês", () => {
    expect(getMonthRange("2026-11-09")).toEqual({ first: "2026-11-01", last: "2026-11-30" });
    expect(getMonthRange("2028-02-10").last).toBe("2028-02-29");
    expect(getMonthRange("2026-12-31")).toEqual({ first: "2026-12-01", last: "2026-12-31" });
  });

  it("valida datas de calendário no formato YYYY-MM-DD", () => {
    expect(isValidCalendarDate("2026-11-09")).toBe(true);
    expect(isValidCalendarDate("2026-02-30")).toBe(false);
    expect(isValidCalendarDate("2026-13-01")).toBe(false);
    expect(isValidCalendarDate("09/11/2026")).toBe(false);
    expect(isValidCalendarDate("")).toBe(false);
  });

  it("verifica se a data está no mês de hoje", () => {
    expect(isInMonth("2026-11-01", "2026-11-09")).toBe(true);
    expect(isInMonth("2026-11-30", "2026-11-09")).toBe(true);
    expect(isInMonth("2026-10-31", "2026-11-09")).toBe(false);
    expect(isInMonth("2026-12-01", "2026-11-09")).toBe(false);
    expect(isInMonth("2025-11-09", "2026-11-09")).toBe(false);
  });

  it("conta os dias do mês", () => {
    expect(getDaysInMonth("2026-11-09")).toBe(30);
  });

  it("formata mês e data em pt-BR", () => {
    expect(formatMonthLabel("2026-11-09")).toBe("Novembro de 2026");
    expect(formatDateBr("2026-11-09")).toBe("09/11/2026");
  });

  it("converte de e para a data do banco sem deslocar o dia", () => {
    const dbDate = toDbDate("2026-11-09");
    expect(dbDate).toEqual(new Date("2026-11-09T00:00:00.000Z"));
    expect(fromDbDate(dbDate)).toBe("2026-11-09");
  });
});
