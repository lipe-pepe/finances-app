# Contract: Server Actions

**Feature**: `001-financial-planning`

Todas as mutações são Server Actions (`"use server"`). Cada action é um **endpoint** para o
Princípio II e MUST ter ao menos um teste de integração em `tests/integration/`.

## Tipos comuns

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

type ActionError =
  | { code: 'UNAUTHENTICATED' }                                     // sem sessão válida
  | { code: 'VALIDATION'; fieldErrors: Record<string, string[]> }   // falha no schema Zod
  | { code: 'NOT_FOUND' }        // id inexistente OU pertence a outro usuário (não revela qual)
  | { code: 'INVALID_CREDENTIALS' }                                 // só signIn
  | { code: 'UNKNOWN' };                                            // erro inesperado
```

Regras comuns a todas as actions protegidas:

1. Obter `userId` via `getCurrentUserId()` (Supabase `auth.getUser()`); sem usuário →
   `UNAUTHENTICATED`, nada é gravado.
2. Validar a entrada com o schema Zod do domínio (o mesmo do formulário) → `VALIDATION`.
3. Toda leitura/escrita via Prisma filtra por `userId`; update/delete de um id de outro usuário
   → `NOT_FOUND` e nenhuma alteração.
4. Em sucesso, `revalidatePath('/')`.
5. `amount` chega como string (formato BRL) e é convertido para centavos/decimal no servidor.

## Auth — `src/features/auth/actions.ts`

| Action | Entrada | Sucesso | Erros |
|---|---|---|---|
| `signIn(input)` | `{ email: string; password: string }` | `redirect('/')` | `VALIDATION`, `INVALID_CREDENTIALS` (mensagem genérica, FR-002) |
| `signOut()` | — | encerra a sessão, `redirect('/login')` | — (idempotente) |

## Incomes — `src/features/incomes/actions.ts`

| Action | Entrada | Sucesso (`data`) |
|---|---|---|
| `createIncome(input)` | `{ name: string; amount: string }` | `{ id: string }` |
| `updateIncome(id, input)` | `id: string`, `{ name: string; amount: string }` | `{ id: string }` |
| `deleteIncome(id)` | `id: string` | `void` |

## Allocation — `src/features/allocation/actions.ts`

| Action | Entrada | Sucesso (`data`) |
|---|---|---|
| `saveAllocation(input)` | `{ essentialPercentage: number }` (inteiro 0–100) | `{ essentialPercentage: number }` |

Upsert por `userId`; chamadas repetidas são idempotentes e a última prevalece.

Exceção à regra 4: `saveAllocation` NÃO chama `revalidatePath`; o cliente já detém o valor, e
revalidar poderia sobrescrever o slider durante um novo arraste.

## Expenses — `src/features/expenses/actions.ts`

| Action | Entrada | Sucesso (`data`) | Erros extras |
|---|---|---|---|
| `createExpense(input)` | `{ name; amount; categoryId: string }` | `{ id }` | `VALIDATION` se `categoryId` não existir |
| `updateExpense(id, input)` | `id`, mesmo formato | `{ id }` | idem |
| `deleteExpense(id)` | `id` | `void` | |

## Goals — `src/features/goals/actions.ts`

| Action | Entrada | Sucesso (`data`) | Erros extras |
|---|---|---|---|
| `createGoal(input)` | `{ name; amount; categoryId?: string \| null }` | `{ id }` | `VALIDATION` se `categoryId` informado não existir |
| `updateGoal(id, input)` | `id`, mesmo formato | `{ id }` | idem |
| `deleteGoal(id)` | `id` | `void` | |

## Queries de leitura (Server Components, não são endpoints públicos)

| Função | Retorno |
|---|---|
| `getPlanningData(userId)` em `src/features/planning/queries.ts` | `{ incomes, expenses, goals, categories, essentialPercentage, revenueCents, expensesTotalCents, goalsTotalCents }` |

Testada por teste de integração (filtra por usuário, aplica padrão 50 sem allocation).

## Cobertura mínima de integração por action

- Caminho feliz persiste no banco.
- Entrada inválida → `VALIDATION`, nada persiste.
- Sem sessão → `UNAUTHENTICATED`.
- (update/delete) id de outro usuário → `NOT_FOUND`, registro do outro usuário intacto.
