// Datas de calendário (dia, sem horário) como strings "YYYY-MM-DD".
// O "hoje" e o "mês atual" usam o fuso da aplicação, igual no cliente e no servidor (research R3).

export const APP_TIME_ZONE = "America/Sao_Paulo";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// "en-CA" formata como YYYY-MM-DD
const todayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type DateParts = { year: number; month: number; day: number };

function parseParts(date: string): DateParts | null {
  const match = DATE_PATTERN.exec(date);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatParts({ year, month, day }: DateParts): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number): number {
  // Dia 0 do mês seguinte é o último dia do mês (em UTC, sem depender do fuso da máquina)
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Dia de hoje no fuso da aplicação. */
export function getToday(now: Date): string {
  return todayFormatter.format(now);
}

/** Verifica formato YYYY-MM-DD e se o dia existe (ex.: rejeita 2026-02-30). */
export function isValidCalendarDate(date: string): boolean {
  const parts = parseParts(date);
  if (!parts) return false;
  if (parts.month < 1 || parts.month > 12) return false;
  return parts.day >= 1 && parts.day <= daysInMonth(parts.year, parts.month);
}

function requireParts(date: string): DateParts {
  const parts = parseParts(date);
  if (!parts || !isValidCalendarDate(date)) {
    throw new Error(`Data inválida: ${date}`);
  }
  return parts;
}

/** Quantidade de dias do mês da data informada. */
export function getDaysInMonth(date: string): number {
  const { year, month } = requireParts(date);
  return daysInMonth(year, month);
}

/** Primeiro e último dia do mês da data informada. */
export function getMonthRange(date: string): { first: string; last: string } {
  const { year, month } = requireParts(date);
  return {
    first: formatParts({ year, month, day: 1 }),
    last: formatParts({ year, month, day: daysInMonth(year, month) }),
  };
}

/** Indica se `date` está no mesmo mês e ano de `today`. */
export function isInMonth(date: string, today: string): boolean {
  if (!isValidCalendarDate(date)) return false;
  // Strings ISO do mesmo mês compartilham o prefixo "YYYY-MM"
  return date.slice(0, 7) === today.slice(0, 7);
}

/** Dia do mês (1–31) da data. */
export function getDayOfMonth(date: string): number {
  return requireParts(date).day;
}

/** Ex.: "2026-11-09" → "Novembro de 2026". */
export function formatMonthLabel(date: string): string {
  const { year, month } = requireParts(date);
  return `${MONTH_NAMES[month - 1]} de ${year}`;
}

/** Ex.: "2026-11-09" → "09/11/2026". */
export function formatDateBr(date: string): string {
  const { year, month, day } = requireParts(date);
  return `${pad(day)}/${pad(month)}/${year}`;
}

/** Converte para o Date que o Prisma grava em uma coluna DATE (meia-noite UTC). */
export function toDbDate(date: string): Date {
  const { year, month, day } = requireParts(date);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Converte o Date lido de uma coluna DATE para "YYYY-MM-DD". */
export function fromDbDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
