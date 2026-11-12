# Data Model: Ajustes do Planejamento e cores das partes

**Feature**: `007-planning-adjustments` | **Date**: 2026-11-11

Sem mudanças no banco: nenhuma tabela, coluna, enum ou migração. As entidades da feature 006
(`Allocation` com as partes, `Expense.part` e `ActualExpense.part`) ficam como estão.

## Mudança de regra (aplicação)

| Item | Antes (006) | Depois (007) |
|---|---|---|
| Parte de um gasto planejado na criação | Escolhida no campo "Parte" do formulário | A parte selecionada no seletor da aba (padrão `essentials`) |
| Parte de um gasto planejado na edição | Podia ser trocada | **Fixa**: a edição não lê nem grava `part` |
| Parte de um gasto realizado (Controle) | Campo "Parte" no registro e na edição | Inalterado |

## Validação

| Schema | Campos | Uso |
|---|---|---|
| `expenseSchema` | `name`, `amount`, `categoryId`, `part` (obrigatório) | `createExpense` |
| `expenseUpdateSchema` (novo) | `name`, `amount`, `categoryId` (`part` omitido e descartado) | `updateExpense` |

## Estado de tela (só no cliente)

`selectedPart: PresentPart` no `PresentPartPanel`: começa em `"essentials"` e não é guardado; ao
recarregar a página, volta para `"essentials"`.

## Tokens de cor (tema)

| Token | Claro | Escuro |
|---|---|---|
| `--part-essentials` | `#ea580c` | `#fb923c` (mesmo valor do `--present` escuro) |
| `--part-education` | `#0891b2` | `#22d3ee` |
| `--part-free` | `#9333ea` | `#c084fc` |
