---

description: "Task list for feature 003-spending-control"
---

# Tasks: Planejamento e Controle de gastos

**Input**: Design documents from `/specs/003-spending-control/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md,
contracts/ui.md, quickstart.md

**Tests**: OBRIGATÓRIOS pela constituição (Princípio II): teste unitário para cada funcionalidade
nova, teste unitário rastreável à spec e ao menos um teste de integração por Server Action
(`createActualExpense`, `updateActualExpense`, `deleteActualExpense`) e pela consulta
`getControlData`. Escrever os testes antes e vê-los falhar. Os testes de integração só rodam com
Supabase local (Docker); sem ele, registrar isso no corpo do commit e no relatório.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Identificadores, rotas, tabelas e colunas em inglês; comentários em português; textos de UI em
  pt-BR (Princípio I).
- Todo `"use client"` novo com comentário em português justificando (Princípio III).
- Dinheiro sempre em centavos (`number` inteiro) na aplicação; `decimalToCents`,
  `centsToDecimalString` e `formatBrl` de `src/lib/money.ts`.
- Datas de gasto sempre como string `"YYYY-MM-DD"`; conversão para `Date` só na borda do Prisma
  (`toDbDate`/`fromDbDate`). "Hoje" sempre via `getToday(now)` de `src/lib/calendar.ts`, nunca
  `new Date().toISOString()`.
- Textos do Controle vêm de `src/lib/control-labels.ts`; caminhos vêm de `src/lib/app-routes.ts`
  (nunca `"/planning"`/`"/control"` escritos à mão fora desse arquivo e dos testes).
- O domínio `expenses` (gasto planejado) NÃO é alterado em dados nem em regras; as actions do
  Controle NÃO leem nem escrevem a tabela `expenses` (FR-010).
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]` (primeira linha
  ≤ 72 caracteres), na branch `003-spending-control`, somente com testes unitários, `tsc` e lint
  passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Adicionar o componente de gráfico do shadcn/ui com `npx shadcn@4.23.0 add chart -y`, gerando `src/components/ui/chart.tsx` e instalando `recharts` 3.x em `package.json`; incluir, na linha seguinte ao `"use client"`, o comentário "// Client Component: wrapper do Recharts (shadcn/ui), que mede o layout e desenha o gráfico no navegador."; conferir que `npm run test:unit` e `npx tsc --noEmit` continuam passando

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Criar `src/lib/app-routes.ts` com `PLANNING_PATH = "/planning"`, `CONTROL_PATH = "/control"` e o tipo `AppSection = "planning" | "control"` (comentário em português explicando que é a fonte única dos caminhos das páginas)
- [X] T003 [P] Escrever testes unitários em `tests/unit/lib/calendar.test.ts` para `src/lib/calendar.ts`: `APP_TIME_ZONE === "America/Sao_Paulo"`; `getToday(new Date("2026-11-10T02:30:00Z"))` → `"2026-11-09"` (ainda dia 9 em Brasília) e `getToday(new Date("2026-11-10T03:00:00Z"))` → `"2026-11-10"`; `getMonthRange("2026-11-09")` → `{ first: "2026-11-01", last: "2026-11-30" }`, `getMonthRange("2028-02-10")` → último `"2028-02-29"` e `getMonthRange("2026-12-31")` → `{ first: "2026-12-01", last: "2026-12-31" }`; `isValidCalendarDate`: `"2026-11-09"` true, `"2026-02-30"`, `"2026-13-01"`, `"09/11/2026"`, `""` false; `isInMonth("2026-11-01","2026-11-09")` true, `isInMonth("2026-11-30","2026-11-09")` true, `isInMonth("2026-10-31","2026-11-09")` false, `isInMonth("2026-12-01","2026-11-09")` false, `isInMonth("2025-11-09","2026-11-09")` false; `getDaysInMonth("2026-11-09")` → 30; `formatMonthLabel("2026-11-09")` → `"Novembro de 2026"` (primeira letra maiúscula); `formatDateBr("2026-11-09")` → `"09/11/2026"`; `toDbDate("2026-11-09")` → `Date` igual a `new Date("2026-11-09T00:00:00.000Z")` e `fromDbDate` desse `Date` → `"2026-11-09"`
- [X] T004 Implementar `src/lib/calendar.ts` (funções puras, sem React/Next, com `Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE })` para `getToday` e aritmética de calendário sem depender do fuso da máquina) até T003 passar
- [X] T005 [P] Escrever testes unitários em `tests/unit/lib/control-labels.test.ts` para `src/lib/control-labels.ts`: `SECTION_NAV_LABELS = { planning: "Planejamento", control: "Controle" }`; `ALL_CATEGORIES_LABEL = "Todos"`; `EMPTY_ACTUAL_EXPENSES = "Nenhum gasto registrado"`; `DATE_OUT_OF_MONTH_MESSAGE = "A data deve estar dentro do mês atual."`; `overLimitMessage(10000)` → `"Acima do limite em R$ 100,00"`; `chartSummary({ spentCents: 23050, plannedCents: 230000, monthLabel: "Novembro de 2026" })` → `"Gasto acumulado de R$ 230,50 de um limite de R$ 2.300,00 em Novembro de 2026"`
- [X] T006 Implementar `src/lib/control-labels.ts` (usando `formatBrl`) até T005 passar; incluir também `SUMMARY_LABELS = { planned: "Planejado", spent: "Gasto", available: "Disponível" }`, `CHART_LIMIT_LABEL = "Limite"` e `controlTitle(monthLabel)` → `"Controle de Novembro de 2026"`
- [X] T007 Adicionar ao `prisma/schema.prisma` o modelo `ActualExpense` (`@@map("actual_expenses")`) com, exatamente: `id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`; `userId String @map("user_id") @db.Uuid`; `name String @db.VarChar(100)`; `amount Decimal @db.Decimal(12, 2)`; `categoryId String @map("category_id") @db.Uuid` com `category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)`; `spentOn DateTime @map("spent_on") @db.Date`; `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)`; `updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)`; `@@index([userId, spentOn])`; e `actualExpenses ActualExpense[]` em `Category`; comentário em português "Gasto realizado (Controle), independente do gasto planejado (Expense)"; rodar `npx prisma generate`
- [X] T008 Criar a migração `prisma/migrations/20261109000000_actual_expenses/migration.sql` com o Prisma Migrate (`npx prisma migrate diff --from-schema <schema anterior, de git show HEAD:prisma/schema.prisma> --to-schema prisma/schema.prisma --script`, como na migração inicial) e acrescentar à mão, no mesmo arquivo e no padrão de `20261108000000_init/migration.sql`: FK `actual_expenses_user_id_fkey` → `auth.users("id") ON DELETE CASCADE`; `CHECK ("amount" > 0 AND "amount" <= 999999999.99)` como `actual_expenses_amount_check`; `ALTER TABLE "actual_expenses" ENABLE ROW LEVEL SECURITY`; políticas `actual_expenses_select_own`, `_insert_own`, `_update_own` e `_delete_own` `TO authenticated` com `auth.uid() = "user_id"` (USING e/ou WITH CHECK como nas de `expenses`); conferir com `npx prisma validate`. A aplicação no banco remoto (`npm run db:deploy`) é feita pelo usuário (T045)
- [X] T009 Atualizar `resetDatabase()` em `tests/setup/db.ts` para apagar também `prisma.actualExpense.deleteMany()` (antes de `expense`) e acrescentar o helper `createActualExpenseRow(userId, { name, amountCents, categoryId, spentOn })` para os testes de integração

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Navegar entre Planejamento e Controle (Priority: P1) 🎯 MVP

