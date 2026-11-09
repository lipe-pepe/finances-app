# Data Model: Planejamento e Controle de gastos

**Feature**: `003-spending-control` | **Date**: 2026-11-09

Entidades existentes (`Income`, `Allocation`, `Category`, `Expense`, `Goal`): sem alterações; ver
`specs/001-financial-planning/data-model.md`. Esta feature adiciona uma tabela.

## ActualExpense (novo) — tabela `actual_expenses`

Gasto realizado, registrado na página Controle. Independente de `Expense` (gasto planejado).

| Campo (Prisma) | Coluna | Tipo | Regras |
|---|---|---|---|
| `id` | `id` | `uuid` PK | `gen_random_uuid()` |
| `userId` | `user_id` | `uuid` | obrigatório; FK `auth.users(id)` `ON DELETE CASCADE` (SQL manual) |
| `name` | `name` | `varchar(100)` | obrigatório; 1–100 caracteres após `trim` |
| `amount` | `amount` | `decimal(12,2)` | obrigatório; `CHECK (amount > 0 AND amount <= 999999999.99)` |
| `categoryId` | `category_id` | `uuid` | obrigatório; FK `categories(id)` `ON DELETE RESTRICT` |
| `spentOn` | `spent_on` | `date` | obrigatório; dentro do mês atual no momento de criar/editar (regra da aplicação) |
| `createdAt` | `created_at` | `timestamptz(6)` | `now()` |
| `updatedAt` | `updated_at` | `timestamptz(6)` | `@updatedAt` |

- **Índice**: `(user_id, spent_on)` — a consulta do dashboard filtra por usuário e intervalo do mês.
- **Relação**: `Category 1 — N ActualExpense` (`Category.actualExpenses`).
- **RLS** (SQL manual na migração, como nas demais tabelas): habilitado, com políticas
  `select/insert/update/delete` `TO authenticated` e `auth.uid() = user_id`.
- **Ordenação na lista**: `spent_on DESC, created_at DESC`.

## Valores derivados (não persistidos)

Calculados em centavos (`number` inteiro) por funções puras em `src/lib/spending.ts`.

| Valor | Regra |
|---|---|
| Seleção | `"all"` ou o `id` de uma categoria |
| Planejado da seleção | soma de `Expense.amount` do usuário na categoria; em `"all"`, de todos os `Expense` do usuário. `Goal` não entra (FR-015) |
| Gastos da seleção | `ActualExpense` do usuário com `spent_on` no mês atual e, se houver categoria, `category_id` igual (FR-016, FR-021) |
| Gasto da seleção | soma dos valores dos gastos da seleção |
| Disponível | planejado − gasto; pode ser negativo (FR-017) |
| Acima do limite | disponível < 0 |
| Série do gráfico | para cada dia `d` de 1 ao último dia do mês: soma dos gastos com `spent_on <= d`; `null` depois de `max(hoje, último spent_on)` (FR-018) |

## Validação (schema Zod compartilhado)

`createActualExpenseSchema(today)` em `src/features/control/schemas.ts`:

| Campo | Entrada | Saída | Mensagens |
|---|---|---|---|
| `name` | `string` | `string` (trim) | `nameSchema` da feature 001 |
| `amount` | `string` BRL | centavos | `amountSchema` da feature 001 |
| `categoryId` | `string` | uuid | "Selecione uma categoria." |
| `spentOn` | `string` | `"YYYY-MM-DD"` | "Informe a data." (vazio); "Data inválida." (formato ou dia inexistente); "A data deve estar dentro do mês atual." |

A categoria também é conferida no banco (`categoryExists`), como nos gastos planejados.

## Tipos para a UI

```ts
type ActualExpenseItem = {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  spentOn: string; // "YYYY-MM-DD"
};

type ControlData = {
  today: string;                                // "YYYY-MM-DD" no fuso da aplicação
  categories: CategoryOption[];                 // mesma lista do planejamento
  plannedCentsByCategory: Record<string, number>; // só categorias com gasto planejado
  actualExpenses: ActualExpenseItem[];          // mês atual, mais recentes primeiro
};
```
