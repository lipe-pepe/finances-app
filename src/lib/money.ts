// Utilitários monetários. Todos os cálculos da aplicação usam centavos inteiros (number) para
// evitar erros de ponto flutuante; o banco armazena DECIMAL(12,2).

/** Maior valor aceito: R$ 999.999.999,99 em centavos. */
export const MAX_AMOUNT_CENTS = 99_999_999_999;

// Formatos aceitos: "1.234,56", "1234,56", "1234.56", "1.234" (milhar) e "1234"
const COMMA_DECIMAL = /^(\d{1,3}(?:\.\d{3})+|\d+),(\d{1,2})$/;
const DOT_DECIMAL = /^(\d+)\.(\d{1,2})$/;
const DOT_THOUSANDS = /^\d{1,3}(?:\.\d{3})+$/;
const INTEGER = /^\d+$/;

/**
 * Converte um texto em reais para centavos. Retorna null quando o formato é inválido
 * (negativos, mais de duas casas decimais, caracteres não numéricos).
 */
export function parseBrlToCents(input: string): number | null {
  const value = input.trim().replace(/^R\$\s*/, "");

  let integerPart: string;
  let fractionPart = "";

  const commaMatch = COMMA_DECIMAL.exec(value);
  const dotMatch = DOT_DECIMAL.exec(value);
  if (commaMatch) {
    integerPart = commaMatch[1].replaceAll(".", "");
    fractionPart = commaMatch[2];
  } else if (dotMatch) {
    integerPart = dotMatch[1];
    fractionPart = dotMatch[2];
  } else if (DOT_THOUSANDS.test(value)) {
    integerPart = value.replaceAll(".", "");
  } else if (INTEGER.test(value)) {
    integerPart = value;
  } else {
    return null;
  }

  // Evita perda de precisão em números absurdamente grandes
  if (integerPart.length > 13) {
    return null;
  }

  return Number(integerPart) * 100 + Number(fractionPart.padEnd(2, "0"));
}

/** Converte centavos para a string decimal usada pelo banco (ex.: 123456 → "1234.56"). */
export function centsToDecimalString(cents: number): string {
  const integerPart = Math.floor(cents / 100);
  const fractionPart = String(cents % 100).padStart(2, "0");
  return `${integerPart}.${fractionPart}`;
}

/** Converte um valor decimal vindo do banco (Prisma Decimal ou string) para centavos. */
export function decimalToCents(value: { toString(): string } | string): number {
  const [integerPart, fractionPart = ""] = value.toString().split(".");
  return Number(integerPart) * 100 + Number(fractionPart.padEnd(2, "0").slice(0, 2));
}

/** Converte centavos para o texto exibido em um campo de formulário (ex.: 125050 → "1250,50"). */
export function centsToInputString(cents: number): string {
  return centsToDecimalString(cents).replace(".", ",");
}

const brlFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos no padrão brasileiro (ex.: 123456 → "R$ 1.234,56"). */
export function formatBrl(cents: number): string {
  // Troca o espaço não separável do Intl por um espaço comum, para exibição e testes estáveis
  return brlFormatter.format(cents / 100).replace(/ /g, " ");
}