**Goal**: duas páginas (`/planning` com as abas da feature 002 e `/control`), botões no topo, `/` e pós-login levando ao Controle.

**Independent Test**: logado, abrir `/` → `/control`; clicar em "Planejamento" → abas funcionando como antes em `/planning`; clicar em "Controle" → volta; sair e entrar → `/control`.

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Atualizar `tests/unit/lib/auth-redirect.test.ts`: `resolveAuthRedirect("/", true)` → `"/control"`; `resolveAuthRedirect("/login", true)` → `"/control"`; `resolveAuthRedirect("/planning", false)` e `("/control", false)` → `"/login"`; `resolveAuthRedirect("/planning", true)` e `("/control", true)` → `null`; `HOME_PATH === "/control"`
- [X] T011 [P] [US1] Atualizar os testes que usam a base `/` das abas: `tests/unit/lib/planning-tab.test.ts` (`buildPlanningTabUrl("income")` → `"/planning"`, `"present"` → `"/planning?tab=present"`, `"future"` → `"/planning?tab=future"`), `tests/unit/specs/002-planning-tabs.spec.test.ts` (mesmos valores) e `tests/unit/components/planning-tabs.test.tsx` (`replaceState` chamado com `"/planning?tab=present"` e `"/planning"`)
- [X] T012 [P] [US1] Escrever testes unitários em `tests/unit/components/app-header.test.tsx` para `AppHeader` (mockar `@/features/auth/actions` como em `login-form.test.tsx`): com `current="control"`, `getByRole("navigation", { name: "Seções" })` contém os links "Planejamento" (`href="/planning"`) e "Controle" (`href="/control"`), nessa ordem; "Controle" tem `aria-current="page"` e "Planejamento" não tem `aria-current`; com `current="planning"`, o inverso; o título "Finanças Pessoais" e o botão "Sair" continuam presentes
- [X] T013 [P] [US1] Atualizar os testes de integração aos novos caminhos: `tests/integration/auth.actions.test.ts` (`signIn` com sucesso → `RedirectError("/control")`); `tests/integration/incomes.actions.test.ts` e `tests/integration/goals.actions.test.ts` (`revalidatePath` chamado com `"/planning"`); `tests/integration/expenses.actions.test.ts` (`revalidatePath` chamado com `"/planning"` e com `"/control"`)

