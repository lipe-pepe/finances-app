# Implementation Plan: Divisão do Momento Presente em partes

**Branch**: `006-present-moment-parts` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-present-moment-parts/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Dividir o Momento Presente em três **partes** fixas: Gastos Essenciais, Educação e Livre. Cada parte
é uma porcentagem inteira da Receita, e as três somam a porcentagem do Momento Presente.

- **Planejamento:** na aba Momento Presente, um slider com duas divisões ajusta as partes. Cada
  gasto planejado ganha uma parte, e cada parte mostra o planejado contra o seu valor, com alerta
  quando passa dele.
- **Controle:** cada gasto realizado ganha uma parte. A barra de uso passa a ter um trecho por
  parte, clicável, que filtra todo o dashboard. O gráfico mostra uma curva acumulada e uma linha de
  limite por parte. O "Planejado" do resumo vira "Limite", igual ao valor da parte ou do Momento
  Presente.

Abordagem:

- **Divisão:** duas colunas novas em `allocations` (`education_percentage` e `free_percentage`).
  Gastos Essenciais é derivado (Momento Presente − Educação − Livre), então a soma está sempre
  correta por construção.
- **Parte dos gastos:** um enum `present_part` e a coluna `part` em `expenses` e
  `actual_expenses`, com padrão `essentials`. Os gastos existentes ficam em Gastos Essenciais.
- **Regras:** funções puras em `src/lib/present-parts.ts` (reajuste proporcional, valores em
  centavos e séries por parte).
- **Componentes:** slider com dois thumbs sobre o `Slider` existente, tooltip do shadcn/ui na barra
  e três tokens de laranja.

Detalhes em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: Next.js 16.4 (App Router), React 19.3, Prisma 7, React Hook Form 7 + Zod
4, Recharts 3 (via `ui/chart`) e shadcn/ui (`radix-ui` já instalado). Componente shadcn/ui novo:
`tooltip`. Nenhuma dependência nova de infraestrutura.

**Storage**: Supabase PostgreSQL via Prisma. Uma migração com o enum `present_part`, as colunas
`part` em `expenses` e `actual_expenses` e as colunas `education_percentage` e `free_percentage`
em `allocations`.

**Testing**: Vitest + Testing Library (unitários) e testes de integração das Server Actions e
consultas contra o Supabase local

**Target Platform**: navegadores modernos, desktop e celular, temas claro e escuro

**Project Type**: aplicação web Next.js (mesmo projeto)

**Performance Goals**: valores das partes atualizados a cada passo do slider sem ida ao servidor
(SC-002). Ativar uma parte ou trocar a categoria filtra no navegador, sem ida ao servidor
(comportamento atual do Controle).

**Constraints**: porcentagens inteiras; soma das partes = Momento Presente (SC-001); dinheiro em
centavos; validação repetida no servidor (FR-022); tokens do tema e contraste ≥ 3:1 para as cores
das partes (FR-019); alvos de toque ≥ 44 px (FR-023)

**Scale/Scope**: 1 migração, 1 Server Action nova (`savePresentSplit`), 5 actions alteradas
(`saveAllocation`, create/update de `expense` e de `actualExpense`), 2 consultas alteradas,
~6 componentes novos e ~8 alterados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Enum `PresentPart` (`essentials`, `education`, `free`), colunas `part`, `education_percentage` e `free_percentage`, módulo `present-parts`; comentários em português; textos de UI em pt-BR | ✅ Pass |
| II. Testes (não negociável) | Unitários: `present-parts` (reajuste, valores e séries), schemas com `part`, `PresentSplitSlider`, `PartUsageBar`, `PartPicker`, `SpendingChart` com três séries, dashboard com filtro por parte, listas com a parte, tokens e contraste; teste da spec `tests/unit/specs/006-present-moment-parts.spec.test.ts`. Integração: `savePresentSplit` (nova), `saveAllocation` com reajuste, create/update de `expense` e `actualExpense` com `part`, `getPlanningData` e `getControlData` | ✅ Pass |
| III. SSR primeiro | Páginas e consultas no servidor. Client Components justificados: `PresentSplitSlider` (arraste em tempo real), `PartUsageBar` (parte ativa, tooltip), `PartPicker` (campo de formulário), e os já existentes `ControlDashboard`, `SpendingChart` e formulários | ✅ Pass |
| IV. React Hook Form | Campo "Parte" registrado nos formulários RHF existentes (`ExpenseForm`, `ActualExpenseForm`); `part` validado por Zod no cliente e no servidor | ✅ Pass |
| V. Supabase, Prisma e Auth | Migração pelo Prisma Migrate, com `CHECK` de porcentagens em SQL manual; tabelas já têm RLS; consultas e escritas filtram por `userId`; nenhuma tabela nova | ✅ Pass |
| VI. Design system e acessibilidade | Tokens `--part-essentials`, `--part-education` e `--part-free` (tons de laranja do Momento Presente, sem reatribuir cores com significado) nos dois temas com ≥ 3:1; parte sempre identificada pelo nome; slider e barra operáveis por teclado; alvos ≥ 44 px; 360 px sem rolagem | ✅ Pass |
| Commits | `tipo(escopo): descrição [T###]` por tarefa | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass. O FR-029 (o "Planejado" do Controle vira "Limite")
substitui intencionalmente o FR-015 da feature 003; isso está registrado na spec e em
research.md R8, e não é uma violação da constituição.

