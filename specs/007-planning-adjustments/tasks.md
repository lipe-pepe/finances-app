---

description: "Task list for feature 007-planning-adjustments"
---

# Tasks: Ajustes do Planejamento e cores das partes

**Input**: Design documents from `/specs/007-planning-adjustments/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md,
contracts/ui.md, quickstart.md

**Tests**: obrigatórios pela constituição (Princípio II): teste unitário para cada comportamento
novo ou alterado, um teste unitário rastreável à spec e o teste de integração da action alterada
(`updateExpense`). Escrever os testes antes e vê-los falhar. O teste de integração só roda com o
Supabase local (Docker); sem ele, registrar isso no corpo do commit e no relatório.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Identificadores em inglês, comentários em português e textos de UI em pt-BR (Princípio I).
- Todo `"use client"` novo leva, na linha seguinte, um comentário em português justificando o uso
  (Princípio III).
- Textos das partes ficam em `src/lib/part-labels.ts` e textos do Planejamento em
  `src/lib/planning-labels.ts`; as partes sempre na ordem de `PRESENT_PARTS`.
- Somente tokens do tema: nada de hex nas classes nem cores da paleta bruta (Princípio VI).
- Nenhuma mudança de banco nem no Controle, além das cores (FR-016).
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]` (primeira linha
  ≤ 72 caracteres), feitos apenas com testes unitários, `npx tsc --noEmit` e lint passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

Nenhuma tarefa de setup: não há dependência nova nem migração.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Acrescentar testes em `tests/unit/lib/part-labels.test.ts` para os textos novos de research R7: `PART_SELECT_LABEL === "Parte"`; `partOptionLabel("education", false)` → `"Educação"`; `partOptionLabel("free", true)` → `"Livre — excedida"`; `partEmptyMessage("education")` → `"Nenhum gasto em Educação."`; `partTotalLabel("essentials")` → `"Total de Gastos Essenciais"`
- [X] T002 Implementar em `src/lib/part-labels.ts` `PART_SELECT_LABEL`, `partOptionLabel`, `partEmptyMessage` e `partTotalLabel` até T001 passar

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Slider da Receita em uma peça só (Priority: P1) 🎯 MVP

**Goal**: na aba Receita, um único slider com o trilho laranja até a divisão e azul depois, com o valor em R$ abaixo de cada rótulo; sem `SplitBar` e sem os dois cartões de valor.

**Independent Test**: Receita de R$ 6.000,00 e 70% → "Momento Presente 70%" / "R$ 4.200,00" e "Momento Futuro 30%" / "R$ 1.800,00", um slider só em duas cores, nenhum cartão abaixo; arrastar até 60% muda tudo junto.

### Tests for User Story 1 ⚠️

- [ ] T003 [P] [US1] Atualizar `tests/unit/components/allocation-slider.test.tsx`: `renderSlider` passa a renderizar `<AllocationSlider revenueCents={revenueCents} />` sem os `PlannedAmount`; com 70% e 600000 → `getByTestId("slider-value-expenses")` tem "R$ 4.200,00" e `slider-value-goals` tem "R$ 1.800,00", e os rótulos "Momento Presente 70%" e "Momento Futuro 30%" continuam; o `[data-slot="slider"]` tem as classes que pintam o range de `bg-present` e o track de `bg-future` (`toHaveClass` com as duas classes de seletor); não existe barra separada (`container.querySelector('[aria-hidden="true"].h-3')` é `null`); ao usar `ArrowRight`, os valores viram "R$ 4.260,00" e "R$ 1.740,00"; remover o teste "com showSectionLabel..."; os testes de salvamento, retry, último commit, login e partes continuam
- [ ] T004 [P] [US1] Criar `tests/unit/components/allocation-section.test.tsx` para `AllocationSection` (mockar `@/features/allocation/actions` e `next/navigation`, dentro do `AllocationProvider` com 70%): mostra o título "Divisão da receita" e um único `slider`; não mostra os textos "Momento Presente: R$" nem "Momento Futuro: R$" (os cartões antigos); `queryAllByTestId(/^planned-/)` vazio
- [ ] T005 [P] [US1] Remover `tests/unit/components/split-bar.test.tsx` e atualizar `tests/unit/components/allocation-slider.test.tsx` no teste de `PlannedAmount` sem `showSectionLabel` (o caso simples "Planejado (70% da receita): R$ 4.200,00" continua testado ali)

### Implementation for User Story 1