### Implementation for User Story 1

- [X] T014 [US1] Atualizar `src/lib/auth-redirect.ts`: `HOME_PATH = CONTROL_PATH` (de `src/lib/app-routes.ts`); para usuário logado em `"/"` ou em `/login`, devolver `HOME_PATH`; comentários atualizados; até T010 passar (`src/app/login/page.tsx` e `signIn` em `src/features/auth/actions.ts` já usam `HOME_PATH`; ajustar o comentário de `signIn`)
- [X] T015 [US1] Atualizar `src/lib/planning-tab.ts`: `buildPlanningTabUrl` usa `PLANNING_PATH` como base (`income` → `"/planning"`, demais → `"/planning?tab=<tab>"`) e o comentário; até T011 passar
- [X] T016 [US1] Atualizar `src/features/planning/components/app-header.tsx` (Server Component): prop `current: AppSection`; `<nav aria-label="Seções">` entre o título e o "Sair", com dois `next/link` estilizados com `buttonVariants` de `src/components/ui/button.tsx` (`variant: "default"` + `aria-current="page"` no atual, `variant: "outline"` no outro, `size: "sm"`), rótulos de `SECTION_NAV_LABELS`; header com `flex-wrap` para quebrar linha em telas estreitas sem rolagem horizontal; até T012 passar
- [X] T017 [US1] Mover o conteúdo de `src/app/page.tsx` para `src/app/planning/page.tsx` (mesmo comportamento das abas, `AppHeader current="planning"`, comentário atualizado para "página Planejamento") e substituir `src/app/page.tsx` por um Server Component que chama `redirect(CONTROL_PATH)` de `next/navigation` (comentário: garantia caso a requisição não passe pelo proxy)
- [X] T018 [US1] Criar `src/app/control/page.tsx` (Server Component): `requireUserId()`, `AppHeader current="control"` e `<main className="mx-auto w-full max-w-4xl px-4 py-6">` com o título `controlTitle(formatMonthLabel(getToday(new Date())))` em `<h2>`; o conteúdo do Controle entra nas US2/US3
- [X] T019 [US1] Atualizar `revalidatePath` nas actions do planejamento: `src/features/incomes/actions.ts` e `src/features/goals/actions.ts` → `revalidatePath(PLANNING_PATH)`; `src/features/expenses/actions.ts` → `revalidatePath(PLANNING_PATH)` e `revalidatePath(CONTROL_PATH)` (o planejado por categoria aparece no Controle); `saveAllocation` sem alteração; até T013 passar (quando houver Supabase local)

