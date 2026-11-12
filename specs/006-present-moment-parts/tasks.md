---

description: "Task list for feature 006-present-moment-parts"
---

# Tasks: Divisão do Momento Presente em partes

**Input**: Design documents from `/specs/006-present-moment-parts/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md,
contracts/ui.md, quickstart.md

**Tests**: obrigatórios pela constituição (Princípio II): teste unitário para cada funcionalidade
nova, um teste unitário rastreável à spec e ao menos um teste de integração por Server Action nova
ou alterada (`saveAllocation`, `savePresentSplit`, `createExpense`/`updateExpense`,
`createActualExpense`/`updateActualExpense`) e pelas consultas `getPlanningData` e
`getControlData`. Escrever os testes antes e vê-los falhar. Os testes de integração só rodam com
o Supabase local (Docker); sem ele, registrar isso no corpo do commit e no relatório.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Identificadores em inglês, comentários em português e textos de UI em pt-BR (Princípio I).
  Partes no código: `essentials`, `education` e `free`.
- Todo `"use client"` novo leva, na linha seguinte, um comentário em português justificando o uso
  (Princípio III).
- Nomes e textos das partes vêm de `src/lib/part-labels.ts`; a ordem das partes vem de
  `PRESENT_PARTS` em `src/lib/present-parts.ts`. Nunca escrever "Educação" etc. à mão fora
  desses arquivos e dos testes.
- Dinheiro sempre em centavos (`number` inteiro); porcentagens sempre inteiras da Receita.
- `essential_percentage` / `essentialPercentage` continua sendo a porcentagem do **Momento
  Presente** inteiro (nome legado, não renomear). A porcentagem da parte Gastos Essenciais é
  sempre derivada (`toPartPercentages`).
- Cores das partes somente por token (`bg-part-essentials`, `var(--part-education)` etc.); a
  parte aparece sempre com o nome, nunca só com a cor (Princípio VI).
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]` (primeira linha
  ≤ 72 caracteres), feitos apenas com testes unitários, `npx tsc --noEmit` e lint passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Adicionar o tooltip do shadcn/ui com `npx shadcn@4.23.0 add tooltip -y`, gerando `src/components/ui/tooltip.tsx` (usa o `radix-ui` já instalado); na linha seguinte ao `"use client"`, acrescentar "// Client Component: primitivo do Radix UI (shadcn/ui) que depende de estado, foco e eventos do navegador."; conferir que `npm run test:unit` e `npx tsc --noEmit` continuam passando

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Escrever testes unitários em `tests/unit/lib/present-parts.test.ts` para `src/lib/present-parts.ts`: `PRESENT_PARTS` igual a `["essentials","education","free"]`; `toPartPercentages(70, 5, 5)` → `{ essentials: 60, education: 5, free: 5 }`; `rescaleParts({ essentials: 60, education: 5, free: 5 }, 35)` → `{ essentials: 30, education: 3, free: 2 }`; `rescaleParts(..., 70)` sem mudança; `rescaleParts({ essentials: 0, education: 0, free: 0 }, 40)` → `{ essentials: 40, education: 0, free: 0 }`; `rescaleParts(x, 0)` → tudo 0; a soma do resultado é sempre igual ao novo total (testar de 0 a 100 com 3 divisões diferentes); `splitFromThumbs([60, 65], 70)` → `{ essentials: 60, education: 5, free: 5 }`; `thumbsFromSplit({ essentials: 60, education: 5, free: 5 })` → `[60, 65]`; `getPartCents(1_000_000, { essentials: 60, education: 5, free: 5 })` → `{ essentials: 600000, education: 50000, free: 50000 }`; com Receita `33_333` e `{ 33, 33, 34 }` a soma é igual a `calculatePlannedCents(33_333, 100)` e o resto fica em `free`; `sumByPart([{ part: "education", amountCents: 100 }, ...])`; `buildPartSeries` com gastos em dias e partes diferentes acumula por parte e devolve `null` depois do último dia exibido (mesma regra de `buildCumulativeSeries`); `getPartBarWidths({ essentials: 120000, education: 10000, free: 5000 }, 700000)` → larguras ≈ `17.14`, `1.43` e `0.71`; acima do limite, a soma das larguras dá 100 e a proporção é mantida; com limite 0 e gasto > 0, a proporção é entre os gastos; tudo 0 → `[0, 0, 0]`
- [X] T003 Implementar `src/lib/present-parts.ts` (funções puras, sem React/Next) conforme data-model.md "Regras puras", com o tipo `PresentPart = "essentials" | "education" | "free"`, `PartPercentages` e `PartCents`; `rescaleParts` pelo maior resto, com empate na ordem de `PRESENT_PARTS` (research R2); `getPartCents` com o resto em `free` (research R7); reaproveitar `calculatePlannedCents` e `sumCents` de `src/lib/planning.ts` e `buildCumulativeSeries` de `src/lib/spending.ts`; até T002 passar
- [X] T004 [P] Escrever testes em `tests/unit/lib/part-labels.test.ts` para `src/lib/part-labels.ts` com os textos de contracts/ui.md: `PART_LABELS`; `PART_FIELD_LABEL === "Parte"`; `partPercentLabel("education", 5)` → `"Educação · 5% da Receita"`; `partExcessMessage("education", 10000)` → `"Educação excede o valor da parte em R$ 100,00"`; `partPlannedLabel(40000, 50000)` → `"Planejado R$ 400,00 de R$ 500,00"`; `thumbLabel("essentials","education")` → `"Divisão entre Gastos Essenciais e Educação"`; `PRESENT_ZERO_HINT`; `presentTotalLabel(70, 700000)` → `"70% da Receita · R$ 7.000,00"`; `partSplitValueText({ essentials: 60, education: 5 })` → `"Gastos Essenciais 60%, Educação 5%"`; `partChartSummary({ part: "essentials", spentCents: 120000, limitCents: 600000 })` → `"Gastos Essenciais: gasto acumulado de R$ 1.200,00 de um limite de R$ 6.000,00."` e, com gasto > limite, termina com `" Acima do limite."`; `partToggleLabel("education", 5, 10000)` → `"Educação, 5% da Receita, gasto R$ 100,00"`
- [X] T005 Implementar `src/lib/part-labels.ts` (usando `formatBrl`) até T004 passar
- [X] T006 [P] Adicionar ao `src/app/globals.css` os tokens `--part-essentials`, `--part-education` e `--part-free`, com claro `#7c2d12`, `#c2410c` e `#ea580c` (`#ee6a10` dava 2,997:1 contra o fundo) e escuro `#c2560f`, `#f97316` e `#fdba74` (research R12), mais `--color-part-*` no `@theme inline`; acrescentar `["part-essentials","background"]`, `["part-essentials","card"]`, `["part-education","background"]`, `["part-education","card"]`, `["part-free","background"]` e `["part-free","card"]` aos pares gráficos (3:1) de `tests/unit/design/contrast.test.ts`; ajustar um valor se algum par não passar
- [X] T007 Alterar `prisma/schema.prisma`: `enum PresentPart { essentials education free @@map("present_part") }`; em `Expense` e `ActualExpense`, `part PresentPart @default(essentials)`; em `Allocation`, `educationPercentage Int @default(0) @map("education_percentage") @db.SmallInt` e `freePercentage Int @default(0) @map("free_percentage") @db.SmallInt`; comentários em português (a porcentagem de Gastos Essenciais é derivada; `essentialPercentage` é o Momento Presente); rodar `npx prisma generate`
- [X] T008 Criar `prisma/migrations/20261112000000_present_parts/migration.sql` com `npx prisma migrate diff --from-schema <schema anterior, de git show HEAD:prisma/schema.prisma> --to-schema prisma/schema.prisma --script` e acrescentar à mão, num bloco "SQL manual (Princípio V)", `ALTER TABLE "allocations" ADD CONSTRAINT "allocations_present_parts_check" CHECK ("education_percentage" >= 0 AND "free_percentage" >= 0 AND "education_percentage" + "free_percentage" <= "essential_percentage");`; conferir que o diff gerado usa `DEFAULT 'essentials'` nas colunas `part` (é isso que preenche as linhas existentes, FR-021); `npx prisma validate`. A aplicação no banco remoto é feita pelo usuário (T065)
- [X] T009 [P] Escrever testes em `tests/unit/schemas/present-part.schemas.test.ts` para `presentPartSchema` (em `src/lib/validation.ts`): aceita `"essentials"`, `"education"` e `"free"`; recusa `""`, `"livre"` e `undefined` com "Selecione a parte."
- [X] T010 Acrescentar `presentPartSchema = z.enum(PRESENT_PARTS, { error: "Selecione a parte." })` em `src/lib/validation.ts` até T009 passar
- [X] T011 [P] Escrever testes em `tests/unit/components/part-picker.test.tsx` para `PartPicker` (montado dentro de um formulário RHF de teste): `group`/`fieldset` com nome "Parte"; três `radio` "Gastos Essenciais", "Educação" e "Livre", nessa ordem; o valor padrão `essentials` vem marcado; clicar em "Educação" muda o valor do formulário para `"education"`; as setas do teclado trocam a opção; uma mensagem de erro aparece quando passada; cada opção tem `min-h-11`
- [X] T012 Criar `src/features/planning/components/part-picker.tsx` (Client, justificar: "campo de formulário com estado de seleção e eventos") conforme contracts/ui.md: `fieldset` + `legend` `PART_FIELD_LABEL`; três `input type="radio"` com `{...register}` repassado por prop (`registration: UseFormRegisterReturn`), cada um num `label` segmentado (`min-h-11`, `has-checked:` com borda e fundo `section-soft`) com o ponto `bg-part-*` e o nome; o erro via `FormFieldError`; até T011 passar
- [X] T013 Atualizar `tests/setup/db.ts`: `createExpenseRow` (se existir) e `createActualExpenseRow` aceitam `part?` (padrão `"essentials"`); novo helper `setAllocation(userId, { essentialPercentage, educationPercentage?, freePercentage? })`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Dividir o Momento Presente em três partes (Priority: P1) 🎯 MVP