- [ ] T006 [US1] Em `src/features/allocation/components/allocation-slider.tsx`: receber a prop `revenueCents: number`; remover o `SplitBar`; acima do `Slider`, uma linha `flex justify-between gap-4` com dois blocos (à esquerda, "Momento Presente X%" com o ponto `bg-present` e, abaixo, o valor `formatBrl(calculatePlannedCents(revenueCents, essentialPercentage))` com `data-testid="slider-value-expenses"`; à direita, alinhado à direita, "Momento Futuro Y%" com o ponto `bg-future` e o valor com `data-testid="slider-value-goals"`); `Slider` com `className="[&_[data-slot=slider-range]]:bg-present [&_[data-slot=slider-track]]:bg-future"`; o status de salvamento fica como está; até T003 passar
- [ ] T007 [US1] Em `src/features/allocation/components/allocation-section.tsx`, remover a grade com os dois `PlannedAmount showSectionLabel` e passar `revenueCents` ao `AllocationSlider`; atualizar a descrição para mencionar que os valores ficam abaixo dos rótulos se necessário; até T004 passar
- [ ] T008 [US1] Remover `src/features/allocation/components/split-bar.tsx` e a prop `showSectionLabel` de `src/features/allocation/components/planned-amount.tsx` (o ramo "Planejado (X% da receita)" continua); conferir com `grep -rn "SplitBar\|showSectionLabel" src tests` que não sobrou referência; T005 passa

**Checkpoint**: User Story 1 funcional — aba Receita com um slider só, em duas cores, e valores sob os rótulos.

---

## Phase 4: User Story 2 - Novas cores das partes (Priority: P1)

**Goal**: Gastos Essenciais laranja, Educação ciano e Livre roxo, em todas as telas, nos dois temas, com contraste ≥ 3:1.

**Independent Test**: abrir a aba Momento Presente e o Controle nos temas claro e escuro → Gastos Essenciais laranja, Educação ciano e Livre roxo, sempre com o nome; `tests/unit/design` passa.

### Tests for User Story 2 ⚠️

- [ ] T009 [P] [US2] Em `tests/unit/design/tokens.test.ts` (ou num novo `tests/unit/design/part-colors.test.ts`), verificar em `src/app/globals.css`: claro `--part-essentials: #ea580c`, `--part-education: #0891b2` e `--part-free: #9333ea`; escuro `--part-essentials: var(--present)`, `--part-education: #22d3ee` e `--part-free: #c084fc`; os pares `part-*` × `background`/`card` em `tests/unit/design/contrast.test.ts` continuam (o teste de contraste resolve `var(--present)` no escuro; ajustar o `readTokens` para seguir `var(--x)` de um nível, se ainda não seguir)

### Implementation for User Story 2

- [ ] T010 [US2] Trocar em `src/app/globals.css` os valores de `--part-essentials`, `--part-education` e `--part-free` nos blocos claro e escuro conforme data-model.md "Tokens de cor", atualizando o comentário ("laranja do Momento Presente, ciano e roxo; feature 007"); rodar `npm run test:unit -- tests/unit/design` e `tests/unit/specs/006-present-moment-parts.spec.test.ts` (que verifica o contraste das partes; se o leitor de token desse teste não seguir `var(--present)`, ajustá-lo para resolver a referência); até T009 passar
- [ ] T011 [US2] Conferir com `grep -rn "part-essentials\|part-education\|part-free" src` que todos os usos são tokens (`bg-part-*`, `border-part-*`, `var(--part-*)`), sem cores escritas à mão, e que nenhum texto ou comentário fala em "tons de laranja" para as três partes (atualizar comentários em `src/features/control/components/spending-chart.tsx` e `src/app/globals.css`)

**Checkpoint**: User Story 2 funcional — novas cores em todas as telas.

---

## Phase 5: User Story 3 - Ver o Momento Presente uma parte por vez (Priority: P1)

**Goal**: seletor de parte (padrão Gastos Essenciais) na aba Momento Presente mostra só o resumo, a barra, o alerta, a lista e o total da parte; "— excedida" no seletor; os formulários de adicionar e editar sem o campo "Parte"; criar usa a parte selecionada; editar nunca muda a parte.

**Independent Test**: com gastos nas três partes, abrir a aba (só Gastos Essenciais), trocar para Educação (só Educação), adicionar "Curso" sem escolher a parte (entra em Educação), editar "Curso" (continua em Educação).

### Tests for User Story 3 ⚠️