**Checkpoint**: User Story 1 funcional — `/planning` com as abas, `/control` com o título do mês, navegação e redirecionamentos.

---

## Phase 4: User Story 2 - Registrar um gasto realizado (Priority: P1)

**Goal**: criar, editar e apagar gastos realizados (nome, valor, categoria e data dentro do mês atual, padrão hoje), sem afetar o planejamento.

**Independent Test**: registrar um gasto com a data padrão e outro com um dia anterior do mesmo mês; ambos aparecem na lista do Controle após recarregar; editar e apagar um deles; o Momento Presente do Planejamento não muda.

### Tests for User Story 2 ⚠️

- [X] T020 [P] [US2] Escrever testes unitários em `tests/unit/schemas/control.schemas.test.ts` para `createActualExpenseSchema("2026-11-09")`: entrada válida `{ name: " Mercado ", amount: "230,50", categoryId: <uuid>, spentOn: "2026-11-09" }` → `{ name: "Mercado", amount: 23050, categoryId, spentOn: "2026-11-09" }`; `spentOn: "2026-11-01"` e `"2026-11-30"` válidos; `spentOn: ""` → "Informe a data."; `"2026-02-30"` e `"09/11/2026"` → "Data inválida."; `"2026-10-31"` e `"2026-12-01"` → "A data deve estar dentro do mês atual."; nome vazio, valor `"0"` e categoria vazia → as mensagens já usadas por `expenseSchema`; e que `createActualExpenseSchema("2026-12-05")` aceita `"2026-12-01"` e recusa `"2026-11-30"`
- [X] T021 [P] [US2] Escrever testes de integração em `tests/integration/control.actions.test.ts` (padrão de `expenses.actions.test.ts`, com `vi.useFakeTimers({ toFake: ["Date"] })` e `vi.setSystemTime(new Date("2026-11-09T15:00:00Z"))`): `createActualExpense` válido grava a linha do usuário A com `spentOn` `2026-11-09`, `amount` `230.5` e chama `revalidatePath("/control")`; data `"2026-10-31"` → `VALIDATION` com `fieldErrors.spentOn` e nada gravado; categoria inexistente → `VALIDATION` em `categoryId`; sem sessão → `UNAUTHENTICATED`; `updateActualExpense` altera nome/valor/categoria/data do próprio gasto, retorna `NOT_FOUND` para gasto do usuário B e para id malformado, sem alterar nada; `deleteActualExpense` apaga o próprio gasto e retorna `NOT_FOUND` para o de B; nenhuma das actions cria, altera ou apaga linhas em `expenses` (contar antes e depois)
- [X] T022 [P] [US2] Escrever testes de integração em `tests/integration/control.queries.test.ts` para `getControlData(userId, "2026-11-09")`: retorna só gastos realizados do usuário A com `spentOn` entre `2026-11-01` e `2026-11-30` (excluir um de `2026-10-31`, um de `2026-12-01` e um do usuário B), ordenados por `spentOn` desc e depois `createdAt` desc, com `amountCents`, `categoryName` e `spentOn` em `"YYYY-MM-DD"`; `plannedCentsByCategory` soma os `Expense` de A por categoria (dois gastos planejados em "Moradia" de 1.000,00 e 500,00 → `150000`) e ignora `Goal`; `categories` em ordem alfabética pt-BR; `today` igual ao recebido
- [X] T023 [P] [US2] Escrever testes unitários em `tests/unit/components/actual-expense-form.test.tsx` (mockar `@/features/control/actions` e `next/navigation` como em `expense-form.test.tsx`; fixar a data com `vi.setSystemTime(new Date("2026-11-09T15:00:00Z"))`): no modo `create`, o campo "Data" tem valor `"2026-11-09"`, `min="2026-11-01"` e `max="2026-11-30"`; enviar vazio mostra os erros de nome, valor e categoria e não chama a action; preencher nome, valor `"230,50"`, categoria e enviar chama `createActualExpense` com `{ name, amount: "230,50", categoryId, spentOn: "2026-11-09" }` e, no sucesso, o formulário volta ao estado inicial com a data de hoje; erro `VALIDATION` do servidor em `spentOn` aparece no campo; no modo `edit` (botão "Editar" abre o formulário com os dados do gasto), salvar chama `updateActualExpense(id, …)`
- [X] T024 [P] [US2] Escrever testes unitários em `tests/unit/components/actual-expense-list.test.tsx`: lista vazia mostra "Nenhum gasto registrado"; cada item mostra nome, valor (`formatBrl`), data `DD/MM/AAAA` e os botões "Editar" e "Apagar"; com `showCategory`, mostra o nome da categoria; sem `showCategory`, não mostra