**Goal**: na aba Momento Presente, um slider com duas divisões ajusta Gastos Essenciais, Educação e Livre (somando o Momento Presente), mostra % e R$ em tempo real e salva ao soltar; o slider da aba Receita reajusta as partes na proporção.

**Independent Test**: Receita de R$ 10.000,00 e Momento Presente em 70% → dividir em 60/5/5 → ver R$ 6.000,00 / R$ 500,00 / R$ 500,00 → recarregar e conferir; mudar o Momento Presente para 35% → 30/3/2.

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Acrescentar a `tests/unit/schemas/allocation.schemas.test.ts` os testes de `presentSplitSchema`: `{ educationPercentage: 5, freePercentage: 5 }` aceito; negativo, decimal e `"5"` recusados com "Porcentagem inválida."
- [X] T015 [P] [US1] Acrescentar a `tests/integration/allocation.actions.test.ts`: `savePresentSplit({ educationPercentage: 5, freePercentage: 5 })` com `setAllocation(A, { essentialPercentage: 70 })` → `{ ok: true, data: { parts: { essentials: 60, education: 5, free: 5 } } }` e a linha gravada; sem linha → cria com `essentialPercentage: 50`; `education + free > presente` (ex.: 40 + 40 com 70) → `VALIDATION` em `freePercentage` com "A soma das partes não pode passar do Momento Presente." e nada gravado; sem sessão → `UNAUTHENTICATED`; `saveAllocation({ essentialPercentage: 35 })` com partes 60/5/5 em 70 → `data.parts = { essentials: 30, education: 3, free: 2 }` e as três colunas gravadas; `saveAllocation` sem linha → partes `{ essentials: N, education: 0, free: 0 }`
- [X] T016 [P] [US1] Acrescentar a `tests/integration/planning.queries.test.ts`: `getPlanningData` devolve `educationPercentage` e `freePercentage` (0 sem linha; os valores gravados com `setAllocation`)
- [X] T017 [P] [US1] Escrever testes em `tests/unit/components/present-split-slider.test.tsx` para `PresentSplitSlider` (dentro de `AllocationProvider` com `initialEssentialPercentage={70}`, `initialEducationPercentage={5}` e `initialFreePercentage={5}`; mockar `savePresentSplit`): mostra "70% da Receita · R$ 7.000,00" com receita 1_000_000; três rótulos com "Gastos Essenciais 60%" / "R$ 6.000,00", "Educação 5%" / "R$ 500,00" e "Livre 5%" / "R$ 500,00"; dois `slider` com nomes "Divisão entre Gastos Essenciais e Educação" e "Divisão entre Educação e Livre", e `aria-valuemax="70"`; `ArrowRight` no primeiro thumb → "Gastos Essenciais 61%" / "Educação 4%" e chama `savePresentSplit({ educationPercentage: 4, freePercentage: 5 })` no commit; com o Momento Presente em 0%, os thumbs ficam desabilitados e aparece `PRESENT_ZERO_HINT`; com o mock retornando erro → "Divisão não salva" e o botão "Tentar novamente"
- [X] T018 [P] [US1] Atualizar `tests/unit/components/allocation-slider.test.tsx`: ao mover o slider da Receita de 70 para 35, as partes do provider viram 30/3/2 (ler por um consumidor de teste de `useAllocation()`); `saveAllocation` continua sendo chamado com `{ essentialPercentage: 35 }`; a resposta com `parts` atualiza o provider

