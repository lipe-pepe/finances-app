# Implementation Plan: Planejamento e Controle de gastos

**Branch**: `003-spending-control` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-spending-control/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Dividir a plataforma em duas páginas — **Planejamento** (`/planning`, as abas da feature 002) e
**Controle** (`/control`) — com navegação no topo, `/` e o pós-login levando ao Controle. No
Controle, o usuário registra, edita e apaga **gastos realizados** (nome, valor, categoria e data
dentro do mês atual) e acompanha um dashboard do mês: seleção de categoria ("Todos" por padrão),
planejado (soma dos gastos do Momento Presente da categoria), gasto, disponível, lista e gráfico do
gasto acumulado com a linha de limite.

Abordagem: nova tabela `actual_expenses` via Prisma Migrate (com RLS); Server Actions no domínio
`src/features/control`; a página `/control` carrega no servidor os dados do mês e um Client
Component filtra por categoria no navegador; cálculos em funções puras (`src/lib/spending.ts`,
`src/lib/calendar.ts`); gráfico com shadcn/ui `chart` (Recharts). Fuso da aplicação fixo em
`America/Sao_Paulo`. Detalhes em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: as das features 001/002; novo componente shadcn/ui `chart` (adiciona
`recharts` 3.x)

**Storage**: Supabase PostgreSQL via Prisma; nova tabela `actual_expenses` (1 migração)

**Testing**: Vitest + Testing Library (unitários) e testes de integração das Server Actions e da
consulta do Controle contra Supabase local

**Target Platform**: navegadores modernos, desktop e celular

**Project Type**: aplicação web Next.js (mesmo projeto)

**Performance Goals**: troca de categoria < 1 s sem ida ao servidor (SC-004); registro de gasto do
dia em < 30 s (SC-002)

**Constraints**: SSR por padrão; data do gasto dentro do mês atual validada no cliente e no
servidor; dinheiro em centavos; nenhuma alteração nos dados do planejamento

**Scale/Scope**: 3 rotas (`/`, `/planning`, `/control`), 1 tabela, 3 Server Actions novas,
~8 componentes novos, ajustes de rota em ~6 arquivos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Rotas `/planning` e `/control`, modelo `ActualExpense`, tabela `actual_expenses`, coluna `spent_on`, domínio `control`; comentários em português; textos de UI em pt-BR | ✅ Pass |
| II. Testes (não negociável) | Unitários: `calendar`, `spending`, schema do Controle, `auth-redirect` e `planning-tab` atualizados, `AppHeader`, formulário, dashboard, gráfico, teste da spec `tests/unit/specs/003-spending-control.spec.test.ts`. Integração: 3 actions novas + `getControlData`; testes existentes ajustados aos novos caminhos | ✅ Pass |
| III. SSR primeiro | Páginas, header e consulta no servidor. Client Components justificados: `ActualExpenseForm` (React Hook Form), `ControlDashboard` (categoria selecionada e filtro sem ida ao servidor), `SpendingChart` e `ui/chart.tsx` (Recharts depende do DOM) | ✅ Pass |
| IV. React Hook Form | Formulário do gasto realizado com RHF + `createActualExpenseSchema(today)`, revalidado no servidor | ✅ Pass |
| V. Supabase, Prisma e Auth | Migração gerada pelo Prisma Migrate, com FK para `auth.users`, `CHECK` de valor e RLS em SQL manual no arquivo da migração; toda consulta filtra por `userId`; identidade via `auth.getUser()` | ✅ Pass |
| Commits | Commits por tarefa no padrão `tipo(escopo): descrição [T###]` na branch `003-spending-control` | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass. O fuso fixo (R3) é uma interpretação da spec
registrada em research.md, não uma violação.

## Project Structure

### Documentation (this feature)

```text
specs/003-spending-control/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── server-actions.md
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma                                   # ALTERADO: model ActualExpense
└── migrations/<timestamp>_actual_expenses/         # NOVO: tabela, FK auth.users, CHECK, RLS

src/
├── app/
│   ├── page.tsx                                    # ALTERADO: redirect("/control")
│   ├── planning/page.tsx                           # NOVO: conteúdo da antiga page.tsx
│   └── control/page.tsx                            # NOVO
├── components/ui/chart.tsx                         # NOVO (shadcn/ui)
├── lib/
│   ├── auth-redirect.ts                            # ALTERADO: HOME_PATH=/control, "/"→/control
│   ├── planning-tab.ts                             # ALTERADO: base /planning
│   ├── app-routes.ts                               # NOVO: PLANNING_PATH, CONTROL_PATH
│   ├── calendar.ts                                 # NOVO: fuso, hoje, mês, datas
│   ├── spending.ts                                 # NOVO: planejado, filtro, disponível, série
│   └── control-labels.ts                           # NOVO: textos do Controle
└── features/
    ├── planning/components/app-header.tsx          # ALTERADO: navegação Planejamento/Controle
    ├── auth/actions.ts                             # ALTERADO: destino pós-login
    ├── incomes|expenses|goals/actions.ts           # ALTERADO: revalidatePath
    └── control/                                    # NOVO
        ├── actions.ts
        ├── schemas.ts
        ├── queries.ts
        └── components/
            ├── actual-expense-form.tsx             # Client
            ├── actual-expense-list.tsx
            ├── control-dashboard.tsx               # Client
            ├── spending-summary.tsx
            └── spending-chart.tsx                  # Client

tests/
├── unit/
│   ├── lib/{calendar,spending}.test.ts                          # NOVOS
│   ├── lib/{auth-redirect,planning-tab}.test.ts                 # ALTERADOS
│   ├── schemas/control.schemas.test.ts                          # NOVO
│   ├── components/{app-header,actual-expense-form,control-dashboard,spending-chart}.test.tsx  # NOVOS
│   └── specs/003-spending-control.spec.test.ts                  # NOVO
└── integration/
    ├── control.actions.test.ts                                  # NOVO
    ├── control.queries.test.ts                                  # NOVO
    └── auth/incomes/expenses/goals tests                        # ALTERADOS (caminhos)
```

**Structure Decision**: mantém a organização por domínio. O Controle ganha seu próprio domínio
(`src/features/control`) e não reaproveita o `Expense`; reaproveita `nameSchema`, `amountSchema`,
`categoryExists`, `DeleteConfirmDialog`, `runAction` e os componentes de UI existentes.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