### Implementation for User Story 2

- [X] T025 [US2] Implementar `src/features/control/schemas.ts`: `createActualExpenseSchema(today: string)` com `name: nameSchema`, `amount: amountSchema`, `categoryId` (mesma regra de `expenseSchema`; extrair para `categoryIdSchema` em `src/lib/validation.ts` se reduzir duplicação, mantendo `expenseSchema` igual) e `spentOn` (string obrigatória "Informe a data."; formato e `isValidCalendarDate` "Data inválida."; `isInMonth(spentOn, today)` → `DATE_OUT_OF_MONTH_MESSAGE`); tipo `ActualExpenseInput = z.input<…>`; até T020 passar
- [X] T026 [US2] Implementar `src/features/control/queries.ts` (`import "server-only"`): tipos `ActualExpenseItem` e `ControlData` de `data-model.md` e `getControlData(userId, today)` com `Promise.all` de `prisma.actualExpense.findMany({ where: { userId, spentOn: { gte: toDbDate(first), lte: toDbDate(last) } }, include: { category: true }, orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }] })`, `prisma.expense.groupBy({ by: ["categoryId"], where: { userId }, _sum: { amount: true } })` e `prisma.category.findMany()` (ordenar com `localeCompare(…, "pt-BR")`); converter com `decimalToCents` e `fromDbDate`; até T022 passar
- [X] T027 [US2] Implementar `src/features/control/actions.ts` (`"use server"`): `createActualExpense(input)`, `updateActualExpense(id, input)` e `deleteActualExpense(id)` no padrão de `src/features/expenses/actions.ts` (`authenticatedAction`, `isValidId`, `categoryExists`, `updateMany`/`deleteMany` com `{ id, userId }`, `centsToDecimalString`, `toDbDate`), validando com `createActualExpenseSchema(getToday(new Date()))` no momento da chamada e chamando `revalidatePath(CONTROL_PATH)` em sucesso; até T021 passar (quando houver Supabase local)
- [X] T028 [US2] Implementar `src/features/control/components/actual-expense-form.tsx` (`"use client"` com comentário: formulário com React Hook Form, Princípio IV) no padrão de `src/features/expenses/components/expense-form.tsx`: props `{ mode: "create" | "edit"; categories: CategoryOption[]; actualExpense?: ActualExpenseItem }`; `zodResolver(createActualExpenseSchema(today), undefined, { raw: true })` com `today = getToday(new Date())`; campos "Nome do gasto", "Valor (R$)", "Categoria" (`Select`) e "Data" (`Input type="date"` com `min`/`max` de `getMonthRange(today)`, padrão `today` na criação); envio via `runAction`; botão "Adicionar gasto" (create) ou "Salvar" (edit, dentro do mesmo padrão de abertura/fechamento do `ExpenseForm`); após sucesso na criação, `reset` com a data de hoje; mensagem de "não há categorias" quando a lista estiver vazia, como no `ExpenseForm`; até T023 passar
- [X] T029 [US2] Implementar `src/features/control/components/actual-expense-list.tsx` (sem diretiva; usado pelo dashboard cliente e renderizável no servidor) no padrão de `expense-list.tsx`: props `{ actualExpenses: ActualExpenseItem[]; categories: CategoryOption[]; showCategory: boolean }`; item com nome, categoria (se `showCategory`), `formatDateBr(spentOn)`, valor, `ActualExpenseForm mode="edit"` e `DeleteConfirmDialog` com `deleteActualExpense.bind(null, id)`; vazio → `EMPTY_ACTUAL_EXPENSES`; até T024 passar
- [X] T030 [US2] Atualizar `src/app/control/page.tsx`: `today = getToday(new Date())`, `data = await getControlData(userId, today)`; renderizar em `Card`s um bloco "Registrar gasto" com `ActualExpenseForm mode="create"` e um bloco com `ActualExpenseList` (todos os gastos do mês, `showCategory`) — o bloco da lista será substituído pelo dashboard na US3

