# Research: Planejamento e Controle de gastos

**Feature**: `003-spending-control` | **Date**: 2026-11-09

A stack e a arquitetura vêm das features 001 e 002 (ver `specs/001-financial-planning/research.md`
e `specs/002-planning-tabs/research.md`). Esta pesquisa cobre apenas as decisões novas.

## R1. Rotas das duas partes (FR-001, FR-003, FR-004)

- **Decision**: `/planning` (Planejamento) e `/control` (Controle), em inglês (Princípio I).
  - O conteúdo atual de `src/app/page.tsx` passa para `src/app/planning/page.tsx`, sem mudar o
    comportamento das abas; a aba no endereço passa a ser `/planning?tab=present|future`
    (`buildPlanningTabUrl("income")` → `/planning`).
  - `/` → `/control`: tratado em `resolveAuthRedirect` (função pura do proxy), que para usuário
    logado em `/` devolve `/control`. `src/app/page.tsx` mantém um `redirect("/control")` como
    garantia, caso a requisição chegue à página sem passar pelo proxy.
  - Destino após o login: `HOME_PATH` passa a ser `/control` (login, `signIn` e proxy em `/login`).
- **Rationale**: uma rota por parte é o que o usuário pediu ("cada parte é uma página"); o
  redirecionamento no proxy evita um segundo salto (`/` → `/login` → `/` → `/control`).
- **Alternatives considered**: `redirects` no `next.config.ts` — roda antes do proxy e não
  diferencia usuário logado, gerando `/` → `/control` → `/login` para quem não tem sessão (funciona,
  mas com um salto a mais); manter o planejamento em `/` — contraria o pedido.

## R2. Navegação no topo (FR-002)

- **Decision**: `AppHeader` (Server Component) recebe `current: "planning" | "control"` da página e
  renderiza um `<nav aria-label="Seções">` com dois `<Link>` estilizados como botões
  (`buttonVariants`); o atual recebe `aria-current="page"` e a variante preenchida, o outro a
  variante `outline`. O título e o botão "Sair" continuam no header.
- **Rationale**: a página já sabe onde está, então não é preciso `usePathname` nem Client Component
  (Princípio III); `aria-current` cumpre a identificação para tecnologias assistivas.
- **Alternatives considered**: `usePathname` em um Client Component — exigiria `"use client"` sem
  necessidade; Tabs do Radix para navegação entre páginas — semântica errada (abas não são links).

## R3. Fuso horário e "mês atual" (FR-009, FR-021)

- **Decision**: o fuso do usuário é o fuso da aplicação, `America/Sao_Paulo`, definido em uma
  constante `APP_TIME_ZONE` em `src/lib/calendar.ts`. Funções puras, todas com `now: Date`
  injetável para testes:
  - `getToday(now)` → `"YYYY-MM-DD"` no fuso da aplicação (via `Intl.DateTimeFormat`).
  - `getMonthRange(today)` → `{ first: "YYYY-MM-01", last: "YYYY-MM-DD" }`.
  - `isInMonth(date, today)` e `isValidCalendarDate(date)` (rejeita `2026-02-30`).
  - `formatMonthLabel(today)` → "Novembro de 2026"; `formatDateBr(date)` → "09/11/2026".
- **Rationale**: a plataforma usa reais e o português do Brasil; os usuários são criados pelo
  administrador e estão no Brasil. Um fuso fixo é igual no cliente e no servidor, o que torna a
  validação "dentro do mês atual" determinística e testável, sem depender de um fuso informado pelo
  navegador.
- **Alternatives considered**: fuso enviado pelo navegador (cookie ou campo oculto) — atende a
  usuários fora do Brasil, mas cria divergência entre o que o cliente valida e o servidor aceita
  e adiciona estado; UTC — no Brasil, gastos lançados após as 21h cairiam no dia seguinte.
- **Registro**: a spec fala em "fuso do usuário"; esta decisão interpreta-o como o fuso de
  Brasília. Usuários em outro fuso ficam fora do escopo desta versão.

## R4. Data do gasto no banco

- **Decision**: coluna `spent_on DATE` (Prisma `DateTime @db.Date`). Na aplicação, a data circula
  como string `"YYYY-MM-DD"`; a conversão para `Date` (meia-noite UTC) só acontece na borda do
  Prisma, em `toDbDate`/`fromDbDate` de `src/lib/calendar.ts`.
- **Rationale**: o gasto tem um dia, não um instante; `DATE` evita deslocamentos de fuso ao ler e
  gravar, e strings ISO se comparam e ordenam corretamente como texto.
- **Alternatives considered**: `timestamptz` — reintroduz o problema do fuso; string `varchar(10)`
  — perde a validação de data do banco.

## R5. Validação da data dentro do mês atual