### Implementation for User Story 1

- [X] T019 [US1] Em `src/features/allocation/schemas.ts`, acrescentar `presentSplitSchema` (`educationPercentage` e `freePercentage`: `z.number({ error: "Porcentagem inválida." }).int("Porcentagem inválida.").min(0, "Porcentagem inválida.")`) e o tipo `PresentSplitInput`; até T014 passar
- [X] T020 [US1] Em `src/features/allocation/actions.ts`: `saveAllocation` lê a linha atual (`findUnique`) e calcula `rescaleParts(toPartPercentages(atual.essentialPercentage ?? DEFAULT_ESSENTIAL_PERCENTAGE, atual?.educationPercentage ?? 0, atual?.freePercentage ?? 0), novo)`; faz `upsert` gravando `essentialPercentage`, `educationPercentage` e `freePercentage`; devolve `{ essentialPercentage, parts }`. Nova `savePresentSplit(input)` conforme contracts/server-actions.md (validação, soma ≤ presente, `upsert` criando com 50, retorno `{ parts }`, sem `revalidatePath`); comentários em português citando FR-005/FR-008; até T015 passar (com o Supabase local)
- [X] T021 [US1] Em `src/features/planning/queries.ts`, acrescentar `educationPercentage: allocation?.educationPercentage ?? 0` e `freePercentage: allocation?.freePercentage ?? 0` a `PlanningData`; até T016 passar
- [X] T022 [US1] Em `src/features/allocation/components/allocation-provider.tsx`: novas props `initialEducationPercentage` e `initialFreePercentage`; estado `parts: PartPercentages`; `setEssentialPercentage(value)` passa também a fazer `setParts(rescaleParts(parts, value))`, para refletir em tempo real (FR-008); expor `parts`, `setParts`, `splitSaveStatus` e `setSplitSaveStatus` no contexto. Em `src/app/planning/page.tsx`, passar as duas novas props a partir de `data`
- [X] T023 [US1] Em `src/features/allocation/components/allocation-slider.tsx`, ao receber `outcome` com sucesso, aplicar `data.parts` no provider (via `onSuccess` do `runAction`), para alinhar com o servidor; até T018 passar
- [X] T024 [US1] Em `src/components/ui/slider.tsx`, aceitar a prop opcional `thumbLabels?: string[]` e `thumbValueTexts?: string[]`: quando presentes, cada `Thumb` recebe `aria-label={thumbLabels[i]}` e `aria-valuetext={thumbValueTexts?.[i]}`; sem elas, o comportamento atual (`aria-label` para todos) continua; os testes atuais do slider da Receita continuam passando
- [X] T025 [US1] Criar `src/features/allocation/components/present-split-slider.tsx` (Client, justificar: "o slider é arrastável e atualiza as partes em tempo real; o salvamento ao soltar depende de eventos do navegador") conforme contracts/ui.md: `presentTotalLabel`; três rótulos (ponto `bg-part-*`, nome, `%` e `formatBrl` de `getPartCents(revenueCents, parts)`); três faixas `bg-part-*` sob o `Slider` (larguras = `parts[p] / presente`); `Slider` com `min={0}`, `max={presente}`, `step={1}`, `minStepsBetweenThumbs={0}`, `value={thumbsFromSplit(parts)}`, `onValueChange` → `setParts(splitFromThumbs(v, presente))`, `onValueCommit` → `savePresentSplit` com id da requisição mais recente (mesmo padrão de `AllocationSlider`), `thumbLabels` com `thumbLabel(...)` e `thumbValueTexts` com `partSplitValueText(...)`; `disabled` + `PRESENT_ZERO_HINT` quando o presente é 0; status "Salvando…", "Salvo" e "Divisão não salva" + "Tentar novamente" em `aria-live="polite"`; até T017 passar
- [X] T026 [US1] Em `src/features/expenses/components/expense-section.tsx`, renderizar `<PresentSplitSlider revenueCents={revenueCents} />` logo abaixo do título e do `PlannedAmount`, dentro de um card `rounded-2xl border bg-card p-4`; conferir na página `/planning` (`npm run build` compila)

