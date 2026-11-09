---

description: "Task list for feature 002-planning-tabs"
---

# Tasks: Momento Presente, Momento Futuro e navegação por abas

**Input**: Design documents from `/specs/002-planning-tabs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: OBRIGATÓRIOS pela constituição (Princípio II): teste unitário para cada funcionalidade
nova e teste unitário rastreável à spec. Não há endpoints novos ou alterados, portanto não há
testes de integração novos (os da feature 001 continuam válidos). Escrever os testes antes e
vê-los falhar.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Identificadores e valores de endereço em inglês; comentários em português; textos de UI em
  pt-BR (Princípio I).
- Todo `"use client"` novo com comentário em português justificando (Princípio III).
- Textos das seções vêm sempre de `src/lib/planning-labels.ts` (nunca escritos à mão nos
  componentes).
- Os domínios `expenses` e `goals` NÃO são renomeados (tabelas, pastas, actions, tipos); os itens
  continuam "gasto" e "meta" (FR-011a).
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]`, na branch
  `002-planning-tabs`, somente com testes unitários, `tsc` e lint passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Adicionar o componente de abas do shadcn/ui com `npx shadcn@4.23.0 add tabs -y`, gerando `src/components/ui/tabs.tsx`; incluir, na linha seguinte ao `"use client"`, o comentário "// Client Component: primitivo do Radix UI (shadcn/ui) que depende de estado, foco e eventos do navegador." (padrão dos demais componentes de `src/components/ui`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Escrever testes unitários em `tests/unit/lib/planning-tab.test.ts` para `parsePlanningTab(value: string | string[] | undefined)`: `undefined` → `"income"`; `""` → `"income"`; `"income"`, `"present"`, `"future"` → o próprio valor; `"xyz"`, `"Present"` (maiúscula) e array `["present","future"]` → `"income"`; e para `buildPlanningTabUrl(tab)`: `"income"` → `"/"`, `"present"` → `"/?tab=present"`, `"future"` → `"/?tab=future"`; e `PLANNING_TABS` na ordem `["income","present","future"]`
- [ ] T003 [P] Implementar `src/lib/planning-tab.ts` (função pura, sem dependências de React/Next): tipo `PlanningTab = "income" | "present" | "future"`, `PLANNING_TABS`, `DEFAULT_PLANNING_TAB = "income"`, `PLANNING_TAB_PARAM = "tab"`, `parsePlanningTab` e `buildPlanningTabUrl` até T002 passar
- [ ] T004 [P] Escrever testes unitários em `tests/unit/lib/planning-labels.test.ts`: `SECTION_LABELS` = `{ expenses: "Momento Presente", goals: "Momento Futuro" }`; `SECTION_TOTAL_LABELS` = `{ expenses: "Total do Momento Presente", goals: "Total do Momento Futuro" }`; `overBudgetMessage("expenses", 10000)` = `"O Momento Presente excede o planejado em R$ 100,00"` e `overBudgetMessage("goals", 1)` = `"O Momento Futuro excede o planejado em R$ 0,01"`; `TAB_LABELS` = `{ income: "Receita", present: "Momento Presente", future: "Momento Futuro" }`; `TAB_ALERT_SR_TEXT` = `", com alerta"`; e que nenhum valor exportado contém "Gastos essenciais" ou "Metas futuras" (sem diferenciar maiúsculas)
- [ ] T005 [P] Implementar `src/lib/planning-labels.ts` com as constantes e a função de T004 (usando `formatBrl` de `src/lib/money.ts` e o tipo `PlanningSection` de `src/lib/planning.ts`) até T004 passar
- [ ] T006 Extrair a regra de alerta para o hook `useOverBudget(section, revenueCents, totalCents)` em `src/features/planning/hooks/use-over-budget.ts` (lê `essentialPercentage` de `useAllocation()`; retorna `{ isOver: boolean, plannedCents: number, excessCents: number }` usando `calculatePlannedCents`, `getSectionPercentage`, `isOverBudget` e `getExcessCents`) e refatorar `src/features/planning/components/over-budget-alert.tsx` para usá-lo, sem mudar textos nem comportamento; `tests/unit/components/over-budget-alert.test.tsx` deve continuar passando sem alterações

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Navegar pelo planejamento em abas (Priority: P1) 🎯 MVP

**Goal**: tela organizada em três abas (Receita, Momento Presente, Momento Futuro), com a aba no endereço e mantida após mutações.

**Independent Test**: logado, ver as três abas com "Receita" selecionada; abrir cada aba e conferir o conteúdo; abrir "Momento Futuro", recarregar e continuar nela; cadastrar um gasto em "Momento Presente" e continuar na aba.

### Tests for User Story 1 ⚠️

- [ ] T007 [US1] Escrever testes unitários em `tests/unit/components/planning-tabs.test.tsx` renderizando `PlanningTabs` dentro de `AllocationProvider` (com `saveAllocation` e `next/navigation` mockados como em `allocation-slider.test.tsx`) e conteúdos de teste simples (`<p>conteúdo receita</p>` etc.): (a) `getAllByRole("tab")` na ordem "Receita", "Momento Presente", "Momento Futuro"; (b) com `initialTab="income"`, só "conteúdo receita" visível; (c) com `initialTab="future"`, a aba "Momento Futuro" tem `aria-selected="true"` e só o conteúdo dela aparece; (d) clicar em "Momento Presente" mostra o conteúdo dela e chama `window.history.replaceState(null, "", "/?tab=present")` (espiar com `vi.spyOn(window.history, "replaceState")`); clicar em "Receita" chama com `"/"`; `pushState` nunca é chamado; (e) com foco na aba "Receita", `ArrowRight` seleciona "Momento Presente" (usar `userEvent.keyboard`); (f) após clicar em "Momento Futuro", chamar `rerender` com o mesmo `PlanningTabs` mas conteúdos novos (`<p>futuro atualizado</p>`) e `initialTab="income"` (simula a re-renderização do servidor após uma Server Action) → "Momento Futuro" continua com `aria-selected="true"` e mostra "futuro atualizado" (FR-007, SC-004)

### Implementation for User Story 1

- [ ] T008 [US1] Criar `src/features/planning/components/planning-tabs.tsx` (`"use client"` com comentário: interação de abas e atualização do endereço no navegador) usando `Tabs`, `TabsList`, `TabsTrigger` e `TabsContent` de `src/components/ui/tabs.tsx` em modo controlado: props `{ initialTab: PlanningTab; revenueCents: number; expensesTotalCents: number; goalsTotalCents: number; income: ReactNode; present: ReactNode; future: ReactNode }`; estado `useState(initialTab)`; `onValueChange` valida com `parsePlanningTab`, atualiza o estado e chama `window.history.replaceState(null, "", buildPlanningTabUrl(tab))`; rótulos de `TAB_LABELS`; `TabsList` com largura total e gatilhos com `flex-1` para caber em telas estreitas sem rolagem horizontal; até T007 passar
- [ ] T009 [US1] Atualizar `src/app/page.tsx`: aceitar `{ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }`, calcular `initialTab = parsePlanningTab((await searchParams)[PLANNING_TAB_PARAM])` e, dentro do `AllocationProvider` e de `<main>` (remover o grid de duas colunas), renderizar `PlanningTabs` com `income={<><IncomeSection …/><AllocationSection …/></>}`, `present={<ExpenseSection …/>}`, `future={<GoalSection …/>}` e os totais de `data`; o `AppHeader` continua fora das abas

**Checkpoint**: User Story 1 funcional — abas, endereço e permanência na aba após mutações.

---

## Phase 4: User Story 2 - Novos nomes das seções (Priority: P1)

**Goal**: "Gastos essenciais" → "Momento Presente" e "Metas futuras" → "Momento Futuro" em toda a interface; itens continuam "gasto" e "meta".

**Independent Test**: percorrer as três abas e o slider e não encontrar "Gastos essenciais" nem "Metas futuras"; o slider mostra "Momento Presente X%" e "Momento Futuro Y%".

### Tests for User Story 2 ⚠️

- [ ] T010 [P] [US2] Atualizar `tests/unit/components/allocation-slider.test.tsx` para os novos rótulos: "Momento Presente 70%", "Momento Futuro 30%", "Momento Presente 71%" (substituir todas as ocorrências de "Gastos essenciais"/"Metas futuras"), e adicionar asserção de que o slider tem o nome acessível "Divisão entre Momento Presente e Momento Futuro"; e um caso com `PlannedAmount` usando `showSectionLabel`: receita 600000 e 70% → "Momento Presente: R$ 4.200,00 (70% da receita)" e "Momento Futuro: R$ 1.800,00 (30% da receita)"; sem a prop, o texto continua "Planejado (70% da receita): R$ 4.200,00"
- [ ] T011 [P] [US2] Atualizar `tests/unit/components/over-budget-alert.test.tsx` para os novos textos: "O Momento Presente excede o planejado em R$ 100,00", "O Momento Futuro excede o planejado em R$ 0,01" e "O Momento Futuro excede o planejado em R$ 100,00", mantendo "Planejamento incorreto" como título

### Implementation for User Story 2

- [ ] T012 [P] [US2] Atualizar `src/features/allocation/components/allocation-slider.tsx`: rótulos `${SECTION_LABELS.expenses} ${essentialPercentage}%` e `${SECTION_LABELS.goals} ${goalsPercentage}%` e `aria-label` "Divisão entre Momento Presente e Momento Futuro" (de `planning-labels`), até T010 passar
- [ ] T013 [P] [US2] Adicionar a prop opcional `showSectionLabel?: boolean` em `src/features/allocation/components/planned-amount.tsx`: quando verdadeira, exibe "`SECTION_LABELS[section]`: R$ X (Y% da receita)"; quando ausente, mantém "Planejado (Y% da receita): R$ X" (usado dentro das seções, onde o título já diz o momento); até o caso novo da T010 passar
- [ ] T014 [P] [US2] Atualizar `src/features/planning/components/over-budget-alert.tsx` para usar `overBudgetMessage(section, excessCents)` de `planning-labels` (remover o mapa `SECTION_SUBJECT`), até T011 passar
- [ ] T015 [P] [US2] Atualizar `src/features/allocation/components/allocation-section.tsx`: descrição "Arraste para definir quanto da receita vai para o Momento Presente e para o Momento Futuro. A divisão é salva automaticamente." e comentário do componente com os novos nomes, e passar `showSectionLabel` aos dois `PlannedAmount`
- [ ] T016 [P] [US2] Atualizar `src/features/expenses/components/expense-section.tsx` (título `SECTION_LABELS.expenses`, total `SECTION_TOTAL_LABELS.expenses`, comentário) e `src/features/expenses/components/expense-list.tsx` (comentário), mantendo os textos dos itens ("Nome do gasto", "Adicionar gasto", "Nenhum gasto cadastrado")
- [ ] T017 [P] [US2] Atualizar `src/features/goals/components/goal-section.tsx` (título `SECTION_LABELS.goals`, total `SECTION_TOTAL_LABELS.goals`, comentário) e `src/features/goals/components/goal-list.tsx` (comentário), mantendo os textos dos itens ("Nome da meta", "Adicionar meta", "Nenhuma meta cadastrada")
- [ ] T018 [P] [US2] Atualizar a descrição em `src/app/layout.tsx` para "Planejamento financeiro pessoal: receita, Momento Presente e Momento Futuro." e os comentários de `src/lib/planning.ts` e `src/features/allocation/schemas.ts` que citam "gastos essenciais"/"metas futuras"

**Checkpoint**: User Stories 1 e 2 funcionando; nenhum texto antigo na interface.

---

## Phase 5: User Story 3 - Saber que há alerta em outra aba (Priority: P2)

**Goal**: indicador de alerta no nome da aba da seção que excede o planejado, visível de qualquer aba, reagindo em tempo real e com texto acessível.

**Independent Test**: com a aba "Receita" selecionada, mover o slider até o Momento Presente exceder o planejado → ícone na aba "Momento Presente"; voltar o slider → ícone some.

### Tests for User Story 3 ⚠️

- [ ] T019 [P] [US3] Escrever testes unitários em `tests/unit/components/tab-alert-indicator.test.tsx` (dentro de `AllocationProvider` + `AllocationSlider`, mocks como em `over-budget-alert.test.tsx`): receita 400000, 50%, total 210000 → renderiza texto acessível ", com alerta" e um ícone com `aria-hidden="true"`; total 200000 → nada renderizado; mover o slider com `ArrowRight` até 55% (total 210000 → planejado 220000) faz sumir e `ArrowLeft` de volta faz aparecer; `section="goals"` usa 100 − porcentagem
- [ ] T020 [US3] Adicionar a `tests/unit/components/planning-tabs.test.tsx` um caso em que `expensesTotalCents` excede o planejado: a aba tem nome acessível "Momento Presente, com alerta" (`getByRole("tab", { name: "Momento Presente, com alerta" })`) mesmo com a aba "Receita" selecionada, e a aba "Momento Futuro" não tem indicador; e um caso com soma igual ao planejado sem indicador

### Implementation for User Story 3

- [ ] T021 [US3] Criar `src/features/planning/components/tab-alert-indicator.tsx` (`"use client"` com comentário: depende da porcentagem do slider em tempo real) com props `{ section: PlanningSection; revenueCents: number; totalCents: number }`, usando `useOverBudget`; quando `isOver`, renderiza `<TriangleAlert aria-hidden="true" className="size-4 text-destructive" />` e `<span className="sr-only">{TAB_ALERT_SR_TEXT}</span>`; caso contrário `null`; até T019 passar
- [ ] T022 [US3] Incluir `TabAlertIndicator` nos gatilhos "Momento Presente" (`section="expenses"`, `totalCents={expensesTotalCents}`) e "Momento Futuro" (`section="goals"`, `totalCents={goalsTotalCents}`) em `src/features/planning/components/planning-tabs.tsx`, após o rótulo, até T020 passar

**Checkpoint**: todas as histórias funcionando de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T023 Escrever o teste unitário rastreável à spec em `tests/unit/specs/002-planning-tabs.spec.test.ts` (Princípio II), com um `describe` por cenário: US1 (ordem das abas em `PLANNING_TABS`/`TAB_LABELS`; aba padrão "Receita"; `/?tab=future` → Momento Futuro; valor inválido → Receita; endereço da aba Receita é `/`), US2 (rótulos do slider "Momento Presente 70%"/"Momento Futuro 30%" a partir de `SECTION_LABELS` e `getGoalsPercentage(70)`; totais; mensagens de alerta com R$ 100,00) e US3 (receita R$ 4.000,00, 50%, Momento Presente R$ 2.100,00 → alerta; R$ 2.000,00 → sem alerta; 55% → sem alerta), usando `src/lib/planning-tab.ts`, `src/lib/planning-labels.ts`, `src/lib/planning.ts` e `src/lib/money.ts`
- [ ] T024 [P] Auditar `src/`: `grep -rni "gastos essenciais\|metas futuras" src --exclude-dir=generated` sem resultados em textos de interface; todo `"use client"` com comentário de justificativa; nenhum identificador novo em português
- [ ] T025 [P] Atualizar a descrição do produto no `README.md` para os novos nomes ("divide a receita entre **Momento Presente** e **Momento Futuro**, organizados em abas")
- [ ] T026 Rodar `npm run test:unit`, `npx tsc --noEmit`, `npm run lint` e `npx next build` (com variáveis fictícias) e garantir sucesso
- [ ] T027 Executar a validação manual de `specs/002-planning-tabs/quickstart.md` (passos 1–8) e registrar o resultado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup (T006 independe de T001) e BLOQUEIA as histórias.
- **US1 (Phase 3)**: depende de T001, T003 e T005.
- **US2 (Phase 4)**: depende de T005 e T006; independente da US1.
- **US3 (Phase 5)**: depende de T006 e da US1 (o indicador entra em `planning-tabs.tsx`).
- **Polish (Phase 6)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- `src/features/planning/components/planning-tabs.tsx` é editado por T008 e T022; o teste
  `planning-tabs.test.tsx` por T007 e T020 — essas tarefas são sequenciais.
- `over-budget-alert.tsx` é editado por T006 e T014 — sequenciais.

### Parallel Opportunities

- Foundational: T002/T003 e T004/T005 em paralelo entre si.
- US2: T010–T018 em paralelo (arquivos diferentes; T014 após T006).
- US1 e US2 podem ser feitas em paralelo após a Foundational.
- T019 (teste do indicador) pode ser escrito em paralelo com a US1.

---

## Parallel Example: User Story 2

```bash
Task: "Atualizar testes do slider em tests/unit/components/allocation-slider.test.tsx"
Task: "Atualizar testes do alerta em tests/unit/components/over-budget-alert.test.tsx"
Task: "Atualizar src/features/expenses/components/expense-section.tsx"
Task: "Atualizar src/features/goals/components/goal-section.tsx"
Task: "Atualizar src/features/allocation/components/allocation-section.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)

1. Phase 1 + Phase 2
2. US1 (abas) e US2 (nomes) — juntas entregam o pedido principal
3. **PARAR e VALIDAR**: passos 1–6 do quickstart

### Incremental Delivery

1. Setup + Foundational
2. US1 → validar abas e endereço
3. US2 → validar nomes
4. US3 → validar indicadores
5. Polish → teste da spec, auditoria, README, build

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- [Story] mapeia a tarefa à história da spec para rastreabilidade
- Nenhuma migração e nenhuma Server Action alterada nesta feature
