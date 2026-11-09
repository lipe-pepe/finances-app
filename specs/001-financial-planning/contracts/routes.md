# Contract: Rotas e UI

**Feature**: `001-financial-planning`

## Rotas

| Rota | Tipo | Acesso | Comportamento |
|---|---|---|---|
| `/login` | Server Component (página) + `LoginForm` cliente | pública | Se já logado, redireciona para `/`. |
| `/` | Server Component (tela de planejamento) | autenticada | Sem sessão → `redirect('/login')` (FR-005). |

`src/proxy.ts`: renova a sessão do Supabase em toda requisição (exceto assets estáticos) e
redireciona usuários sem sessão de `/` para `/login`. A página `/` também verifica a sessão no
servidor (defesa em profundidade).

## Tela de planejamento (`/`) — seções e responsabilidades

| Seção | Componente(s) | Server/Client | Requisitos |
|---|---|---|---|
| Cabeçalho | `AppHeader`, `SignOutButton` (form com action) | Server | FR-004 |
| Ganhos | `IncomeSection`, `IncomeList`, `RevenueTotal` | Server | FR-008–FR-012 |
| | `IncomeForm` (criar/editar), `DeleteConfirmDialog` | Client (RHF / diálogo) | FR-009, FR-010 |
| Divisão | `AllocationProvider`, `AllocationSlider` | Client | FR-013–FR-017 |
| Gastos essenciais | `ExpenseSection`, `ExpenseList`, `SectionTotal` | Server | FR-018–FR-021 |
| | `ExpenseForm`, `DeleteConfirmDialog` | Client | FR-026 |
| | `PlannedAmount`, `OverBudgetAlert` | Client (lê o contexto do slider) | FR-015, FR-030 |
| Metas futuras | `GoalSection`, `GoalList`, `SectionTotal` | Server | FR-022–FR-025 |
| | `GoalForm`, `DeleteConfirmDialog` | Client | FR-026 |
| | `PlannedAmount`, `OverBudgetAlert` | Client | FR-015, FR-031 |

## Contrato de UI dos componentes cliente críticos

- `AllocationSlider`: `role="slider"` acessível, rótulos "Gastos essenciais X%" e "Metas
  futuras Y%" (X + Y = 100); passo 1; `onValueChange` atualiza o contexto; `onValueCommit` chama
  `saveAllocation`; mostra estado "Salvando…" / "Divisão não salva — tentar novamente".
- `OverBudgetAlert` props: `{ section: 'expenses' | 'goals'; revenueCents: number;
  totalCents: number }`. Renderiza `role="alert"` somente quando `totalCents > plannedCents`,
  com o valor excedido formatado em BRL.
- Formulários (`IncomeForm`, `ExpenseForm`, `GoalForm`): React Hook Form + `zodResolver`;
  mostram erros por campo; em `VALIDATION` do servidor, aplicam `fieldErrors` via `setError`;
  desabilitam o envio durante o salvamento; mostram mensagem de falha genérica em `UNKNOWN`.
- `ExpenseForm` sem categorias disponíveis: mostra "Nenhuma categoria disponível" e desabilita
  o envio.
- Formatação monetária: sempre `formatBrl` (`R$ 1.234,56`).