**Checkpoint**: User Story 1 funcional — divisão em três partes com valores em tempo real, salva e reajustada pela aba Receita.

---

## Phase 4: User Story 2 - Classificar gastos planejados por parte (Priority: P1)

**Goal**: o formulário de gasto do Momento Presente tem o campo "Parte"; a lista mostra a parte; cada parte mostra o planejado × o valor da parte, com alerta próprio.

**Independent Test**: criar "Curso" de R$ 400,00 em Educação (com Educação = R$ 500,00) → lista com "Educação" e "Planejado R$ 400,00 de R$ 500,00"; criar mais R$ 200,00 → alerta de Educação.

### Tests for User Story 2 ⚠️

- [ ] T027 [P] [US2] Atualizar `tests/unit/schemas/expenses.schemas.test.ts`: `part` obrigatório ("Selecione a parte.") e aceito para os três valores
- [ ] T028 [P] [US2] Atualizar `tests/integration/expenses.actions.test.ts`: `createExpense({ ..., part: "education" })` grava `part: "education"`; `updateExpense` troca a parte; `part: "x"` → `VALIDATION` em `part`; os testes atuais passam a enviar `part`
- [ ] T029 [P] [US2] Atualizar `tests/integration/planning.queries.test.ts`: `ExpenseItem.part` vem preenchido; `expensesTotalCentsByPart` soma por parte; gasto criado sem `part` (direto no Prisma) vem como `"essentials"` (FR-021)
- [ ] T030 [P] [US2] Atualizar `tests/unit/components/expense-form.test.tsx`: o campo "Parte" aparece com "Gastos Essenciais" marcado ao criar; escolher "Educação" envia `part: "education"` a `createExpense`; ao editar, vem marcada a parte do gasto
- [ ] T031 [P] [US2] Atualizar `tests/unit/components/planning-lists.test.tsx`: cada gasto da lista do Momento Presente mostra o nome da parte (ex.: "Educação")
- [ ] T032 [P] [US2] Escrever testes em `tests/unit/components/part-budget-list.test.tsx` para `PartBudgetList` (dentro do `AllocationProvider` com 70 / 5 / 5 e receita 1_000_000): três linhas na ordem das partes; Educação com `expensesTotalCentsByPart.education = 40000` → "Planejado R$ 400,00 de R$ 500,00" e nenhum alerta; com 60000 → alerta "Educação excede o valor da parte em R$ 100,00"; com valor exatamente igual, sem alerta (`isOverBudget` é estrito)