## Project Structure

### Documentation (this feature)

```text
specs/006-present-moment-parts/
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
├── schema.prisma                                   # ALTERADO: enum PresentPart; part em Expense e
│                                                   #   ActualExpense; 2 colunas em Allocation
└── migrations/<timestamp>_present_parts/           # NOVO: enum, colunas com default, CHECKs

src/
├── app/
│   ├── globals.css                                 # ALTERADO: tokens --part-* (claro/escuro)
│   ├── planning/page.tsx                           # ALTERADO: passa as partes ao provider/seção
│   └── control/page.tsx                            # ALTERADO: novos dados do dashboard
├── components/
│   ├── ui/tooltip.tsx                              # NOVO (shadcn/ui)
│   └── ui/slider.tsx                               # ALTERADO: nome acessível por thumb
├── lib/
│   ├── present-parts.ts                            # NOVO: partes, reajuste, valores, séries
│   ├── part-labels.ts                              # NOVO: nomes e textos das partes
│   ├── spending.ts                                 # ALTERADO: filtro por parte; sem planejado
│   └── control-labels.ts                           # ALTERADO: "Limite" no resumo
└── features/
    ├── allocation/
    │   ├── actions.ts                              # ALTERADO: saveAllocation reajusta as partes;
    │   │                                           #   nova savePresentSplit
    │   ├── schemas.ts                              # ALTERADO: presentSplitSchema
    │   └── components/
    │       ├── allocation-provider.tsx             # ALTERADO: partes em tempo real
    │       ├── allocation-slider.tsx               # ALTERADO: reajusta as partes ao arrastar
    │       └── present-split-slider.tsx            # NOVO: slider com dois thumbs
    ├── expenses/
    │   ├── schemas.ts, actions.ts                  # ALTERADO: part
    │   └── components/
    │       ├── expense-form.tsx                    # ALTERADO: campo Parte
    │       ├── expense-list.tsx                    # ALTERADO: mostra a parte
    │       ├── expense-section.tsx                 # ALTERADO: divisão + resumo por parte
    │       └── part-budget-list.tsx                # NOVO: planejado × valor por parte + alertas
    ├── planning/
    │   ├── queries.ts                              # ALTERADO: part e porcentagens das partes
    │   └── components/part-picker.tsx              # NOVO: seletor de parte (radio segmentado)
    └── control/
        ├── schemas.ts, actions.ts, queries.ts      # ALTERADO: part; limites por parte
        └── components/
            ├── actual-expense-form.tsx             # ALTERADO: campo Parte
            ├── actual-expense-list.tsx             # ALTERADO: mostra a parte
            ├── control-dashboard.tsx               # ALTERADO: parte ativa + filtros
            ├── part-usage-bar.tsx                  # NOVO: barra segmentada + legenda
            ├── spending-summary.tsx                # ALTERADO: limite no lugar de planejado
            └── spending-chart.tsx                  # ALTERADO: até 3 séries e 3 limites

tests/
├── unit/
│   ├── lib/present-parts.test.ts, part-labels.test.ts           # NOVOS
│   ├── lib/spending.test.ts, control-labels.test.ts             # ALTERADOS
│   ├── schemas/{expenses,control,allocation}.schemas.test.ts    # ALTERADOS
│   ├── components/{present-split-slider,part-usage-bar,part-picker,part-budget-list}.test.tsx  # NOVOS
│   ├── components/{expense-form,actual-expense-form,planning-lists,actual-expense-list,
│   │               control-dashboard,spending-chart,spending-summary,allocation-slider}.test.tsx  # ALTERADOS
│   ├── design/contrast.test.ts                                  # ALTERADO: pares --part-*
│   └── specs/006-present-moment-parts.spec.test.ts              # NOVO
└── integration/
    ├── allocation.actions.test.ts                               # ALTERADO: reajuste + savePresentSplit
    ├── expenses.actions.test.ts, control.actions.test.ts        # ALTERADOS: part
    └── planning.queries.test.ts, control.queries.test.ts        # ALTERADOS
```

**Structure Decision**: a feature mexe em domínios que já existem (`allocation`, `expenses` e
`control`) e não cria um domínio novo. As regras puras ficam em `src/lib/present-parts.ts`. O
`PartPicker` fica em `features/planning/components`, ao lado do `CategorySelect`, porque é usado
nos formulários do Planejamento e do Controle.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
