# Contract: Server Actions e consultas

**Feature**: `006-present-moment-parts`

Tipos comuns (`ActionResult`, `ActionError`) e regras gerais: os de
`specs/001-financial-planning/contracts/server-actions.md`. Cada action é um endpoint para o
Princípio II e MUST ter ao menos um teste de integração, incluindo o caso sem sessão.

## Allocation — `src/features/allocation/actions.ts`

| Action | Entrada | Sucesso (`data`) | Erros |
|---|---|---|---|
| `saveAllocation(input)` (alterada) | `{ essentialPercentage: number }` (inalterada) | `{ essentialPercentage, parts: PartPercentages }` | `UNAUTHENTICATED`, `VALIDATION`, `UNKNOWN` |
| `savePresentSplit(input)` (nova) | `{ educationPercentage: number; freePercentage: number }` | `{ parts: PartPercentages }` | `UNAUTHENTICATED`, `VALIDATION`, `UNKNOWN` |

Regras:

1. `saveAllocation` lê as partes gravadas (ou o padrão), calcula
   `rescaleParts(partesAtuais, novoPresente)` e grava `essential_percentage`,
   `education_percentage` e `free_percentage` num único `upsert` (FR-008, research R2).
2. `savePresentSplit` valida com `presentSplitSchema` e lê `essential_percentage` (ou 50 sem
   linha). Se `education + free > presente`, devolve `VALIDATION` em `freePercentage`. Se estiver
   tudo certo, faz `upsert` (criando a linha com `essential_percentage = 50` quando ela não
   existe).
3. Nenhuma das duas chama `revalidatePath` (exceção já documentada para o slider): o cliente
   ignora respostas antigas pelo id da requisição.

## Expenses — `src/features/expenses/actions.ts` (alteradas)

| Action | Mudança na entrada |
|---|---|
| `createExpense(input)` | `input.part: PresentPart` obrigatório |
| `updateExpense(id, input)` | idem |

`part` é validado por `presentPartSchema` (`VALIDATION` em `fieldErrors.part`). O
`revalidatePath` não muda (`/planning` e `/control`).

## Control — `src/features/control/actions.ts` (alteradas)

| Action | Mudança na entrada |
|---|---|
| `createActualExpense(input)` | `input.part: PresentPart` obrigatório |
| `updateActualExpense(id, input)` | idem |

Mesma validação de `part`. As demais regras da feature 003 não mudam.

## Consultas

| Função | Mudança |
|---|---|
| `getPlanningData(userId)` | `ExpenseItem.part`; `educationPercentage`, `freePercentage` (padrão 0) e `expensesTotalCentsByPart` |
| `getControlData(userId, today)` | `ActualExpenseItem.part`; `presentPercentage`, `partPercentages`, `presentLimitCents` e `partLimitCents` (calculados a partir dos ganhos e da alocação do usuário); **remove** `plannedCentsByCategory` |

Todas continuam filtrando por `userId`.
