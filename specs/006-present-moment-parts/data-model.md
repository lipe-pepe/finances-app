# Data Model: Divisão do Momento Presente em partes

**Feature**: `006-present-moment-parts` | **Date**: 2026-11-11

## Enum `PresentPart` (novo, `present_part`)

| Valor | Rótulo na UI | Ordem | Token de cor |
|---|---|---|---|
| `essentials` | Gastos Essenciais | 1 | `--part-essentials` |
| `education` | Educação | 2 | `--part-education` |
| `free` | Livre | 3 | `--part-free` |

As partes são fixas: o usuário não cria, renomeia nem apaga partes.

## Allocation (`allocations`, alterada)

| Campo (Prisma) | Coluna | Tipo | Regras |
|---|---|---|---|
| `userId` | `user_id` | `UUID`, PK | inalterado |
| `essentialPercentage` | `essential_percentage` | `SMALLINT` | inalterado: **porcentagem do Momento Presente** (0–100); nome legado |
| `educationPercentage` | `education_percentage` | `SMALLINT NOT NULL DEFAULT 0` | **novo**: inteiro ≥ 0 |
| `freePercentage` | `free_percentage` | `SMALLINT NOT NULL DEFAULT 0` | **novo**: inteiro ≥ 0 |
| `updatedAt` | `updated_at` | `TIMESTAMPTZ(6)` | inalterado |

**Derivado** (não gravado): `essentials = essentialPercentage − educationPercentage − freePercentage`.

**SQL manual na migração**: `CHECK ("education_percentage" >= 0 AND "free_percentage" >= 0 AND
"education_percentage" + "free_percentage" <= "essential_percentage")` como
`allocations_present_parts_check`.

**Sem linha**: Momento Presente 50% (`DEFAULT_ESSENTIAL_PERCENTAGE`), Educação 0% e Livre 0%.

## Expense (`expenses`, alterada) e ActualExpense (`actual_expenses`, alterada)

| Campo | Coluna | Tipo | Regras |
|---|---|---|---|
| `part` | `part` | `present_part NOT NULL DEFAULT 'essentials'` | **novo**; obrigatório nos formulários; linhas existentes ficam `essentials` |

Os demais campos ficam inalterados.

## Tipos da aplicação

```ts
type PresentPart = "essentials" | "education" | "free";

/** Porcentagens da Receita por parte; soma = porcentagem do Momento Presente. */
type PartPercentages = Record<PresentPart, number>;

/** Valores em centavos por parte; soma = valor do Momento Presente (resto em Livre). */
type PartCents = Record<PresentPart, number>;

// Planejamento (features/planning/queries.ts)
type ExpenseItem = { /* campos atuais */ part: PresentPart };
type PlanningData = {
  /* campos atuais */
  educationPercentage: number;
  freePercentage: number;
  expensesTotalCentsByPart: PartCents;
};

// Controle (features/control/queries.ts)
type ActualExpenseItem = { /* campos atuais */ part: PresentPart };
type ControlData = {
  today: string;
  categories: CategoryOption[];
  actualExpenses: ActualExpenseItem[];
  presentPercentage: number;
  partPercentages: PartPercentages;
  presentLimitCents: number;   // Receita × Momento Presente
  partLimitCents: PartCents;   // R7
  // removido: plannedCentsByCategory
};

// Série do gráfico (lib/present-parts.ts)
type PartSeriesPoint = {
  day: number;
  essentials: number | null;
  education: number | null;
  free: number | null;
};
```

## Regras puras (`src/lib/present-parts.ts`)

| Função | Regra |
|---|---|
| `PRESENT_PARTS` | `["essentials", "education", "free"]` (ordem fixa) |
| `toPartPercentages(present, education, free)` | `{ essentials: present − education − free, education, free }` |
| `rescaleParts(parts, newPresent)` | maior resto, com empate na ordem fixa; total antigo 0 → tudo em `essentials` (R2) |
| `splitFromThumbs([a, b])` | thumbs do slider → `{ essentials: a, education: b − a, free: present − b }` |
| `thumbsFromSplit(parts)` | `[essentials, essentials + education]` |
| `getPartCents(revenueCents, parts)` | R7 (resto em `free`) |
| `sumByPart(items)` | soma de `amountCents` por parte |
| `buildPartSeries(items, today)` | R11 |
| `getPartBarWidths(spentByPart, limitCents)` | R10 |

## Validação

| Onde | Regra | Erro |
|---|---|---|
| `presentSplitSchema` | `educationPercentage` e `freePercentage` inteiros ≥ 0 | "Porcentagem inválida." |
| `savePresentSplit` (servidor) | `education + free ≤ presente gravado` | `VALIDATION` com `fieldErrors.freePercentage = ["A soma das partes não pode passar do Momento Presente."]` |
| `presentPartSchema` | um dos três valores | "Selecione a parte." |
| Banco | enum `present_part` e `CHECK` das porcentagens | última defesa |

## Estados da parte ativa (Controle, só no cliente)

`null` (todo o Momento Presente) ⇄ `essentials` | `education` | `free`. Clicar na parte ativa
volta para `null`; clicar em outra parte troca a ativa. Ao recarregar a página, volta para `null`.
