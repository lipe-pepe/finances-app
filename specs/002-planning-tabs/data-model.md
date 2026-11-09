# Data Model: Momento Presente, Momento Futuro e navegação por abas

**Feature**: `002-planning-tabs` | **Date**: 2026-11-09

## Banco de dados

**Sem alterações.** Nenhuma tabela, coluna, constraint ou política RLS muda; nenhuma migração é
necessária. O modelo continua o de `specs/001-financial-planning/data-model.md`. Os domínios
`expenses` (gastos do Momento Presente) e `goals` (metas do Momento Futuro) mantêm seus nomes.

## Estado de interface (não persistido)

### PlanningTab

| Valor | Aba exibida | Conteúdo |
|---|---|---|
| `income` (padrão) | Receita | `IncomeSection` + `AllocationSection` |
| `present` | Momento Presente | `ExpenseSection` (domínio `expenses`) |
| `future` | Momento Futuro | `GoalSection` (domínio `goals`) |

- Origem: parâmetro `tab` do endereço (`/?tab=present`).
- Regras de leitura (`parsePlanningTab`): valor ausente, vazio, desconhecido ou repetido
  (`?tab=a&tab=b`) → `income`. Comparação exata, sensível a maiúsculas.
- Regras de escrita (`buildPlanningTabUrl`): `income` → `/` (sem parâmetro); demais → `/?tab=<valor>`.
- Ciclo de vida: inicializado no servidor a partir do endereço; depois mantido no cliente; trocas
  atualizam o endereço com `replaceState` (sem nova entrada no histórico).

### Estado de alerta por seção (derivado)

Mesma regra da feature 001, agora compartilhada por alerta da seção e indicador da aba:

| Nome | Fórmula |
|---|---|
| `plannedCents` | `calculatePlannedCents(revenueCents, getSectionPercentage(section, essentialPercentage))` |
| `isOver` | `isOverBudget(totalCents, plannedCents)` (estritamente maior) |
| `excessCents` | `getExcessCents(totalCents, plannedCents)` |

## Textos da interface (`src/lib/planning-labels.ts`)

| Chave | Texto |
|---|---|
| `SECTION_LABELS.expenses` | Momento Presente |
| `SECTION_LABELS.goals` | Momento Futuro |
| `SECTION_TOTAL_LABELS.expenses` | Total do Momento Presente |
| `SECTION_TOTAL_LABELS.goals` | Total do Momento Futuro |
| `overBudgetMessage(section, excess)` | "O Momento Presente excede o planejado em R$ X" / "O Momento Futuro excede o planejado em R$ X" |
| `TAB_LABELS.income` | Receita |
| `TAB_LABELS.present` | Momento Presente |
| `TAB_LABELS.future` | Momento Futuro |
| `TAB_ALERT_SR_TEXT` | ", com alerta" |

Textos dos itens permanecem (FR-011a): "Nome do gasto", "Adicionar gasto", "Nenhum gasto
cadastrado", "Nome da meta", "Adicionar meta", "Nenhuma meta cadastrada".