**Checkpoint**: User Stories 1 e 2 funcionando — gastos realizados com criar, editar e apagar, sem afetar o planejamento.

---

## Phase 5: User Story 3 - Acompanhar planejado × gasto por categoria (Priority: P2)

**Goal**: dashboard do mês com seleção de categoria ("Todos" padrão), planejado, gasto, disponível (destacado quando negativo), lista e gráfico acumulado com linha de limite.

**Independent Test**: com gastos planejados e realizados em duas categorias, alternar entre "Todos" e cada categoria e conferir planejado, gasto, disponível, lista e gráfico com contas feitas à mão.

### Tests for User Story 3 ⚠️

- [X] T031 [P] [US3] Escrever testes unitários em `tests/unit/lib/spending.test.ts` para `src/lib/spending.ts`: `ALL_CATEGORIES = "all"`; `getPlannedCents({ moradia: 150000, alimentacao: 80000 }, "all")` → `230000`, com `"moradia"` → `150000`, com categoria ausente → `0`; `filterActualExpenses(items, "all")` devolve todos e com uma categoria só os dela, mantendo a ordem; `sumActualCents` soma `amountCents`; `getAvailableCents(150000, 75000)` → `75000` e `(150000, 160000)` → `-10000`; `isOverLimit(-1)` true e `isOverLimit(0)` false; `buildCumulativeSeries(items, "2026-11-09")` → 30 pontos `{ day, spentCents }` (dia 1 a 30), com gastos de 40000 no dia 2 e 35000 no dia 5 → dia 1 `0`, dias 2–4 `40000`, dias 5–9 `75000`, dias 10–30 `null`; com um gasto de 1000 no dia 20 (futuro dentro do mês) os valores seguem até o dia 20 e os dias 21–30 são `null`; sem gastos → dias 1–9 `0` e 10–30 `null`
- [X] T032 [P] [US3] Escrever testes unitários em `tests/unit/components/spending-summary.test.tsx`: com planejado 150000 e gasto 75000 mostra "Planejado R$ 1.500,00", "Gasto R$ 750,00" e "Disponível R$ 750,00" sem destaque; com gasto 160000 mostra "Disponível -R$ 100,00" (formato de `formatBrl` para negativos) e "Acima do limite em R$ 100,00" com a classe de destaque (`text-destructive`)
- [X] T033 [P] [US3] Escrever testes unitários em `tests/unit/components/spending-chart.test.tsx`: renderiza um elemento `role="img"` com nome acessível igual a `chartSummary(...)` (ex.: "Gasto acumulado de R$ 750,00 de um limite de R$ 1.500,00 em Novembro de 2026") e o mesmo texto em um `sr-only`; não quebra com série toda `null`/`0` e planejado `0`
- [X] T034 [US3] Escrever testes unitários em `tests/unit/components/control-dashboard.test.tsx` (mockar `@/features/control/actions` e `next/navigation`; dados com planejado `{ Moradia: 150000, Alimentação: 80000 }`, gastos de Moradia 40000 e Alimentação 23050 no mês): a seleção "Categoria" começa em "Todos" e o resumo mostra planejado R$ 2.300,00, gasto R$ 630,50 e disponível R$ 1.669,50, com os dois gastos e os nomes das categorias na lista; selecionar "Moradia" (abrir o `Select` com `userEvent` e escolher a opção) → planejado R$ 1.500,00, gasto R$ 400,00, disponível R$ 1.100,00, só o gasto de Moradia, sem nome de categoria; selecionar uma categoria sem gastos e sem planejado → "Nenhum gasto registrado" e disponível R$ 0,00; `rerender` com uma nova lista de gastos (simulando a revalidação após uma action) mantém "Moradia" selecionada e atualiza os valores (FR-020)