### Implementation for User Story 2

- [ ] T033 [US2] Em `src/features/expenses/schemas.ts`, acrescentar `part: presentPartSchema` a `expenseSchema`; até T027 passar
- [ ] T034 [US2] Em `src/features/expenses/actions.ts`, gravar `part` em `create` e `update` (o dado validado já inclui `part`); até T028 passar (com o Supabase local)
- [ ] T035 [US2] Em `src/features/planning/queries.ts`, incluir `part: row.part` em `ExpenseItem` e calcular `expensesTotalCentsByPart = sumByPart(expenses)`; até T029 passar
- [ ] T036 [US2] Em `src/features/expenses/components/expense-form.tsx`, acrescentar `part` aos valores padrão (`"essentials"` ao criar; `expense.part` ao editar) e renderizar `<PartPicker registration={register("part")} error={errors.part?.message} />` depois da categoria; até T030 passar
- [ ] T037 [US2] Em `src/features/expenses/components/expense-list.tsx`, mostrar um selo da parte (ponto `bg-part-*` + `PART_LABELS[expense.part]`) ao lado da categoria; até T031 passar
- [ ] T038 [US2] Criar `src/features/expenses/components/part-budget-list.tsx` (Client, justificar: "valores e alertas acompanham as porcentagens das partes em tempo real, durante o arraste") conforme contracts/ui.md: para cada parte, nome, `partPlannedLabel(planned, limit)` e `UsageBar` fina (a `UsageBar` ganha o tom `part-essentials | part-education | part-free` em `src/components/usage-bar.tsx`), e um `Alert` destrutivo com `partExcessMessage` quando `isOverBudget(planned, limit)`; limite = `getPartCents(revenueCents, parts)[part]`; até T032 passar
- [ ] T039 [US2] Em `src/features/expenses/components/expense-section.tsx` e `src/app/planning/page.tsx`, passar `expensesTotalCentsByPart` e renderizar a `PartBudgetList` logo abaixo do `PresentSplitSlider` e antes do `OverBudgetAlert` atual (que continua igual)

**Checkpoint**: User Stories 1 e 2 funcionais — divisão, gastos planejados por parte e alertas por parte.

---

## Phase 5: User Story 3 - Classificar gastos realizados por parte no Controle (Priority: P2)

**Goal**: o formulário de registro do Controle tem o campo "Parte", e a lista de gastos do mês mostra a parte de cada gasto.

**Independent Test**: registrar "Livro" de R$ 80,00 em Educação → a lista mostra "Educação"; editar para Livre → a lista mostra "Livre".

### Tests for User Story 3 ⚠️

- [ ] T040 [P] [US3] Atualizar `tests/unit/schemas/control.schemas.test.ts`: `part` obrigatório ("Selecione a parte.") e aceito para os três valores
- [ ] T041 [P] [US3] Atualizar `tests/integration/control.actions.test.ts`: create e update gravam e trocam `part`; `part` inválido → `VALIDATION`; os testes atuais passam a enviar `part`
- [ ] T042 [P] [US3] Atualizar `tests/unit/components/actual-expense-form.test.tsx` (card e painel): campo "Parte" com "Gastos Essenciais" marcado; escolher "Educação" envia `part: "education"`; na edição, vem marcada a parte do gasto
- [ ] T043 [P] [US3] Atualizar `tests/unit/components/actual-expense-list.test.tsx`: cada item mostra o nome da parte, também quando `showCategory` é `false`

### Implementation for User Story 3

