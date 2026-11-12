# Contract: Server Actions

**Feature**: `007-planning-adjustments`

Tipos comuns e regras gerais: os de `specs/001-financial-planning/contracts/server-actions.md`.

## Expenses — `src/features/expenses/actions.ts` (alterada)

| Action | Entrada | Mudança |
|---|---|---|
| `createExpense(input)` | `{ name, amount, categoryId, part }` | Inalterada: `part` obrigatório (agora vem da parte selecionada, não de um campo) |
| `updateExpense(id, input)` | `{ name, amount, categoryId }` | Validada com `expenseUpdateSchema`; **não lê nem grava `part`**: um `part` enviado é descartado e a parte gravada continua a mesma (FR-012) |

Os demais comportamentos não mudam (`NOT_FOUND` para gasto de outro usuário, `VALIDATION`,
`revalidatePath` de `/planning` e `/control`).

Nenhuma outra action muda. As actions do Controle continuam aceitando e gravando `part` em
create e update (FR-016).