### Implementation for User Story 3

- [X] T035 [US3] Implementar `src/lib/spending.ts` (funções puras em centavos, usando `getDaysInMonth` e `sumCents`) com `ALL_CATEGORIES`, o tipo `CategorySelection = typeof ALL_CATEGORIES | string`, `getPlannedCents`, `filterActualExpenses`, `sumActualCents`, `getAvailableCents`, `isOverLimit` e `buildCumulativeSeries` (corte em `max(dia de hoje, dia do último spentOn)`); até T031 passar
- [X] T036 [US3] Implementar `src/features/control/components/spending-summary.tsx` (sem diretiva): props `{ plannedCents: number; spentCents: number }`; três valores com rótulos de `SUMMARY_LABELS`, disponível de `getAvailableCents` e, quando `isOverLimit`, `text-destructive` + `overLimitMessage(-available)`; até T032 passar
- [X] T037 [US3] Implementar `src/features/control/components/spending-chart.tsx` (`"use client"` com comentário: Recharts desenha o gráfico no navegador) com `ChartContainer` de `src/components/ui/chart.tsx` e `LineChart` do `recharts`: `accessibilityLayer`, eixo X `day`, eixo Y em reais (`formatBrl` no tick e no tooltip), `Line` `type="stepAfter"` de `spentCents` com `connectNulls={false}` e `dot={false}`, `ReferenceLine y={plannedCents}` com rótulo `CHART_LIMIT_LABEL` na cor de destaque; contêiner com `role="img"` e `aria-label={chartSummary(...)}` e o mesmo texto em `<p className="sr-only">`; altura fixa responsiva (`h-64 w-full`); até T033 passar
- [X] T038 [US3] Implementar `src/features/control/components/control-dashboard.tsx` (`"use client"` com comentário: guarda a categoria selecionada e filtra no navegador, sem ida ao servidor — FR-020): props `{ today: string; categories: CategoryOption[]; plannedCentsByCategory: Record<string, number>; actualExpenses: ActualExpenseItem[] }`; `useState<CategorySelection>(ALL_CATEGORIES)`; `Select` rotulado "Categoria" com "Todos" + categorias; `useMemo` para filtro, soma e série; renderiza `SpendingSummary`, `SpendingChart` e `ActualExpenseList` (`showCategory` só em "Todos"); se a categoria selecionada deixar de existir nas props, voltar para "Todos"; até T034 passar
- [X] T039 [US3] Atualizar `src/app/control/page.tsx`: substituir o bloco da lista (T030) por `ControlDashboard` com os dados de `getControlData`; layout em uma coluna no celular e formulário + dashboard empilhados no desktop (`max-w-4xl`), sem rolagem horizontal