- [ ] T012 [P] [US3] Atualizar `tests/integration/expenses.actions.test.ts`: `updateExpense(id, { name, amount, categoryId, part: "free" } as never)` num gasto criado em `education` → `ok` e o `part` gravado continua `"education"` (FR-012); `updateExpense(id, { name, amount, categoryId })` sem `part` → `ok`; `createExpense` com `part: "free"` continua gravando `free`; ajustar o teste de troca de parte da feature 006 (a troca na edição deixa de existir)
- [ ] T013 [P] [US3] Atualizar `tests/unit/schemas/expenses.schemas.test.ts`: `expenseUpdateSchema.parse({ name, amount, categoryId, part: "free" })` não contém `part`; `expenseUpdateSchema` aceita sem `part`; `expenseSchema` continua exigindo `part`
- [ ] T014 [P] [US3] Atualizar `tests/unit/components/expense-form.test.tsx`: não existe `group` "Parte" nem `radio` em `mode="create"` nem em `mode="edit"`; com `part="education"`, criar chama `createExpense` com `{ name, amount, categoryId, part: "education" }`; editar chama `updateExpense("e1", { name, amount, categoryId })` sem `part`; remover os testes da feature 006 que usavam o `PartPicker` no formulário do Planejamento
- [ ] T015 [P] [US3] Atualizar `tests/unit/components/part-budget-list.test.tsx` para o novo `PartBudget` (uma parte): com `part="education"` e planejado 40000 → "Planejado R$ 400,00 de R$ 500,00" e sem alerta; com 60000 → alerta "Educação excede o valor da parte em R$ 100,00"; renderiza só a parte recebida (nenhum texto de "Gastos Essenciais" ou "Livre")
- [ ] T016 [P] [US3] Criar `tests/unit/components/present-part-panel.test.tsx` para `PresentPartPanel` (dentro do `AllocationProvider` 70/5/5, receita 1_000_000; `panels` = três `<div data-testid="panel-<part>">`; mockar `@/features/expenses/actions` e `next/navigation`): o `combobox` "Parte" começa em "Gastos Essenciais" e só `panel-essentials` aparece; escolher "Educação" → só `panel-education` aparece e o `PartBudget` mostra os valores de Educação; com `plannedCentsByPart.free = 60000`, a opção e o valor exibido de Livre trazem "Livre — excedida" e a de Educação não; o formulário de adicionar não tem campo "Parte" e, com Educação selecionada, envia `part: "education"` ao `createExpense`; trocar de parte depois de digitar o nome mantém o texto digitado; o gatilho tem `min-h-11`
- [ ] T017 [P] [US3] Atualizar `tests/unit/components/planning-lists.test.tsx`: `ExpenseList` com `emptyMessage="Nenhum gasto em Educação."` e lista vazia mostra essa mensagem; sem `emptyMessage`, continua "Nenhum gasto cadastrado."

### Implementation for User Story 3

- [ ] T018 [US3] Em `src/features/expenses/schemas.ts`, acrescentar `expenseUpdateSchema = expenseSchema.omit({ part: true })` e o tipo `ExpenseUpdateInput`; em `src/features/expenses/actions.ts`, `updateExpense(id, input: ExpenseUpdateInput)` valida com `expenseUpdateSchema` e **não** escreve `part` no `updateMany` (comentário em português citando a FR-012 da feature 007); até T012 e T013 passarem
- [ ] T019 [US3] Em `src/features/expenses/components/expense-form.tsx`: remover o `PartPicker` e `part` dos valores do formulário (`ExpenseUpdateInput` como tipo do RHF, resolver `expenseUpdateSchema`); `mode="create"` passa a exigir a prop `part: PresentPart` e envia `createExpense({ ...values, part: props.part })`; `mode="edit"` envia `updateExpense(id, values)`; até T014 passar
- [ ] T020 [US3] Em `src/features/expenses/components/expense-list.tsx`, aceitar a prop opcional `emptyMessage?: string` (padrão "Nenhum gasto cadastrado."); até T017 passar
- [ ] T021 [US3] Transformar `src/features/expenses/components/part-budget-list.tsx` em `PartBudget` (renomear o arquivo para `part-budget.tsx`), com as props `part`, `revenueCents` e `plannedCents`: nome com o ponto de cor, `partPlannedLabel`, `UsageBar` no tom da parte (ou `danger`) e o `Alert` com `partExcessMessage` quando excedida; renomear o teste para `tests/unit/components/part-budget.test.tsx`; até T015 passar
- [ ] T022 [US3] Criar `src/features/expenses/components/present-part-panel.tsx` (Client, justificar: "guarda a parte selecionada e mostra só os dados dela; valores e alertas acompanham as porcentagens em tempo real") conforme contracts/ui.md e research R4/R5: `useState<PresentPart>("essentials")`; `Select` de `src/components/ui/select.tsx` com `Label` "Parte" (`PART_SELECT_LABEL`), gatilho `min-h-11 w-full sm:w-64`, itens com o ponto `PART_DOT_CLASSES[part]` e `partOptionLabel(part, isOverBudget(plannedCentsByPart[part], getPartCents(revenueCents, parts)[part]))`; depois, `PartBudget` da parte, o card com `ExpenseForm mode="create" part={selectedPart} categories={categories}` e `panels[selectedPart]`; até T016 passar
- [ ] T023 [US3] Em `src/features/expenses/components/expense-section.tsx`: remover a `PartBudgetList`, o `ExpenseForm` em linha, a `ExpenseList` e o `SectionTotal` do Momento Presente inteiro; manter o título, o `PlannedAmount`, o card do `PresentSplitSlider` e o `OverBudgetAlert` do Momento Presente; montar `panels` com, para cada parte de `PRESENT_PARTS`, `<ExpenseList expenses={expenses.filter((e) => e.part === part)} categories={categories} emptyMessage={partEmptyMessage(part)} />` + `<SectionTotal label={partTotalLabel(part)} totalCents={expensesTotalCentsByPart[part]} />`; renderizar `<PresentPartPanel panels={panels} categories={categories} revenueCents={revenueCents} plannedCentsByPart={expensesTotalCentsByPart} />`; conferir `src/app/planning/page.tsx` (a prop `expensesTotalCents` continua indo para o cartão da aba)

