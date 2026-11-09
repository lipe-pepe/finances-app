# Contract: Server Actions

**Feature**: `003-spending-control`

Tipos comuns (`ActionResult`, `ActionError`) e regras gerais: as de
`specs/001-financial-planning/contracts/server-actions.md`. Cada action é um endpoint para o
Princípio II e MUST ter ao menos um teste de integração.

## Control — `src/features/control/actions.ts` (novo)

| Action | Entrada | Sucesso (`data`) | Erros |
|---|---|---|---|
| `createActualExpense(input)` | `{ name: string; amount: string; categoryId: string; spentOn: string }` | `{ id: string }` | `UNAUTHENTICATED`, `VALIDATION`, `UNKNOWN` |
| `updateActualExpense(id, input)` | `id: string`, mesmo `input` | `{ id: string }` | os acima + `NOT_FOUND` |
| `deleteActualExpense(id)` | `id: string` | `void` | `UNAUTHENTICATED`, `NOT_FOUND`, `UNKNOWN` |

Regras específicas:

1. `input` validado com `createActualExpenseSchema(getToday(new Date()))`, no momento da chamada.
   Data fora do mês atual → `VALIDATION` com `fieldErrors.spentOn = ["A data deve estar dentro do
   mês atual."]`.
2. Categoria inexistente → `VALIDATION` em `categoryId` (mesma mensagem dos gastos planejados).
3. `update`/`delete` filtram por `{ id, userId }`; id malformado ou de outro usuário →
   `NOT_FOUND`, nada é alterado.
4. Em sucesso, `revalidatePath("/control")`.
5. Nenhuma action do Controle lê ou altera `expenses` (gastos planejados) — FR-010.

## Alterações em actions existentes

| Action | Mudança |
|---|---|
| `signIn` | sucesso → `redirect("/control")` (antes `/`) |
| `createIncome`, `updateIncome`, `deleteIncome`, `createGoal`, `updateGoal`, `deleteGoal` | `revalidatePath("/planning")` (antes `/`) |
| `createExpense`, `updateExpense`, `deleteExpense` | `revalidatePath("/planning")` e `revalidatePath("/control")` |
| `saveAllocation`, `signOut` | sem alteração |

## Consulta — `src/features/control/queries.ts` (novo)

`getControlData(userId, today)` → `ControlData` (ver [data-model.md](../data-model.md)).

- Gastos realizados: `where { userId, spentOn: { gte: first, lte: last } }` do mês de `today`.
- Planejado por categoria: `expense.groupBy({ by: ["categoryId"], where: { userId }, _sum: { amount } })`.
- Coberta por teste de integração (isolamento por usuário e filtro do mês).