- [ ] T044 [US3] Em `src/features/control/schemas.ts`, acrescentar `part: presentPartSchema` em `createActualExpenseSchema`; em `src/features/control/actions.ts`, gravar `part` em create e update; em `src/features/control/queries.ts`, incluir `part: row.part` em `ActualExpenseItem`; até T040 e T041 passarem
- [ ] T045 [US3] Em `src/features/control/components/actual-expense-form.tsx`, acrescentar `part` aos valores padrão (`"essentials"` ao registrar e no `reset` após salvar; `actualExpense.part` ao editar) e renderizar `PartPicker` depois da categoria; até T042 passar
- [ ] T046 [US3] Em `src/features/control/components/actual-expense-list.tsx`, mostrar o selo da parte (ponto `bg-part-*` + `PART_LABELS[item.part]`) em todos os itens, independente de `showCategory`; até T043 passar

**Checkpoint**: User Story 3 funcional — gastos realizados com parte, no formulário e na lista.

---

## Phase 6: User Story 4 - Gráfico do Controle com as três partes (Priority: P2)

**Goal**: o gráfico mostra três curvas de gasto acumulado (uma por parte) e três limites (valor de cada parte); a categoria filtra os gastos, não os limites; alternativa textual por parte.

**Independent Test**: com limites de R$ 6.000,00, R$ 500,00 e R$ 500,00, registrar gastos nas três partes → três curvas e três limites tracejados; selecionar uma categoria → as curvas filtram, os limites não mudam.

### Tests for User Story 4 ⚠️

- [ ] T047 [P] [US4] Atualizar `tests/integration/control.queries.test.ts`: `getControlData` devolve `presentPercentage`, `partPercentages`, `presentLimitCents` e `partLimitCents` (Receita 1_000_000 e alocação 70/5/5 → `presentLimitCents: 700000` e `partLimitCents: { essentials: 600000, education: 50000, free: 50000 }`); sem alocação → 50% e tudo em `essentials`; não devolve mais `plannedCentsByCategory`; os dados de outro usuário não entram
- [ ] T048 [P] [US4] Atualizar `tests/unit/components/spending-chart.test.tsx`: com `parts` = as três, renderiza a legenda com os nomes das três partes e "Limite R$ 6.000,00", "Limite R$ 500,00" e "Limite R$ 500,00"; o `figcaption` tem uma frase por parte (`partChartSummary`) e " Acima do limite." na parte excedida; com `parts=["education"]`, só Educação aparece na legenda e no resumo
- [ ] T049 [P] [US4] Atualizar `tests/unit/lib/spending.test.ts`: remover os testes de `getPlannedCents`; `filterActualExpenses(items, { category, part })` filtra por categoria, por parte e pelas duas juntas (`part: null` = todas as partes)

### Implementation for User Story 4

- [ ] T050 [US4] Em `src/features/control/queries.ts`, ler `incomes` (soma) e `allocations` do usuário; calcular `presentPercentage`, `partPercentages = toPartPercentages(...)`, `presentLimitCents = calculatePlannedCents(receita, presente)` e `partLimitCents = getPartCents(receita, partPercentages)`; remover o `groupBy` de `expenses` e o `plannedCentsByCategory`; atualizar `src/app/control/page.tsx` e as props do `ControlDashboard`; até T047 passar (com o Supabase local)
- [ ] T051 [US4] Em `src/lib/spending.ts`, remover `getPlannedCents`; mudar `filterActualExpenses(items, { category, part })` (`part: PresentPart | null`); até T049 passar
- [ ] T052 [US4] Reescrever `src/features/control/components/spending-chart.tsx` conforme contracts/ui.md e research R11: props `series: PartSeriesPoint[]`, `parts: PresentPart[]`, `limits: PartCents` e `monthLabel`; com uma parte, `Area` + `ReferenceLine` em `var(--part-<p>)`; com três, três `Line type="stepAfter"` + três `ReferenceLine strokeDasharray="6 5"`, cada par na cor da parte; `domain` do Y até `max(dataMax, ...limites)`; `chartConfig` com uma entrada por parte (rótulos de `PART_LABELS`); legenda visível por parte (traço sólido + tracejado + "Limite R$ X"); `figcaption` com `partChartSummary` de cada parte exibida; até T048 passar
- [ ] T053 [US4] Em `src/features/control/components/control-dashboard.tsx`, calcular `series = buildPartSeries(itensFiltradosPorCategoria, today)` e passar `parts={PRESENT_PARTS}` e `limits={partLimitCents}` ao `SpendingChart`; atualizar `tests/unit/components/control-dashboard.test.tsx` às novas props (sem `plannedCentsByCategory`)

**Checkpoint**: User Story 4 funcional — gráfico com três partes e três limites.

---

## Phase 7: User Story 5 - Barra de uso por parte que filtra o dashboard (Priority: P2)

