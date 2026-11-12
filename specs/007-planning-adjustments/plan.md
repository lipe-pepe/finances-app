# Implementation Plan: Ajustes do Planejamento e cores das partes

**Branch**: `007-planning-adjustments` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-planning-adjustments/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Três ajustes de interface, sem mudanças em dados ou regras:

1. **Slider da Receita:** a divisão Presente/Futuro passa a ser um slider só, com o trilho laranja
   até a divisão e azul depois dela. Os valores em R$ ficam abaixo dos rótulos de cada lado. A
   barra colorida separada (`SplitBar`) e os dois cartões de valor saem da aba.
2. **Cores das partes:** Gastos Essenciais em laranja, Educação em ciano e Livre em roxo. A troca é
   feita só nos tokens `--part-*` do tema, então todas as telas mudam juntas.
3. **Momento Presente uma parte por vez:** um seletor de parte (padrão Gastos Essenciais) mostra só
   o resumo, o alerta, a lista e o total da parte escolhida. Os formulários de adicionar e editar do
   Planejamento perdem o campo "Parte": criar usa a parte selecionada, e editar nunca muda a parte.

Abordagem: a `ExpenseSection` continua um Server Component. Ela renderiza no servidor a lista e o
total de cada parte e entrega esses blocos a um Client Component (`PresentPartPanel`), que só
controla qual parte aparece, no mesmo padrão do `PlanningTabs`. A `updateExpense` deixa de ler e de
gravar `part`. Detalhes em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: as atuais (Next.js 16.4, React 19.3, React Hook Form + Zod, shadcn/ui
`slider` e `select`); nenhuma dependência nova

**Storage**: N/A (sem migração; o banco não muda)

**Testing**: Vitest + Testing Library (unitários) e teste de integração de `updateExpense`
(ignora `part`)

**Target Platform**: navegadores modernos, desktop e celular, temas claro e escuro

**Project Type**: aplicação web Next.js (mesmo projeto)

**Performance Goals**: trocar de parte sem ida ao servidor (SC-004)

**Constraints**: tokens do tema; contraste ≥ 3:1 para as cores das partes (FR-007); 360 px sem
rolagem horizontal e alvos ≥ 44 px (FR-017)

**Scale/Scope**: ~4 componentes alterados no Planejamento, 1 componente novo (`PresentPartPanel`),
`SplitBar` removido, 3 tokens alterados, 1 action alterada (`updateExpense`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Componente `PresentPartPanel`, schema `expenseUpdateSchema`, textos em pt-BR em `part-labels.ts` | ✅ Pass |
| II. Testes (não negociável) | Unitários: `AllocationSlider` (trilho em duas cores e valores sob os rótulos), `AllocationSection` (sem cartões), `PresentPartPanel` (seletor, padrão, filtro, "— excedida", formulário na parte selecionada), `ExpenseForm` sem o campo "Parte", tokens e contraste das partes, `part-labels`; teste da spec `tests/unit/specs/007-planning-adjustments.spec.test.ts`. Integração: `updateExpense` não altera `part`; `createExpense` grava a parte recebida | ✅ Pass |
| III. SSR primeiro | Listas e totais por parte renderizados no servidor; `PresentPartPanel` (Client) só controla qual parte aparece e o seletor, justificado | ✅ Pass |
| IV. React Hook Form | `ExpenseForm` continua em RHF; a parte vem por prop e entra no envio; `expenseUpdateSchema` repetido no servidor | ✅ Pass |
| V. Supabase, Prisma e Auth | Sem mudança de schema; `updateExpense` continua filtrando por `userId` e passa a não escrever `part` | ✅ Pass |
| VI. Design system e acessibilidade | Cores das partes só por tokens; ciano e roxo não têm significado fixo; Gastos Essenciais no laranja do Momento Presente; contraste ≥ 3:1 testado; o nome da parte sempre acompanha a cor; o seletor é acessível por teclado | ✅ Pass |
| Commits | `tipo(escopo): descrição [T###]` | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass. A única divergência visual registrada (research R3) é que
o laranja de Gastos Essenciais no tema claro é `#ea580c`, um tom quase idêntico ao `--present`
(`#ee6a10`). O `--present` dá 2,997:1 contra o fundo, um pouco abaixo dos 3:1 do Princípio VI.

## Project Structure

### Documentation (this feature)

```text
specs/007-planning-adjustments/
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
src/
├── app/
│   ├── globals.css                                   # ALTERADO: --part-essentials/education/free
│   └── planning/page.tsx                             # ALTERADO: passa os dados por parte à seção
├── lib/part-labels.ts                                # ALTERADO: textos do seletor, vazio e total
└── features/
    ├── allocation/components/
    │   ├── allocation-slider.tsx                     # ALTERADO: trilho em duas cores, valores
    │   │                                             #   abaixo dos rótulos, sem SplitBar
    │   ├── allocation-section.tsx                    # ALTERADO: sem os dois cartões
    │   ├── planned-amount.tsx                        # ALTERADO: remove showSectionLabel (sem uso)
    │   └── split-bar.tsx                             # REMOVIDO
    └── expenses/
        ├── schemas.ts                                # ALTERADO: expenseUpdateSchema (sem part)
        ├── actions.ts                                # ALTERADO: updateExpense não grava part
        └── components/
            ├── expense-section.tsx                   # ALTERADO: blocos por parte → painel
            ├── present-part-panel.tsx                # NOVO (Client): seletor + parte exibida
            ├── part-budget-list.tsx                  # ALTERADO → PartBudget (uma parte)
            ├── expense-form.tsx                      # ALTERADO: sem PartPicker; prop part (criar)
            └── expense-list.tsx                      # ALTERADO: mensagem de vazio por parte

tests/
├── unit/
│   ├── components/{allocation-slider,expense-form,part-budget-list}.test.tsx  # ALTERADOS
│   ├── components/present-part-panel.test.tsx                               # NOVO
│   ├── components/allocation-section.test.tsx                               # NOVO
│   ├── components/split-bar.test.tsx                                        # REMOVIDO
│   ├── lib/part-labels.test.ts                                              # ALTERADO
│   └── specs/007-planning-adjustments.spec.test.ts                          # NOVO
└── integration/expenses.actions.test.ts                                     # ALTERADO
```

**Structure Decision**: as mudanças ficam nos domínios `allocation` e `expenses`, sem domínio
novo. O `PartPicker` continua existindo, mas passa a ser usado só nos formulários do Controle.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
