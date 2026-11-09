# Implementation Plan: Momento Presente, Momento Futuro e navegação por abas

**Branch**: `002-planning-tabs` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-planning-tabs/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Reorganizar a tela de planejamento em três abas — "Receita" (ganhos + divisão da receita),
"Momento Presente" (antigos gastos essenciais) e "Momento Futuro" (antigas metas futuras) —,
renomear os textos das seções e sinalizar no nome da aba quando uma seção excede o planejado. A
aba selecionada fica no endereço (`?tab=income|present|future`).

Abordagem: Radix Tabs (shadcn/ui) em um Client Component `PlanningTabs` controlado, que recebe as
seções renderizadas no servidor como props; a página lê `searchParams` no servidor para abrir na
aba certa; trocas de aba usam `history.replaceState`. Textos centralizados em
`src/lib/planning-labels.ts`; a regra de alerta é extraída para um hook compartilhado pelo alerta
da seção e pelo indicador da aba. Sem mudanças em banco ou Server Actions. Detalhes em
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: as da feature 001; novo componente shadcn/ui `tabs` (Radix Tabs, já
incluso no pacote `radix-ui`)

**Storage**: sem alterações (Supabase PostgreSQL via Prisma); nenhuma migração

**Testing**: Vitest + Testing Library (somente testes unitários; nenhum endpoint novo)

**Target Platform**: navegadores modernos, desktop e celular

**Project Type**: aplicação web Next.js (mesmo projeto da feature 001)

**Performance Goals**: troca de aba < 0,5 s sem ida ao servidor (SC-003); indicadores reagem ao
slider em tempo real

**Constraints**: SSR por padrão; aba inicial correta já no HTML do servidor; sem nova entrada no
histórico por troca de aba

**Scale/Scope**: 1 rota (`/`), 3 abas, ~4 componentes novos/alterados e ~8 alterados em textos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Identificadores e valores de rota em inglês (`tab`, `income`, `present`, `future`, `PlanningTabs`); comentários em português; textos de UI em pt-BR. A spec foi ajustada para não fixar valores de endereço em português | ✅ Pass |
| II. Testes (não negociável) | Testes unitários para cada funcionalidade nova (`parsePlanningTab`, `planning-labels`, `PlanningTabs`, `TabAlertIndicator`), testes existentes atualizados e teste da spec `tests/unit/specs/002-planning-tabs.spec.test.ts`. Nenhum endpoint novo/alterado: testes de integração existentes seguem válidos | ✅ Pass |
| III. SSR primeiro | Página e seções continuam Server Components; aba inicial resolvida no servidor. Novos Client Components (`PlanningTabs`, `TabAlertIndicator`) justificados: interação de abas e reação em tempo real ao slider | ✅ Pass |
| IV. React Hook Form | Formulários inalterados | ✅ Pass |
| V. Supabase, Prisma e Auth | Sem mudança de schema, queries ou autenticação | ✅ Pass |
| Commits | Commits por tarefa no padrão `tipo(escopo): descrição [T###]` na branch `002-planning-tabs` | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-planning-tabs/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── ui.md            # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── page.tsx                                  # ALTERADO: lê searchParams, monta PlanningTabs
├── components/ui/
│   └── tabs.tsx                                  # NOVO (shadcn/ui)
├── lib/
│   ├── planning-tab.ts                           # NOVO: PlanningTab, parsePlanningTab, buildPlanningTabUrl
│   └── planning-labels.ts                        # NOVO: textos das seções, totais, alertas e abas
└── features/
    ├── planning/
    │   ├── hooks/use-over-budget.ts              # NOVO: regra de alerta compartilhada
    │   └── components/
    │       ├── planning-tabs.tsx                 # NOVO (Client)
    │       ├── tab-alert-indicator.tsx           # NOVO (Client)
    │       └── over-budget-alert.tsx             # ALTERADO: usa hook e novos textos
    ├── allocation/components/
    │   ├── allocation-slider.tsx                 # ALTERADO: rótulos
    │   └── allocation-section.tsx                # ALTERADO: descrição
    ├── expenses/components/expense-section.tsx   # ALTERADO: título e total
    └── goals/components/goal-section.tsx         # ALTERADO: título e total

tests/unit/
├── lib/{planning-tab.test.ts, planning-labels.test.ts}                       # NOVOS
├── components/{planning-tabs.test.tsx, tab-alert-indicator.test.tsx}         # NOVOS
├── components/{allocation-slider.test.tsx, over-budget-alert.test.tsx}       # ALTERADOS
└── specs/002-planning-tabs.spec.test.ts                                      # NOVO
```

**Structure Decision**: mantém a organização por domínio da feature 001. Navegação e textos
compartilhados ficam em `src/lib` (funções puras) e `src/features/planning` (componentes da tela);
os domínios `expenses` e `goals` mantêm seus nomes internos.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