**Goal**: a barra de uso acima do resumo tem um trecho por parte (cor própria, largura pelo gasto), tooltip com nome e %, legenda clicável; a parte ativa filtra resumo, gráfico e lista; sem parte ativa = todo o Momento Presente; "Planejado" vira "Limite".

**Independent Test**: Receita R$ 10.000,00, partes 60/5/5, gastos de R$ 1.200,00, R$ 100,00 e R$ 50,00 → três trechos; ativar Educação → Disponível R$ 400,00, Limite R$ 500,00, gráfico e lista só com Educação; desativar → Limite R$ 7.000,00.

### Tests for User Story 5 ⚠️

- [ ] T054 [P] [US5] Escrever testes em `tests/unit/components/part-usage-bar.test.tsx` para `PartUsageBar`: três trechos com `style.width` vindo de `getPartBarWidths` e classes `bg-part-*`; legenda com três `button` "Gastos Essenciais, 60% da Receita, gasto R$ 1.200,00" etc., com `aria-pressed="false"`; clicar no botão de Educação chama `onToggle("education")`; com `activePart="education"`, o botão tem `aria-pressed="true"` e os outros trechos `opacity-40`; passar o mouse ou focar o trecho mostra o tooltip "Educação · 5% da Receita" (`findByRole("tooltip")`); os botões da legenda têm `min-h-11`; uma parte com gasto 0 continua ativável pela legenda
- [ ] T055 [P] [US5] Atualizar `tests/unit/components/spending-summary.test.tsx` e `tests/unit/lib/control-labels.test.ts`: a prop `limitCents` no lugar de `plannedCents`; o rótulo "Limite" no lugar de "Planejado" (`SUMMARY_LABELS.limit`); Disponível = limite − gasto; a barra antiga não fica mais dentro do resumo
- [ ] T056 [P] [US5] Atualizar `tests/unit/components/control-dashboard.test.tsx`: sem parte ativa, o resumo mostra o limite `presentLimitCents` e o gasto das três partes, e o gráfico mostra as três partes; clicar em "Educação" na legenda → o resumo mostra o "Limite" de Educação e o gasto só de Educação, o gráfico mostra só Educação e a lista só os gastos de Educação; clicar de novo → volta a tudo; com categoria selecionada e Educação ativa → gasto da categoria em Educação contra o limite inteiro de Educação; clicar em Livre com Educação ativa troca a parte ativa

### Implementation for User Story 5

- [ ] T057 [US5] Em `src/lib/control-labels.ts`, trocar `planned: "Planejado"` por `limit: "Limite"` em `SUMMARY_LABELS` e ajustar os usos; em `src/features/control/components/spending-summary.tsx`, a prop `limitCents` substitui `plannedCents` e a `UsageBar` sai do componente (comentário citando FR-029); até T055 passar
- [ ] T058 [US5] Criar `src/features/control/components/part-usage-bar.tsx` (Client, justificar: "parte ativa, tooltip e cliques dependem de estado e eventos no navegador") conforme contracts/ui.md e research R10: `TooltipProvider`; trilho `h-3 flex overflow-hidden rounded-full bg-muted`; trechos `bg-part-*` com `style={{ width: \`${w}%\` }}`, `border-x-2 border-background`, `aria-hidden`, `tabIndex={-1}`, `onClick={() => onToggle(p)}` e envoltos em `Tooltip` com `partPercentLabel`; legenda com três `button type="button"` (`aria-pressed`, `aria-label={partToggleLabel(...)}`, `min-h-11`, ponto de cor, nome e %); parte ativa com `ring-2 ring-ring` e os demais trechos com `opacity-40`; até T054 passar
- [ ] T059 [US5] Em `src/features/control/components/control-dashboard.tsx`: estado `activePart: PresentPart | null` (inicial `null`, FR-031); `toggle(p)` → `activePart === p ? null : p`; itens = `filterActualExpenses(actualExpenses, { category: selection, part: activePart })`; `spentByPart = sumByPart(itensDaCategoria)`; `limitCents = activePart ? partLimitCents[activePart] : presentLimitCents`; renderizar `<PartUsageBar ...>` acima do `SpendingSummary`; o `SpendingChart` recebe `parts={activePart ? [activePart] : PRESENT_PARTS}`; a lista usa os itens filtrados; até T056 passar

