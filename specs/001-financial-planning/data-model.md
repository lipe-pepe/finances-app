# Data Model: Planejamento Financeiro Pessoal

**Feature**: `001-financial-planning` | **Date**: 2026-11-08

Fonte de verdade: `prisma/schema.prisma`. Nomes de modelos e campos em inglês (Princípio I);
tabelas e colunas em `snake_case` via `@@map`/`@map`. Todos os valores monetários são
`Decimal(12,2)` no banco e centavos inteiros na aplicação (ver research R4).

## Visão geral

```text
auth.users (Supabase Auth, não gerenciado pelo projeto)
   │ 1
   ├──< incomes        (N)
   ├──< expenses       (N) >── categories (1, obrigatória)
   ├──< goals          (N) >── categories (0..1, opcional)
   └──1 allocations    (0..1; ausência = 50/50)
```

## Entidades

### Income (`incomes`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `userId` (`user_id`) | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE (SQL manual) |
| `name` | `varchar(100)` | obrigatório, 1–100 caracteres após trim |
| `amount` | `decimal(12,2)` | `CHECK (amount > 0 AND amount <= 999999999.99)` |
| `createdAt` / `updatedAt` | `timestamptz` | padrão `now()` / `@updatedAt` |

Índice: `(user_id, created_at)`. Receita total = `SUM(amount)` dos ganhos do usuário (FR-011).

### Allocation (`allocations`)

| Campo | Tipo | Regras |
|---|---|---|
| `userId` (`user_id`) | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE; uma linha por usuário |
| `essentialPercentage` (`essential_percentage`) | `smallint` | `CHECK (0 <= x <= 100)`, inteiro (FR-014) |
| `updatedAt` | `timestamptz` | `@updatedAt` |

- Porcentagem de metas futuras = `100 - essentialPercentage` (derivada, não armazenada; FR-013).
- Sem linha → a aplicação usa 50 (FR-017). Gravação sempre por upsert (última vence).

### Category (`categories`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `uuid` PK | chave técnica |
| `name` | `varchar(60)` | obrigatório, `UNIQUE` |

- Global, compartilhada por todos os usuários, populada pelo seed; somente leitura para a
  aplicação.
- Atributo de domínio único: `name` (a spec pede "somente a coluna nome"; `id` é a chave
  técnica).

### Expense (`expenses`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `uuid` PK | |
| `userId` (`user_id`) | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | `varchar(100)` | obrigatório, 1–100 |
| `amount` | `decimal(12,2)` | mesmo `CHECK` de `incomes` |
| `categoryId` (`category_id`) | `uuid` | **obrigatório**, FK → `categories(id)` ON DELETE RESTRICT |
| `createdAt` / `updatedAt` | `timestamptz` | |

Índice: `(user_id, created_at)`. Soma dos gastos = `SUM(amount)` (FR-020).

### Goal (`goals`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `uuid` PK | |
| `userId` (`user_id`) | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | `varchar(100)` | obrigatório, 1–100 |
| `amount` | `decimal(12,2)` | mesmo `CHECK`; quanto da receita é reservado para a meta |
| `categoryId` (`category_id`) | `uuid?` | opcional, FK → `categories(id)` ON DELETE SET NULL |
| `createdAt` / `updatedAt` | `timestamptz` | |

Índice: `(user_id, created_at)`. Soma das metas = `SUM(amount)` (FR-024). Sem campo "alvo"
(fora de escopo).

## Segurança no banco (SQL manual nas migrations do Prisma)

Para `incomes`, `expenses`, `goals`, `allocations`:

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Políticas `select/insert/update/delete` para o papel `authenticated` com
  `auth.uid() = user_id` (USING e WITH CHECK).

Para `categories`: RLS habilitado com política `select` para `authenticated`; sem políticas de
escrita.

O acesso pela aplicação é feito pelo Prisma (que ignora o RLS), portanto toda query MUST
filtrar por `userId` (Princípio V).

## Valores derivados (não persistidos) — `src/lib/planning.ts`

| Nome | Fórmula (centavos) |
|---|---|
| `revenueCents` | soma de `incomes.amount` |
| `essentialPlannedCents` | `round(revenueCents × essentialPercentage / 100)` |
| `goalsPlannedCents` | `round(revenueCents × (100 − essentialPercentage) / 100)` |
| `expensesTotalCents` / `goalsTotalCents` | soma de `amount` da seção |
| `isOverBudget` | `totalCents > plannedCents` (estritamente maior; FR-030/031) |
| `excessCents` | `max(0, totalCents − plannedCents)` |

## Validação (schemas Zod compartilhados cliente/servidor)

| Schema | Campos |
|---|---|
| `signInSchema` | `email` (email válido), `password` (não vazio) |
| `incomeSchema` | `name`, `amount` (string BRL → centavos) |
| `expenseSchema` | `name`, `amount`, `categoryId` (uuid obrigatório, deve existir) |
| `goalSchema` | `name`, `amount`, `categoryId` (uuid opcional, deve existir se informado) |
| `allocationSchema` | `essentialPercentage` (inteiro 0–100) |

Regras de `amount`: > 0, no máximo 2 casas decimais, ≤ 999.999.999,99; aceita `1.234,56`,
`1234,56` e `1234.56`.
