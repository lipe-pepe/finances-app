---

description: "Task list for feature 001-financial-planning"
---

# Tasks: Planejamento Financeiro Pessoal

**Input**: Design documents from `/specs/001-financial-planning/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: OBRIGATÓRIOS pela constituição (Princípio II): ao menos um teste unitário por
funcionalidade, ao menos um teste unitário rastreável à spec e ao menos um teste de integração
por endpoint (cada Server Action). Todos com Vitest. Escrever os testes antes e vê-los falhar.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Nomes de arquivos, variáveis, funções, tipos, componentes, tabelas e colunas em inglês;
  comentários em português; textos de UI em pt-BR (Princípio I).
- Componentes são Server Components por padrão; todo `"use client"` tem comentário em português
  justificando (Princípio III).
- Todo formulário usa React Hook Form + `zodResolver` com o schema do domínio, e a Server Action
  revalida com o mesmo schema (Princípio IV).
- Toda Server Action segue `contracts/server-actions.md`: `getCurrentUserId()` →
  `UNAUTHENTICATED`; validação Zod → `VALIDATION` com `fieldErrors`; queries Prisma filtradas por
  `userId`; id de outro usuário → `NOT_FOUND`; `revalidatePath('/')` em sucesso; retorno
  `ActionResult` (Princípio V).
  Exceção: `saveAllocation` não chama `revalidatePath`. No cliente, toda chamada de action passa
  por `runAction` (`src/lib/handle-action-result.ts`).
- Valores monetários: centavos inteiros na aplicação, `Decimal(12,2)` no banco, conversão só via
  `src/lib/money.ts`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Inicializar o projeto Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4, ESLint, diretório `src/`, alias `@/*`) na raiz do repositório com `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`; confirmar as versões estáveis mais recentes de Next.js e Prisma e ajustar `package.json`
- [X] T002 Instalar dependências de runtime em `package.json`: `@supabase/ssr`, `@supabase/supabase-js`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `react-hook-form`, `zod`, `@hookform/resolvers`, `server-only`; e de desenvolvimento: `prisma`, `tsx`, `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `dotenv`, `@types/pg`
- [X] T003 [P] Inicializar shadcn/ui (`npx shadcn@latest init`) e adicionar os componentes `button input label select slider card alert alert-dialog` em `src/components/ui/`
- [X] T004 [P] Criar `vitest.config.ts` com dois `projects`: `unit` (`tests/unit/**/*.test.{ts,tsx}`, ambiente `jsdom`, setup `tests/setup/unit.setup.ts` importando `@testing-library/jest-dom/vitest`) e `integration` (`tests/integration/**/*.test.ts`, ambiente `node`, `fileParallelism: false`, setup `tests/setup/integration.setup.ts` carregando `.env.test`); plugins `react()` e `tsconfigPaths()`
- [X] T005 [P] Adicionar scripts em `package.json`: `test` (`vitest run`), `test:unit` (`vitest run --project unit`), `test:integration` (`vitest run --project integration`), `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`), `db:seed` (`prisma db seed`), `postinstall` (`prisma generate`)
- [X] T006 [P] Criar `.env.example` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (pooler, porta 6543) e `DIRECT_URL` (direta, porta 5432), e `.env.test.example` apontando para o Supabase local, incluindo `SUPABASE_SERVICE_ROLE_KEY` (comentário: uso exclusivo dos testes de integração, nunca em `NEXT_PUBLIC_*`); adicionar `.env*.local`, `.env.test` e `src/generated/` ao `.gitignore`
- [X] T007 [P] Inicializar o Supabase local apenas para ambiente de teste (`supabase init`) e configurar em `supabase/config.toml`: `[auth] enable_signup = false` (FR-007), `[auth.sessions]` sem `timebox` e sem `inactivity_timeout` (FR-003); comentário em português informando que migrations NÃO são feitas pelo Supabase CLI (Princípio V)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Banco de dados (Prisma)

- [X] T008 Criar `prisma.config.ts` (schema `prisma/schema.prisma`, migrations `prisma/migrations`, seed `tsx prisma/seed.ts`, datasource de migração usando `DIRECT_URL`) e `prisma/schema.prisma` com gerador `prisma-client` (output `../src/generated/prisma`) e os modelos de `data-model.md`, com `@@map`/`@map` em snake_case:
  - `Income` → `incomes`: `id` uuid PK `gen_random_uuid()`; `userId` uuid `user_id`; `name` `varchar(100)`; `amount` `Decimal @db.Decimal(12,2)`; `createdAt`/`updatedAt` timestamptz; `@@index([userId, createdAt])`
  - `Allocation` → `allocations`: `userId` uuid PK `user_id`; `essentialPercentage` `SmallInt` `essential_percentage`; `updatedAt`
  - `Category` → `categories`: `id` uuid PK; `name` `varchar(60)` `@unique`
  - `Expense` → `expenses`: `id`, `userId`, `name varchar(100)`, `amount Decimal(12,2)`, `categoryId` uuid **obrigatório** com relação `onDelete: Restrict`, timestamps, `@@index([userId, createdAt])`
  - `Goal` → `goals`: `id`, `userId`, `name varchar(100)`, `amount Decimal(12,2)`, `categoryId` uuid **opcional** com relação `onDelete: SetNull`, timestamps, `@@index([userId, createdAt])`; sem campo "alvo"
- [X] T009 Gerar a migração inicial com `npx prisma migrate dev --name init --create-only` e acrescentar SQL manual em `prisma/migrations/<timestamp>_init/migration.sql`:
  - FK `user_id` → `auth.users(id) ON DELETE CASCADE` em `incomes`, `expenses`, `goals`, `allocations`
  - `CHECK (amount > 0 AND amount <= 999999999.99)` em `incomes`, `expenses`, `goals`
  - `CHECK (essential_percentage >= 0 AND essential_percentage <= 100)` em `allocations`
  - `ENABLE ROW LEVEL SECURITY` em todas as 5 tabelas; políticas `select/insert/update/delete` para `authenticated` com `auth.uid() = user_id` (USING e WITH CHECK) em `incomes`, `expenses`, `goals`, `allocations`; política só `select` para `authenticated` em `categories`
  - Não alterar nada no schema `auth`; aplicar com `npx prisma migrate dev`
- [X] T010 [P] Criar `prisma/seed.ts` com upsert por `name` das categorias: Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Contas e Serviços, Viagem, Reserva de Emergência, Investimentos, Outros
- [X] T011 [P] Criar `src/lib/prisma.ts`: `import 'server-only'`; singleton do `PrismaClient` (de `@/generated/prisma/client`) com `PrismaPg` adapter usando `DATABASE_URL`, reaproveitado em `globalThis` no desenvolvimento

### Utilitários puros (com testes unitários)

- [X] T012 [P] Escrever testes unitários em `tests/unit/lib/money.test.ts` para `parseBrlToCents` (aceita `"1.234,56"`, `"1234,56"`, `"1234.56"`, `"999.999.999,99"`; rejeita `"0"`, `"-1"`, `"1,234"`, `"abc"`, `""`, valores acima de 999.999.999,99), `centsToDecimalString`, `decimalToCents` e `formatBrl` (`123456` → `"R$ 1.234,56"`, `10 + 20` centavos → `"R$ 0,30"`)
- [X] T013 [P] Implementar `src/lib/money.ts` (`parseBrlToCents`, `centsToDecimalString`, `decimalToCents`, `formatBrl` com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, `MAX_AMOUNT_CENTS = 99_999_999_999`) até T012 passar
- [X] T014 [P] Escrever testes unitários em `tests/unit/lib/planning.test.ts` para `sumCents`, `calculatePlannedCents(revenueCents, percentage)` (`Math.round`; ex.: 33% de 10001 centavos → 3300), `getGoalsPercentage(p) = 100 - p`, `isOverBudget(total, planned)` (estritamente maior: 200000 vs 200000 → false; 210000 vs 200000 → true), `getExcessCents` (`max(0, total − planned)`), `DEFAULT_ESSENTIAL_PERCENTAGE = 50`
- [X] T015 [P] Implementar `src/lib/planning.ts` com as funções de T014 até os testes passarem
- [X] T016 [P] Criar `src/lib/action-result.ts` com os tipos `ActionResult<T>` e `ActionError` (`UNAUTHENTICATED`, `VALIDATION` com `fieldErrors: Record<string, string[]>`, `NOT_FOUND`, `INVALID_CREDENTIALS`, `UNKNOWN`) e helpers `ok(data)`, `fail(error)`, `validationError(zodError)`
- [X] T017 [P] Criar `src/lib/validation.ts` com schemas Zod base reutilizáveis: `nameSchema` (string, `trim`, 1–100 caracteres, mensagens em pt-BR) e `amountSchema` (string → centavos via `parseBrlToCents`; "> 0, no máximo 2 casas decimais, ≤ 999.999.999,99") e testes em `tests/unit/schemas/validation.test.ts`

### Supabase Auth no servidor

- [X] T018 Criar `src/lib/supabase/server.ts`: `import 'server-only'`; `createSupabaseServerClient()` com `createServerClient` de `@supabase/ssr` usando `cookies()` do `next/headers` (`getAll`/`setAll`)
- [X] T019 [P] Escrever testes unitários em `tests/unit/lib/auth-redirect.test.ts` para `resolveAuthRedirect(pathname, hasUser)`: `/` sem usuário → `/login`; `/login` com usuário → `/`; `/` com usuário → `null`; `/login` sem usuário → `null`
- [X] T020 [P] Implementar `src/lib/auth-redirect.ts` com a função pura `resolveAuthRedirect` até T019 passar
- [X] T021 Criar `src/lib/auth.ts`: `import 'server-only'`; `getCurrentUserId(): Promise<string | null>` usando `supabase.auth.getUser()` (nunca só `getSession()`), e `requireUserId()` que faz `redirect('/login')` quando não há usuário e testes unitários em `tests/unit/lib/auth.test.ts` com o cliente Supabase mockado: `getCurrentUserId` retorna o id quando `getUser()` traz usuário e `null` quando não traz; `requireUserId` chama `redirect('/login')` sem usuário
- [X] T022 Criar `src/proxy.ts` (Next.js 16) que renova a sessão Supabase em toda requisição (padrão `@supabase/ssr` com `getUser()`), aplica o redirecionamento retornado por `resolveAuthRedirect` (T020): `/` sem usuário → `/login` e `/login` com usuário → `/`; `matcher` excluindo `_next/static`, `_next/image`, `favicon.ico` e arquivos de imagem

### Infraestrutura de testes de integração

- [X] T023 Criar `tests/setup/integration.setup.ts` e `tests/setup/db.ts`: carregar `.env.test`; `resetDatabase()` que limpa `incomes`, `expenses`, `goals`, `allocations` (mantendo `categories` do seed); `createTestUsers()` que cria/recupera os usuários A e B em `auth.users` via Supabase Admin API local; exportar `userA`, `userB`
- [X] T024 Criar `tests/setup/mocks.ts`: `vi.mock('@/lib/auth')` com `mockAuthenticatedUser(userId | null)`; `vi.mock('next/headers')` com um cookie store em memória (`getAll`, `set`, `setAll`, `get`, `delete`) e `resetCookies()`; `vi.mock('next/cache')` (`revalidatePath` no-op, espionável); `vi.mock('next/navigation')` (`redirect` lançando `RedirectError` com o destino), para uso nos testes de integração das Server Actions

### Leitura de dados da tela

- [X] T025 Escrever teste de integração em `tests/integration/planning.queries.test.ts` para `getPlanningData(userId)`: retorna só dados do usuário informado (A não vê B); `essentialPercentage = 50` sem linha em `allocations`; `revenueCents`, `expensesTotalCents`, `goalsTotalCents` corretos ao centavo; `categories` ordenadas por nome
- [X] T026 Implementar `src/features/planning/queries.ts` com `getPlanningData(userId)` (`import 'server-only'`; consultas Prisma filtradas por `userId`, ordenadas por `createdAt`; converte `Decimal` para centavos com `decimalToCents`; retorna `{ incomes, expenses, goals, categories, essentialPercentage, revenueCents, expensesTotalCents, goalsTotalCents }`) até T025 passar

### Layout base

- [X] T027 Atualizar `src/app/layout.tsx` (Server Component, `lang="pt-BR"`, metadata "Finanças Pessoais") e `src/app/globals.css`; criar `src/features/planning/components/section-total.tsx` (Server Component que exibe um rótulo e um valor via `formatBrl`)
- [ ] T028 Configurar o projeto Supabase remoto (painel → Authentication): desligar "Allow new users to sign up" (FR-007) e manter desligados "Inactivity timeout" e "Time-box user sessions" (FR-003); registrar a checagem no `README.md`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Acesso seguro à conta (Priority: P1) 🎯 MVP

**Goal**: login com email e senha, sessão persistente, botão de sair e isolamento de dados.

**Independent Test**: com dois usuários, entrar com cada um, fechar e reabrir o navegador (sessão continua), sair pelo botão e confirmar que `/` volta a exigir login.

### Tests for User Story 1 ⚠️

- [X] T029 [P] [US1] Teste unitário de `signInSchema` (email válido obrigatório; senha não vazia) em `tests/unit/schemas/auth.schemas.test.ts`
- [X] T030 [P] [US1] Teste de integração das actions `signIn` e `signOut` em `tests/integration/auth.actions.test.ts` (contra o Supabase local): credenciais corretas → sessão criada e `redirect('/')`; senha errada e email inexistente → `INVALID_CREDENTIALS` com a mesma mensagem genérica; entrada inválida → `VALIDATION`; `signOut` → `redirect('/login')` e idempotente; com a chave pública, `supabase.auth.signUp(...)` retorna erro de cadastro desabilitado (FR-007). Usa o cookie store em memória da T024 e não mocka `@/lib/auth`; após o `signIn`, verifica que existem cookies de sessão e que `getCurrentUserId()` retorna o id do usuário A
- [X] T031 [P] [US1] Teste unitário do `LoginForm` em `tests/unit/components/login-form.test.tsx`: erros por campo do RHF, botão desabilitado durante envio, exibe "Email ou senha inválidos" quando a action retorna `INVALID_CREDENTIALS`

### Implementation for User Story 1

- [X] T032 [P] [US1] Criar `src/features/auth/schemas.ts` com `signInSchema` (`email`: email válido; `password`: string não vazia), mensagens em pt-BR
- [X] T033 [US1] Implementar `src/features/auth/actions.ts` (`"use server"`): `signIn(input)` valida com `signInSchema`, chama `signInWithPassword`, mapeia qualquer erro para `INVALID_CREDENTIALS` e faz `redirect('/')`; `signOut()` chama `supabase.auth.signOut()` e `redirect('/login')`
- [X] T034 [P] [US1] Criar `src/lib/handle-action-result.ts` (cliente) com `runAction(action, { onSuccess, onValidationError })`: envolve a chamada em `try/catch` (exceção → mensagem "Não foi possível salvar. Verifique sua conexão e tente novamente."), `UNAUTHENTICATED` → `router.push('/login')`, `VALIDATION` → `onValidationError(fieldErrors)`, `NOT_FOUND`/`UNKNOWN` → mensagem genérica; e testes unitários em `tests/unit/lib/handle-action-result.test.ts` cobrindo os quatro casos
- [X] T035 [US1] Criar `src/features/auth/components/login-form.tsx` (`"use client"` justificado: estado de formulário RHF) com campos email/senha, `zodResolver(signInSchema)`, chamada a `signIn` e mensagem genérica de erro
- [X] T036 [US1] Criar `src/app/login/page.tsx` (Server Component): se `getCurrentUserId()` retornar usuário, `redirect('/')`; senão renderiza `LoginForm` em um `Card`
- [X] T037 [P] [US1] Criar `src/features/auth/components/sign-out-button.tsx` (Server Component com `<form action={signOut}>` e botão "Sair") e `src/features/planning/components/app-header.tsx` (Server Component com título e `SignOutButton`)
- [X] T038 [US1] Criar `src/app/page.tsx` (Server Component): `const userId = await requireUserId()`; `const data = await getPlanningData(userId)`; renderiza `AppHeader` e um contêiner da tela de planejamento (as seções são adicionadas nas próximas histórias)

**Checkpoint**: User Story 1 funcional e testável sozinha (login, sessão persistente, sair, redirecionamentos).

---

## Phase 4: User Story 2 - Cadastro de ganhos e receita total (Priority: P1)

**Goal**: criar, editar e apagar ganhos e ver a receita total.

**Independent Test**: cadastrar três ganhos, conferir a receita, editar um, apagar outro, recarregar e verificar a persistência.

### Tests for User Story 2 ⚠️

- [X] T039 [P] [US2] Teste unitário de `incomeSchema` em `tests/unit/schemas/incomes.schemas.test.ts` (`name` obrigatório "1–100 caracteres após trim"; `amount` "> 0, no máximo 2 casas decimais, ≤ 999.999.999,99")
- [X] T040 [P] [US2] Teste de integração de `createIncome`, `updateIncome`, `deleteIncome` em `tests/integration/incomes.actions.test.ts`: caminho feliz persiste (valor `"1.250,50"` → `1250.50` no banco); `VALIDATION` não persiste; sem sessão → `UNAUTHENTICATED`; update/delete de ganho do usuário B pelo A → `NOT_FOUND` e registro de B intacto
- [X] T041 [P] [US2] Teste unitário do `IncomeForm` em `tests/unit/components/income-form.test.tsx` (modo criar e editar com valores iniciais; erros por campo; aplica `fieldErrors` do servidor via `setError`; action lança exceção → aviso de falha; action retorna `UNAUTHENTICATED` → redireciona para `/login`)
- [X] T042 [P] [US2] Teste unitário do `DeleteConfirmDialog` em `tests/unit/components/delete-confirm-dialog.test.tsx` (só chama `onConfirm` após confirmar; cancelar não chama)

### Implementation for User Story 2

- [X] T043 [P] [US2] Criar `src/features/incomes/schemas.ts` com `incomeSchema = z.object({ name: nameSchema, amount: amountSchema })` usando `src/lib/validation.ts`
- [X] T044 [US2] Implementar `src/features/incomes/actions.ts` (`"use server"`): `createIncome(input)`, `updateIncome(id, input)` (`updateMany({ where: { id, userId } })`; `count === 0` → `NOT_FOUND`), `deleteIncome(id)` (`deleteMany({ where: { id, userId } })`), seguindo as convenções de `contracts/server-actions.md`
- [X] T045 [P] [US2] Criar `src/features/planning/components/delete-confirm-dialog.tsx` (`"use client"` justificado: diálogo interativo) com `AlertDialog`, props `{ itemName: string; onConfirm: () => Promise<void> }` e texto "Apagar "{itemName}"?"
- [X] T046 [US2] Criar `src/features/incomes/components/income-form.tsx` (`"use client"` justificado: RHF) com modos criar/editar (`defaultValues`), `zodResolver(incomeSchema)`, chamada a `createIncome`/`updateIncome`, erro genérico em `UNKNOWN` e envio desabilitado durante o salvamento; chamadas à action via `runAction` (T034)
- [X] T047 [US2] Criar `src/features/incomes/components/income-list.tsx` (Server Component: lista nome e `formatBrl(amountCents)`, com `IncomeForm` em modo edição e `DeleteConfirmDialog` chamando `deleteIncome`; estado vazio "Nenhum ganho cadastrado") e `income-section.tsx` (Server Component: título "Ganhos", `IncomeForm` de criação, `IncomeList` e `SectionTotal` "Receita total")
- [X] T048 [US2] Adicionar `IncomeSection` a `src/app/page.tsx`, passando `data.incomes` e `data.revenueCents`

**Checkpoint**: User Stories 1 e 2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Divisão da receita com o slider (Priority: P2)

**Goal**: slider gastos essenciais × metas futuras (soma 100%), atualização em tempo real e salvamento automático ao soltar.

**Independent Test**: com receita cadastrada, mover para 70/30, conferir os valores planejados, recarregar e ver 70/30; primeiro acesso mostra 50/50.

### Tests for User Story 3 ⚠️

- [X] T049 [P] [US3] Teste unitário de `allocationSchema` em `tests/unit/schemas/allocation.schemas.test.ts` (`essentialPercentage` "inteiro 0–100": aceita 0, 50, 100; rejeita -1, 101, 50.5)
- [X] T050 [P] [US3] Teste de integração de `saveAllocation` em `tests/integration/allocation.actions.test.ts`: primeira chamada cria a linha; chamadas seguintes fazem upsert (última vence); `VALIDATION` para 101; `UNAUTHENTICATED` sem sessão; salvar como A não altera a divisão de B; `revalidatePath` não é chamado por `saveAllocation`
- [X] T051 [P] [US3] Teste unitário de `AllocationSlider` + `PlannedAmount` em `tests/unit/components/allocation-slider.test.tsx`: receita 600000 centavos e valor 70 → exibe "Gastos essenciais 70%" R$ 4.200,00 e "Metas futuras 30%" R$ 1.800,00; `onValueChange` atualiza sem chamar a action; `onValueCommit` chama `saveAllocation` uma vez; só o último commit define o estado "salvo"; falha mostra "Divisão não salva — tentar novamente"; action lança exceção → mesmo aviso de falha; action retorna `UNAUTHENTICATED` → redireciona para `/login`

### Implementation for User Story 3

- [X] T052 [P] [US3] Criar `src/features/allocation/schemas.ts` com `allocationSchema = z.object({ essentialPercentage: z.number().int().min(0).max(100) })`
- [X] T053 [US3] Implementar `src/features/allocation/actions.ts` (`"use server"`): `saveAllocation(input)` com `prisma.allocation.upsert({ where: { userId } })`, retornando `{ essentialPercentage }`, sem `revalidatePath` (exceção no contrato)
- [X] T054 [US3] Criar `src/features/allocation/components/allocation-provider.tsx` (`"use client"` justificado: estado compartilhado em tempo real do slider) com Context `{ essentialPercentage, setEssentialPercentage, saveStatus }`, valor inicial vindo do servidor lido só na montagem (`useState(initial)`, sem sincronizar depois) e hook `useAllocation()`; recebe as seções do servidor como `children`
- [X] T055 [US3] Criar `src/features/allocation/components/allocation-slider.tsx` (`"use client"` justificado: interação de arrastar) com o `Slider` do shadcn (`min 0`, `max 100`, `step 1`), rótulos "Gastos essenciais X%" / "Metas futuras Y%", `onValueChange` → contexto, `onValueCommit` → `saveAllocation` com `requestId` crescente (ignora respostas antigas), estados "Salvando…", "Salvo" e "Divisão não salva — tentar novamente"; o commit usa `runAction` (T034)
- [X] T056 [P] [US3] Criar `src/features/allocation/components/planned-amount.tsx` (`"use client"` justificado: depende da porcentagem em tempo real) com props `{ section: 'expenses' | 'goals'; revenueCents: number }`, exibindo a porcentagem e `formatBrl(calculatePlannedCents(...))`
- [X] T057 [US3] Atualizar `src/app/page.tsx`: envolver a tela em `AllocationProvider` com `data.essentialPercentage` e renderizar `AllocationSlider` e os dois `PlannedAmount` com `data.revenueCents`

**Checkpoint**: User Stories 1–3 funcionam de forma independente.

---

## Phase 6: User Story 4 - Gastos essenciais (Priority: P2)

**Goal**: criar, editar e apagar gastos com nome, valor e categoria obrigatória; exibir a soma.

**Independent Test**: criar dois gastos com categorias diferentes, conferir a soma, editar, apagar e recarregar.

### Tests for User Story 4 ⚠️

- [X] T058 [P] [US4] Teste unitário de `expenseSchema` em `tests/unit/schemas/expenses.schemas.test.ts` (`name`, `amount` como em incomes; `categoryId` "uuid obrigatório")
- [X] T059 [P] [US4] Teste de integração de `createExpense`, `updateExpense`, `deleteExpense` em `tests/integration/expenses.actions.test.ts`: caminho feliz; `categoryId` inexistente → `VALIDATION` em `categoryId`; sem categoria → `VALIDATION`; `UNAUTHENTICATED`; acesso cruzado A→B → `NOT_FOUND`
- [X] T060 [P] [US4] Teste unitário do `ExpenseForm` em `tests/unit/components/expense-form.test.tsx` (seleção de categoria obrigatória; sem categorias → "Nenhuma categoria disponível" e envio desabilitado; modo edição; action lança exceção → aviso de falha; action retorna `UNAUTHENTICATED` → redireciona para `/login`)

### Implementation for User Story 4

- [X] T061 [P] [US4] Criar `src/features/expenses/schemas.ts` com `expenseSchema = z.object({ name: nameSchema, amount: amountSchema, categoryId: z.string().uuid() })`
- [X] T062 [US4] Implementar `src/features/expenses/actions.ts` (`"use server"`): `createExpense`, `updateExpense`, `deleteExpense`; verificar a existência da categoria (`prisma.category.findUnique`) antes de gravar, retornando `VALIDATION` em `categoryId` se não existir
- [X] T063 [US4] Criar `src/features/expenses/components/expense-form.tsx` (`"use client"` justificado: RHF) com nome, valor e `Select` de categorias (props `categories: { id: string; name: string }[]`), integrado ao RHF via `Controller`; chamadas à action via `runAction` (T034)
- [X] T064 [US4] Criar `src/features/expenses/components/expense-list.tsx` (Server Component: nome, categoria, `formatBrl`, edição com `ExpenseForm` e exclusão com `DeleteConfirmDialog`; estado vazio) e `expense-section.tsx` (Server Component: título "Gastos essenciais", `PlannedAmount section="expenses"`, `ExpenseForm` de criação, `ExpenseList` e `SectionTotal` "Total de gastos")
- [X] T065 [US4] Adicionar `ExpenseSection` a `src/app/page.tsx` dentro do `AllocationProvider`, passando `data.expenses`, `data.categories`, `data.expensesTotalCents` e `data.revenueCents`

**Checkpoint**: User Stories 1–4 funcionam de forma independente.

---

## Phase 7: User Story 5 - Metas futuras (Priority: P2)

**Goal**: criar, editar e apagar metas com nome, valor e categoria opcional; exibir a soma.

**Independent Test**: criar uma meta sem categoria e outra com categoria, conferir a soma, editar, apagar e recarregar.

### Tests for User Story 5 ⚠️

- [X] T066 [P] [US5] Teste unitário de `goalSchema` em `tests/unit/schemas/goals.schemas.test.ts` (`categoryId` "uuid opcional"; aceita `null`/ausente; string vazia do select vira `null`)
- [X] T067 [P] [US5] Teste de integração de `createGoal`, `updateGoal`, `deleteGoal` em `tests/integration/goals.actions.test.ts`: com e sem categoria; `categoryId` informado e inexistente → `VALIDATION`; atualizar removendo a categoria; `UNAUTHENTICATED`; acesso cruzado A→B → `NOT_FOUND`
- [X] T068 [P] [US5] Teste unitário do `GoalForm` em `tests/unit/components/goal-form.test.tsx` (salva sem categoria; opção "Sem categoria"; modo edição; action lança exceção → aviso de falha; action retorna `UNAUTHENTICATED` → redireciona para `/login`)

### Implementation for User Story 5

- [X] T069 [P] [US5] Criar `src/features/goals/schemas.ts` com `goalSchema = z.object({ name: nameSchema, amount: amountSchema, categoryId: z.string().uuid().nullable().optional() })` (com `preprocess` de `""` → `null`)
- [X] T070 [US5] Implementar `src/features/goals/actions.ts` (`"use server"`): `createGoal`, `updateGoal`, `deleteGoal`; validar a existência da categoria apenas quando informada
- [X] T071 [US5] Criar `src/features/goals/components/goal-form.tsx` (`"use client"` justificado: RHF) com nome, valor e `Select` opcional com a opção "Sem categoria"; chamadas à action via `runAction` (T034)
- [X] T072 [US5] Criar `src/features/goals/components/goal-list.tsx` (Server Component, como `ExpenseList`, exibindo "Sem categoria" quando nula) e `goal-section.tsx` (Server Component: título "Metas futuras", `PlannedAmount section="goals"`, `GoalForm` de criação, `GoalList` e `SectionTotal` "Total de metas")
- [X] T073 [US5] Adicionar `GoalSection` a `src/app/page.tsx` dentro do `AllocationProvider`, passando `data.goals`, `data.categories`, `data.goalsTotalCents` e `data.revenueCents`

**Checkpoint**: User Stories 1–5 funcionam de forma independente.

---

## Phase 8: User Story 6 - Alerta de planejamento excedido (Priority: P3)

**Goal**: alerta destacado em cada seção quando a soma excede (estritamente) o valor planejado, reagindo em tempo real ao slider e às mutações.

**Independent Test**: receita R$ 4.000,00, 50/50, gastos R$ 2.100,00 → alerta; reduzir para R$ 2.000,00 → alerta some; mover o slider → alerta aparece/some na hora.

### Tests for User Story 6 ⚠️

- [X] T074 [P] [US6] Teste unitário do `OverBudgetAlert` em `tests/unit/components/over-budget-alert.test.tsx` dentro de um `AllocationProvider` de teste: receita 400000, 50%, total 210000 → `role="alert"` com "excedem o planejado em R$ 100,00"; total 200000 → nada renderizado; receita 0 e total 1 → alerta; mudar a porcentagem no contexto faz o alerta aparecer/sumir sem nova renderização do servidor; `section="goals"` usa `100 − porcentagem`

### Implementation for User Story 6

- [X] T075 [US6] Criar `src/features/planning/components/over-budget-alert.tsx` (`"use client"` justificado: depende da porcentagem em tempo real do slider) com props `{ section: 'expenses' | 'goals'; revenueCents: number; totalCents: number }`, usando `calculatePlannedCents`, `isOverBudget` e `getExcessCents`; renderiza o `Alert` destrutivo do shadcn com ícone, `role="alert"` e o texto "Planejamento incorreto: os gastos essenciais excedem o planejado em R$ X" / "Planejamento incorreto: as metas futuras excedem o planejado em R$ X"
- [X] T076 [US6] Adicionar `OverBudgetAlert` no topo de `src/features/expenses/components/expense-section.tsx` (`section="expenses"`, `totalCents = expensesTotalCents`) e de `src/features/goals/components/goal-section.tsx` (`section="goals"`, `totalCents = goalsTotalCents`)

**Checkpoint**: todas as histórias funcionam de forma independente.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T077 Escrever o teste unitário rastreável à spec em `tests/unit/specs/001-financial-planning.spec.test.ts` (Princípio II), com um `describe` por cenário referenciando a spec: US2 (R$ 5.000,00 + R$ 1.250,50 = R$ 6.250,50), US3 (R$ 6.000,00 a 70% → R$ 4.200,00 / R$ 1.800,00; padrão 50), US4 (R$ 1.500,00 + R$ 450,75 = R$ 1.950,75), US5 (R$ 500,00 + R$ 300,00 = R$ 800,00), US6 (R$ 4.000,00, 50%: R$ 2.100,00 → alerta; R$ 2.000,00 → sem alerta) e edge cases (R$ 0,10 + R$ 0,20 = R$ 0,30; 33% de R$ 100,01 arredondado; receita zero), usando `src/lib/money.ts` e `src/lib/planning.ts`
- [X] T078 [P] Revisar o layout responsivo da tela única em `src/app/page.tsx` (colunas no desktop, empilhado no celular) e estados vazios/erro de todas as seções
- [X] T079 [P] Auditar a conformidade com a constituição em todos os arquivos de `src/`: identificadores em inglês, comentários em português, todo `"use client"` com justificativa, nenhum import de `@/lib/prisma`, `@/lib/auth` ou `@/generated/prisma` em Client Components, toda query Prisma de dados de usuário com `userId`
- [X] T080 [P] Criar `README.md` com setup, variáveis de ambiente, como criar usuários no painel do Supabase, configuração de sessão (desligar "Inactivity timeout" e "Time-box user sessions") e comandos de teste
- [ ] T081 Rodar `npm test` (unit + integration) e garantir 100% de sucesso; conferir que existe teste de integração para cada uma das 12 Server Actions de `contracts/server-actions.md`
- [ ] T082 Executar a validação manual de `specs/001-financial-planning/quickstart.md` (passos 1–7) e registrar o resultado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup e BLOQUEIA todas as histórias.
- **User Stories (Phases 3–8)**: dependem do Foundational.
- **Polish (Phase 9)**: depende das histórias desejadas.

### User Story Dependencies

- **US1 (P1)**: após o Foundational; cria `src/app/page.tsx`, que as demais histórias editam.
- **US2 (P1)**: após US1 (precisa da página protegida); independente das demais.
- **US3 (P2)**: após US1; usa a receita da US2 para valores não nulos, mas é testável com receita zero.
- **US4 (P2)**: após US1 e US3 (`PlannedAmount` e `AllocationProvider`); componentes `DeleteConfirmDialog` vêm da US2 (T045).
- **US5 (P2)**: mesmas dependências da US4; independente da US4.
- **US6 (P3)**: após US3, US4 e US5 (alertas ficam dentro das seções).

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- Schemas → actions → componentes → integração em `src/app/page.tsx`.
- Tarefas que editam `src/app/page.tsx` (T038, T048, T057, T065, T073) NÃO são paralelas entre si.

### Parallel Opportunities

- Setup: T003–T007 em paralelo após T002.
- Foundational: T010–T017 e T019–T020 em paralelo após T008/T009; T018 → T021 → T022 em sequência; T022 depende de T020.
- Em cada história, todos os testes `[P]` e o schema `[P]` em paralelo.
- US4 e US5 podem ser desenvolvidas em paralelo, exceto as tarefas finais em `src/app/page.tsx`.

---

## Parallel Example: User Story 2

```bash
# Testes da US2 juntos:
Task: "Teste unitário de incomeSchema em tests/unit/schemas/incomes.schemas.test.ts"
Task: "Teste de integração das actions de ganhos em tests/integration/incomes.actions.test.ts"
Task: "Teste unitário do IncomeForm em tests/unit/components/income-form.test.tsx"
Task: "Teste unitário do DeleteConfirmDialog em tests/unit/components/delete-confirm-dialog.test.tsx"

# Depois, em paralelo:
Task: "Criar src/features/incomes/schemas.ts"
Task: "Criar src/features/planning/components/delete-confirm-dialog.tsx"
```

## Parallel Example: User Stories 4 e 5

```bash
Task: "T058–T064 (gastos essenciais)"
Task: "T066–T072 (metas futuras)"
# Em seguida, sequencialmente: T065 e T073 (ambas editam src/app/page.tsx)
```

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)

1. Phase 1: Setup
2. Phase 2: Foundational (CRÍTICO)
3. Phase 3: US1 (login/logout/isolamento)
4. Phase 4: US2 (ganhos e receita)
5. **PARAR e VALIDAR**: passos 1–3 do quickstart.

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → validar → demo
3. US2 → validar → demo (MVP)
4. US3 → slider
5. US4 + US5 → gastos e metas
6. US6 → alertas
7. Polish → teste da spec, auditoria, README, quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- [Story] mapeia a tarefa à história da spec para rastreabilidade
- Uma tarefa só está concluída quando seus testes exigidos pela constituição passam
- Commitar após cada tarefa ou grupo lógico