**Checkpoint**: todas as histórias funcionais.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Escrever `tests/unit/specs/006-present-moment-parts.spec.test.ts` rastreável à spec (cenários citando FR/US): as partes somam o Momento Presente para várias divisões (FR-003, SC-001); 60/5/5 com Receita de R$ 10.000,00 → R$ 6.000,00 / R$ 500,00 / R$ 500,00 (US1-2); reajuste 70 → 35 = 30/3/2 (FR-008); padrão tudo em Gastos Essenciais (FR-007); `presentPartSchema` recusa valor fora da lista (FR-022); resto de centavos em Livre (Edge Cases); larguras da barra limitadas a 100% (FR-024); contraste ≥ 3:1 dos tokens `part-*` nos dois temas (FR-019)
- [ ] T061 [P] Atualizar `README.md`: descrição das partes do Momento Presente (Planejamento e Controle); nova migração `present_parts` (`npm run db:deploy`); o "Limite" do Controle (valor da parte ou do Momento Presente)
- [ ] T062 Conferir com `grep -rn "plannedCentsByCategory\|getPlannedCents\|SUMMARY_LABELS.planned" src tests` que não sobrou referência; conferir que nenhum nome de parte está escrito à mão fora de `src/lib/part-labels.ts` (`grep -rn '"Educação"\|"Livre"\|"Gastos Essenciais"' src`)
- [ ] T063 Auditoria final: todo `"use client"` com justificativa; `npm run test:unit` (inclusive `tests/unit/design`), `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros
- [ ] T064 Rodar `npm run db:deploy:test` e `npm run test:integration` se houver Supabase local; caso contrário, registrar no relatório e no corpo do commit que os testes de integração de T015, T016, T028, T029, T041 e T047 não foram executados
- [ ] T065 (Usuário) Aplicar a migração no Supabase remoto com `npm run db:deploy` e executar a validação manual de `specs/006-present-moment-parts/quickstart.md` (passos 1–14)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; necessário para a US5 (tooltip).
- **Foundational (Phase 2)**: T003 depende de T002; T005 de T004; T008 de T007; T010 de T009 e T003; T012 de T011, T005 e T006; T013 de T007. BLOQUEIA as histórias.
- **US1 (Phase 3)**: depende de T003, T005, T006 e T007/T008.
- **US2 (Phase 4)**: depende de T010 e T012; T038/T039 dependem da US1 (provider com partes e `PresentSplitSlider` na seção).
- **US3 (Phase 5)**: depende de T010 e T012; independe de US1 e US2.
- **US4 (Phase 6)**: depende da US3 (`part` nos gastos realizados) e de T003; o limite usa a alocação gravada pela US1.
- **US5 (Phase 7)**: depende de T001 e da US4 (dashboard já com limites e gráfico por parte).
- **Polish (Phase 8)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- `src/features/expenses/components/expense-section.tsx` é editado por T026 e depois T039.
- `src/features/planning/queries.ts` é editado por T021 e depois T035.
- `src/features/control/queries.ts` é editado por T044 e depois T050.
- `src/features/control/components/control-dashboard.tsx` é editado por T053 e depois T059, e o teste dele por T053 e depois T056.
- `tests/integration/planning.queries.test.ts` é editado por T016 e depois T029.

### Parallel Opportunities

- Foundational: T002, T004, T006, T007, T009 e T011 em paralelo.
- US1: T014–T018 em paralelo; T019, T021 e T024 em paralelo.
- US2: T027–T032 em paralelo; T033, T037 e T038 em paralelo após os testes.
- US3: T040–T043 em paralelo (e a US3 inteira em paralelo com a US1/US2, por mexer em arquivos diferentes).
- US4: T047–T049 em paralelo; T051 e T052 em paralelo.
- US5: T054–T056 em paralelo; T057 e T058 em paralelo.
- Polish: T060 e T061 em paralelo.

---

## Parallel Example: User Story 2

```bash
Task: "Schema com part em tests/unit/schemas/expenses.schemas.test.ts"
Task: "Integração das actions em tests/integration/expenses.actions.test.ts"
Task: "Consulta do planejamento em tests/integration/planning.queries.test.ts"
Task: "Formulário em tests/unit/components/expense-form.test.tsx"
Task: "Lista em tests/unit/components/planning-lists.test.tsx"
Task: "Resumo por parte em tests/unit/components/part-budget-list.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)

1. Phase 1 + Phase 2
2. US1 (divisão no slider) e US2 (gastos planejados por parte)
3. **PARAR e VALIDAR**: passos 1–8 do quickstart (após `npm run db:deploy`)

### Incremental Delivery

1. Setup + Foundational
2. US1 → divisão e reajuste
3. US2 → planejamento por parte
4. US3 → gastos realizados com parte
5. US4 → gráfico com três partes
6. US5 → barra por parte e filtro
7. Polish → teste da spec, README, auditorias e build

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências pendentes.
- Integração sem o Supabase local: os testes são escritos e carregam, mas não rodam; isso não
  bloqueia commits, desde que fique registrado.
- A migração só chega ao banco remoto quando o usuário rodar `npm run db:deploy` (T065); até lá,
  Planejamento e Controle falham ao ler as colunas novas no ambiente do usuário. A migração da
  feature 005 (`profiles`) precisa ser aplicada antes.