**Checkpoint**: todas as histórias funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T024 [P] Escrever `tests/unit/specs/007-planning-adjustments.spec.test.ts` rastreável à spec (cenários citando FR/US): tokens das partes com os valores de data-model.md e contraste ≥ 3:1 nos dois temas (FR-005, FR-007, SC-002); `partOptionLabel` com "— excedida" (FR-013); `partEmptyMessage` (FR-015); `expenseUpdateSchema` descarta `part` (FR-012)
- [ ] T025 [P] Atualizar `README.md`: o slider da Receita em duas cores com os valores sob os rótulos; as cores das partes (laranja, ciano e roxo); a aba Momento Presente com seletor de parte e a parte fixa desde a criação
- [ ] T026 Auditoria final: `grep -rn "PartBudgetList\|SplitBar\|showSectionLabel" src tests` vazio; todo `"use client"` com justificativa; `npm run test:unit`, `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros
- [ ] T027 Rodar `npm run test:integration` se houver Supabase local; caso contrário, registrar no relatório e no commit que o teste de T012 não foi executado
- [ ] T028 (Usuário) Validar à mão os passos 1–10 de `specs/007-planning-adjustments/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T002 depende de T001. Bloqueia a US3, que usa os textos novos.
- **US1 (Phase 3)**: independe de Foundational e das outras histórias.
- **US2 (Phase 4)**: independe das outras histórias.
- **US3 (Phase 5)**: depende de T002.
- **Polish (Phase 6)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- US1: T006 antes de T007 (o `AllocationSlider` passa a exigir `revenueCents`); T008 depois de T006 e T007.
- US3: T018 antes de T019 (o tipo do formulário usa `ExpenseUpdateInput`); T019, T020 e T021 antes de T022; T022 antes de T023.

### Parallel Opportunities

- US1, US2 e o Foundational podem andar em paralelo (arquivos diferentes).
- US1: T003, T004 e T005 em paralelo.
- US3: T012–T017 em paralelo; T020 e T021 em paralelo.
- Polish: T024 e T025 em paralelo.

---

## Parallel Example: User Story 3

```bash
Task: "Integração de updateExpense em tests/integration/expenses.actions.test.ts"
Task: "Schemas em tests/unit/schemas/expenses.schemas.test.ts"
Task: "Formulário em tests/unit/components/expense-form.test.tsx"
Task: "PartBudget em tests/unit/components/part-budget-list.test.tsx"
Task: "Painel em tests/unit/components/present-part-panel.test.tsx"
Task: "Lista em tests/unit/components/planning-lists.test.tsx"
```

---

## Implementation Strategy

### MVP First

1. US1 (slider da Receita) e US2 (cores), que são pequenas e independentes
2. **PARAR e VALIDAR**: passos 1–3 e 9 do quickstart

### Incremental Delivery

1. US1 → aba Receita
2. US2 → cores
3. Foundational + US3 → Momento Presente uma parte por vez
4. Polish → teste da spec, README, auditoria e build

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências pendentes.
- Sem migração: a feature não exige `npm run db:deploy`. As migrações das features 005 e 006
  continuam pendentes no banco remoto até o usuário aplicá-las.