**Checkpoint**: todas as histórias funcionando de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T040 [P] Escrever `tests/unit/specs/003-spending-control.spec.test.ts` rastreável à spec (cenários citando FR/US): `/` e `/login` logado → `/control` (FR-003); `buildPlanningTabUrl` com base `/planning` (FR-004); data fora do mês recusada pelo schema e dentro aceita (FR-009); planejado de "Todos" ignora metas e soma os gastos planejados (FR-015, História 3 cenário 2a: R$ 2.300,00); disponível 150000 − 75000 = 75000 e negativo destacado (FR-017); série acumulada até hoje (FR-018)
- [X] T041 [P] Atualizar `README.md`: descrição com as duas partes (Planejamento e Controle) e rotas; nova migração (`npm run db:deploy` após atualizar); dependência `recharts`; nota de que o fuso da aplicação é `America/Sao_Paulo`; seção Estrutura com `src/features/control/` e `src/app/{planning,control}/`
- [X] T042 Atualizar a descrição em `src/app/layout.tsx` para "Planejamento financeiro pessoal: planeje a receita e controle seus gastos do mês." e conferir que nenhum `href="/"`, `redirect("/")` ou `revalidatePath("/")` sobrou em `src/` (`grep -rn '"/"' src --include=*.ts*` só deve achar `src/app/page.tsx`/`auth-redirect.ts` se aplicável)
- [X] T043 Auditoria final: todo `"use client"` em `src/` com comentário de justificativa; nenhum texto do Controle escrito à mão fora de `control-labels.ts` (exceto rótulos de campos do formulário, como nos demais formulários); rodar `npm run test:unit`, `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros
- [X] T044 Rodar `npm run test:integration` se houver Supabase local; caso contrário, registrar no relatório e no corpo do commit que os testes de integração de T013, T021 e T022 não foram executados — executado em 2026-11-09: sem Docker/Supabase local, os testes de integração não rodaram (registrado nos commits)
- [X] T045 (Usuário) Aplicar a migração no Supabase remoto com `npm run db:deploy` e executar a validação manual de `specs/003-spending-control/quickstart.md` (passos 1–10) — validado pelo usuário em 2026-11-09: migração aplicada e todos os passos ok

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; necessário só para a US3 (gráfico).
- **Foundational (Phase 2)**: T004 depende de T003; T006 de T005; T008 de T007; T009 de T007. BLOQUEIA as histórias.
- **US1 (Phase 3)**: depende de T002 e T006 (rótulos da navegação) e T004 (título do mês).
- **US2 (Phase 4)**: depende de T004, T006, T007–T009 e de T018 (página `/control`).
- **US3 (Phase 5)**: depende de T001 e da US2 (lista, form e dados de `getControlData`).
- **Polish (Phase 6)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- `src/app/control/page.tsx` é editado por T018, T030 e T039 — sequenciais.
- `app-header.tsx` (T016) antes de T017/T018, que passam a prop `current`.
- T025 (schema) antes de T027 (actions) e T028 (formulário); T026 (consulta) antes de T030.
- T035 (`spending.ts`) antes de T036–T038.

### Parallel Opportunities

- Foundational: T002, T003, T005 e T007 em paralelo.
- US1: T010–T013 em paralelo; T014, T015 e T016 em paralelo (arquivos diferentes).
- US2: T020–T024 em paralelo.
- US3: T031–T033 em paralelo; T036 e T037 em paralelo após T035.
- Polish: T040 e T041 em paralelo.

---

## Parallel Example: User Story 2

```bash
Task: "Testes do schema em tests/unit/schemas/control.schemas.test.ts"
Task: "Testes de integração das actions em tests/integration/control.actions.test.ts"
Task: "Testes de integração da consulta em tests/integration/control.queries.test.ts"
Task: "Testes do formulário em tests/unit/components/actual-expense-form.test.tsx"
Task: "Testes da lista em tests/unit/components/actual-expense-list.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)

1. Phase 1 + Phase 2
2. US1 (páginas e navegação) e US2 (registrar gastos)
3. **PARAR e VALIDAR**: passos 1–6 e 9 do quickstart (após `npm run db:deploy`)

### Incremental Delivery

1. Setup + Foundational
2. US1 → validar rotas, navegação e abas em `/planning`
3. US2 → validar registro, edição e exclusão
4. US3 → validar dashboard e gráfico
5. Polish → teste da spec, README, auditoria, build

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências pendentes.
- Integração sem Supabase local: os testes são escritos e carregam, mas não rodam; não bloqueiam
  commits, desde que isso fique registrado (constituição, autorização de commits por IA).
- A migração só chega ao banco remoto quando o usuário rodar `npm run db:deploy` (T045); até lá,
  `/control` falha ao consultar `actual_expenses` no ambiente do usuário.