- **Decision**: o schema Zod é criado por uma fábrica `createActualExpenseSchema(today)`; o campo
  `spentOn` exige formato `YYYY-MM-DD`, data válida e `isInMonth(spentOn, today)`, com a mensagem
  "A data deve estar dentro do mês atual."
  - **Cliente**: o formulário usa `createActualExpenseSchema(getToday(new Date()))` e o
    `<input type="date">` recebe `min`/`max` do mês atual.
  - **Servidor**: a action usa `createActualExpenseSchema(getToday(new Date()))` no momento de
    salvar (cobre a virada do mês com o formulário aberto).
  - Uma `CHECK` no banco não é usada para o mês, porque depende do relógio; a regra fica na
    aplicação.
- **Rationale**: o mesmo schema nos dois lados (Princípio IV), com o "hoje" injetado para teste.
- **Alternatives considered**: `refine` lendo `new Date()` dentro do schema — difícil de testar.

## R6. Seletor de data

- **Decision**: `<input type="date">` nativo, com o componente `Input` do shadcn/ui, `min` e `max`
  no primeiro e no último dia do mês e valor padrão `getToday()`.
- **Rationale**: acessível e com teclado no desktop e no celular, sem dependência nova; o valor já
  vem como `YYYY-MM-DD`.
- **Alternatives considered**: shadcn `calendar` + `popover` (react-day-picker) — mais
  dependências e mais testes para o mesmo resultado.

## R7. Gráfico (FR-018, FR-019)

- **Decision**: shadcn/ui `chart` (Recharts 3), adicionado com `npx shadcn@4.23.0 add chart`, em um
  Client Component `SpendingChart`:
  - `LineChart` com eixo X nos dias do mês (1 a último dia) e eixo Y em reais;
  - uma linha com o gasto acumulado (`type="stepAfter"`), que vai até o maior entre hoje e a data
    do último gasto do mês; os dias seguintes ficam sem valor;
  - `ReferenceLine` horizontal no total planejado, rotulada "Limite";
  - `accessibilityLayer` do Recharts, `role="img"` com `aria-label`, e um resumo textual visível
    apenas para leitores de tela: "Gasto acumulado de R$ X de um limite de R$ Y em Novembro de
    2026".
  - A série é calculada pela função pura `buildCumulativeSeries(expenses, today)` em
    `src/lib/spending.ts`, testada isoladamente.
- **Rationale**: o shadcn `chart` mantém o mesmo kit de UI e o tema (cores via CSS variables); a
  lógica numérica fica fora do componente, em centavos (regra de dinheiro da feature 001).
- **Alternatives considered**: SVG desenhado à mão — menos dependências, mas eixos, tooltip e
  responsividade dariam mais trabalho; Chart.js — fora do ecossistema do shadcn/ui.
- **Testes**: o Recharts depende de medidas do layout, ausentes no jsdom; o polyfill de
  `ResizeObserver` já existe. Os testes do componente verificam o resumo acessível e a presença do
  gráfico; os valores da série são testados em `buildCumulativeSeries`.

## R8. Dashboard: dados e troca de categoria (FR-014–FR-017, FR-020)

- **Decision**: a página `/control` (Server Component) carrega, com uma única consulta por
  tabela: categorias, gastos planejados agrupados por categoria (soma em centavos) e os gastos
  realizados do mês atual do usuário. Um Client Component `ControlDashboard` guarda a categoria
  selecionada (`"all"` por padrão) e filtra no navegador; os números saem de funções puras em
  `src/lib/spending.ts`: `getPlannedCents(plannedByCategory, selection)`,
  `filterActualExpenses(expenses, selection)` e `getAvailableCents(planned, spent)`.
- **Rationale**: o volume de um mês é pequeno (dezenas a centenas de itens); filtrar no cliente
  troca a categoria sem ida ao servidor (SC-004 < 1 s) e sem recarregar (FR-020). Após criar,
  editar ou apagar, `revalidatePath("/control")` traz os dados novos e a seleção, que fica no
  estado do cliente, é mantida.
- **Alternatives considered**: categoria no endereço com nova renderização no servidor — uma ida
  ao servidor por troca e a spec não exige o endereço; consulta por categoria em Server Action —
  mais endpoints sem ganho.

## R9. Nome do novo domínio

- **Decision**: modelo `ActualExpense` (tabela `actual_expenses`), domínio `src/features/control`.
  Na interface, o item continua "gasto" (Assumptions da spec).
- **Rationale**: diferencia sem ambiguidade do `Expense` (gasto planejado do Momento Presente) e
  mantém os nomes do código em inglês (Princípio I).
- **Alternatives considered**: `Transaction` — sugere receitas e transferências; `Spending` —
  substantivo incontável, estranho como nome de registro.

## R10. Revalidação entre páginas

- **Decision**: actions do planejamento passam a chamar `revalidatePath("/planning")` e
  `revalidatePath("/control")` (o planejado por categoria aparece no Controle); actions do
  Controle chamam `revalidatePath("/control")`. `saveAllocation` continua sem revalidar (o slider
  não entra no Controle).
- **Rationale**: as páginas leem cookies e já são dinâmicas; a revalidação descarta o cache do
  roteador no cliente e cumpre o caso de borda "mudanças no planejamento refletem no Controle".
