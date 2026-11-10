---

description: "Task list for feature 004-visual-redesign"
---

# Tasks: Redesign visual da plataforma

**Input**: Design documents from `/specs/004-visual-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/design-tokens.md,
contracts/ui.md, quickstart.md; referência visual em `docs/design/redesign/`

**Tests**: OBRIGATÓRIOS pela constituição (Princípio II): teste unitário para cada funcionalidade
nova, testes de design que verificam o Princípio VI (contraste e tokens) e teste unitário
rastreável à spec. Nenhum endpoint novo ou alterado: os testes de integração das features 001–003
continuam válidos e não precisam mudar. Escrever os testes antes e vê-los falhar.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Princípio VI: nenhum componente em `src/app`, `src/features` ou `src/components` (fora de
  `src/components/ui`, que é código do shadcn/ui) pode ter cor literal (hex, `rgb(`, `hsl(`,
  `oklch(`), classe arbitrária de cor ou tamanho (`bg-[#…]`, `text-[13px]`) ou cor da paleta
  bruta (`bg-pink-600`). Usar só os tokens de [contracts/design-tokens.md](./contracts/design-tokens.md)
  (`bg-primary`, `text-muted-foreground`, `bg-present`, `bg-section`, `bg-category-food-soft`…).
- Larguras: classes base valem para o celular (a partir de 360 px); `tablet:` (≥ 720 px) e
  `lg:` para telas maiores. Alvos de toque com no mínimo 44 px (`min-h-11`, `size-11`).
- Textos novos vêm de `src/lib/control-labels.ts` ou `src/lib/planning-labels.ts`; textos
  existentes das features 001–003 não mudam.
- Ícones: `lucide-react`, sempre com `aria-hidden="true"` quando decorativos.
- Todo `"use client"` novo com comentário em português justificando (Princípio III).
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]` (primeira linha
  ≤ 72 caracteres), na branch `004-visual-redesign`, com testes unitários, `tsc` e lint passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Adicionar o componente de painel do shadcn/ui com `npx shadcn@4.23.0 add sheet -y`, gerando `src/components/ui/sheet.tsx`; incluir, na linha seguinte ao `"use client"`, o comentário "// Client Component: primitivo do Radix UI (shadcn/ui) que depende de estado, foco e eventos do navegador."; conferir que `npm run test:unit` e `npx tsc --noEmit` continuam passando

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, fonte e peças compartilhadas que todas as histórias usam

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Escrever testes unitários em `tests/unit/lib/contrast.test.ts` para `src/lib/contrast.ts`: `contrastRatio("#FFFFFF", "#000000")` → `21`; `contrastRatio("#FFFFFF", "#FFFFFF")` → `1`; simétrico (`(a,b) === (b,a)`); `contrastRatio("#DB2777", "#FFFFFF")` arredondado a 2 casas → `4.6`; aceita `#rgb` curto (`"#fff"`); `parseHex` lança erro para `"red"` e `"#12345"`
- [X] T003 [P] Implementar `src/lib/contrast.ts` (função pura, fórmula de luminância relativa do WCAG 2.1) com `parseHex` e `contrastRatio(a, b)` até T002 passar
- [X] T004 Escrever `tests/unit/design/contrast.test.ts`: ler `src/app/globals.css` com `fs`, extrair as variáveis de `:root` (claro) e do bloco `@media (prefers-color-scheme: dark)` (escuro) com uma função auxiliar no próprio teste, e verificar com `contrastRatio`, em cada tema, os pares listados em "Pares de contraste verificados por teste" de [contracts/design-tokens.md](./contracts/design-tokens.md) (≥ 4,5 e ≥ 3); a mensagem de falha deve dizer o tema, o par e a razão obtida
- [X] T005 Reescrever os tokens em `src/app/globals.css` conforme [contracts/design-tokens.md](./contracts/design-tokens.md): (a) trocar `@custom-variant dark (&:is(.dark *))` por `@custom-variant dark (@media (prefers-color-scheme: dark))`; (b) em `:root`, os valores claros em hex (base do shadcn/ui remapeada + `brand-soft`, `brand-ink`, `danger-soft`, `chart-limit`, `income|present|future` com `-foreground`, `-soft`, `-ink`, `category-<key>` e `category-<key>-soft` para `food, housing, transport, health, leisure, emergency, travel, education, bills, investments, other, neutral, none`), `--radius: 0.75rem`; (c) o mesmo conjunto com os valores escuros dentro de `@media (prefers-color-scheme: dark) { :root { … } }`, removendo o bloco `.dark`; (d) em `@theme inline`, expor cada token novo como `--color-<nome>: var(--<nome>)` e adicionar `--breakpoint-tablet: 45rem`; (e) regras `[data-section="income"|"present"|"future"]` definindo `--section`, `--section-foreground`, `--section-soft`, `--section-ink` a partir dos tokens da parte, e `--color-section*` no `@theme`; (f) manter `chart-1..5` e `sidebar-*` apontando para tokens existentes; (g) token de tamanho `--text-display: clamp(2.5rem, 11vw, 4rem)` exposto como utilitário `text-display` (com `--text-display--line-height: 1.05`) e espaçamento `--spacing-safe-bottom: env(safe-area-inset-bottom)` para o botão fixo; usar o laranja `#EE6A10` (divergência registrada no plano); até T004 passar
- [X] T006 [P] Escrever `tests/unit/design/tokens.test.ts`: varrer recursivamente `src/app`, `src/features` e `src/components` (excluindo `src/components/ui/`, código do shadcn/ui) por arquivos `.tsx`/`.ts` e falhar listando arquivo e linha se encontrar `#[0-9a-fA-F]{3,8}\b` em string/className, `rgb(`, `rgba(`, `hsl(`, `oklch(`, `-[#`, `text-[<n>px]` ou `(bg|text|border|fill|stroke|ring|from|to|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}`; deve passar já no código atual (após T005) e proteger as próximas tarefas
- [X] T007 Trocar a fonte em `src/app/layout.tsx`: `DM_Sans` de `next/font/google` (`weight: ["400","500","600","700"]`, `subsets: ["latin"]`, `variable: "--font-sans"`), removendo `Geist` e `Geist_Mono` e a variável `--font-mono` de `globals.css` se não for usada; `body` com `bg-background text-foreground font-sans`
- [X] T008 [P] Adicionar a variante `section` em `src/components/ui/button.tsx` (`bg-section text-section-foreground hover:bg-section/90 focus-visible:ring-section/50`) e documentar com um comentário em português que ela usa a cor da parte ativa do Planejamento (`data-section`)
- [X] T009 [P] Escrever testes unitários em `tests/unit/lib/category-style.test.ts` para `src/lib/category-style.ts`: `getCategoryStyle("Alimentação")` → `{ key: "food", Icon: Utensils }`; idem para os 11 nomes do seed conforme o mapa de [data-model.md](./data-model.md) (Moradia→`housing`/House, Transporte→`transport`/Car, Saúde→`health`/Heart, Lazer→`leisure`/Star, Reserva de Emergência→`emergency`/ShieldCheck, Viagem→`travel`/Plane, Educação→`education`/BookOpen, Contas e Serviços→`bills`/Zap, Investimentos→`investments`/TrendingUp, Outros→`other`/CircleEllipsis); nome desconhecido (`"Pets"`) → `{ key: "neutral", Icon: CircleEllipsis }`; `getCategoryStyle(null)` → `{ key: "none", Icon: Target }`
- [X] T010 [P] Implementar `src/lib/category-style.ts` (mapa por nome, sem React além dos componentes de ícone do `lucide-react`; tipo `CategoryKey`) até T009 passar
- [X] T011 [P] Escrever testes em `tests/unit/components/category-icon.test.tsx`: `CategoryIcon` com `categoryName="Moradia"` renderiza um elemento `aria-hidden="true"` com as classes `bg-category-housing-soft` e `text-category-housing`, tamanho `size-10`; com `categoryName={null}` usa `bg-category-none-soft text-category-none`
- [X] T012 [P] Implementar `src/components/category-icon.tsx` (Server Component; quadrado `size-10 rounded-xl` com o `Icon` de `getCategoryStyle`, `size-5`, `strokeWidth={2}`; classes de cor montadas por um mapa estático `key → "bg-category-<key>-soft text-category-<key>"` para o Tailwind encontrar as classes) até T011 passar
- [X] T013 [P] Escrever testes em `tests/unit/components/usage-bar.test.tsx`: `UsageBar value={50} tone="brand"` renderiza o trilho `bg-muted` com `aria-hidden="true"` e o preenchimento com `style.width = "50%"` e `bg-primary`; `value={150}` limita a `100%`; `tone="danger"` usa `bg-destructive`; `tone="section"` usa `bg-section`; `tone="present"` usa `bg-present`
- [X] T014 [P] Implementar `src/components/usage-bar.tsx` (Server Component; altura `h-2`, `rounded-full`; prop `value` 0–100 limitada; `tone`: `brand | section | income | present | future | danger`; a largura via `style` é a única exceção a classes, por ser dado) até T013 passar
- [X] T015 [P] Acrescentar a `tests/unit/lib/spending.test.ts` os testes de `getUsedPercentage(spentCents, plannedCents)`: `(75000, 150000)` → `50`; `(160500, 150000)` → `107`; `(0, 0)` → `0`; `(100, 0)` → `null`; `(1, 3)` → `33`; e de `getUsageBarPercentage(used)`: `50` → `50`, `107` → `100`, `null` → `100`
- [X] T016 Implementar `getUsedPercentage` e `getUsageBarPercentage` em `src/lib/spending.ts` até T015 passar
- [X] T017 [P] Acrescentar testes de textos novos: em `tests/unit/lib/planning-labels.test.ts`, `incomeCountLabel(0)` → `"Nenhum ganho cadastrado"`, `(1)` → `"1 ganho cadastrado"`, `(2)` → `"2 ganhos cadastrados"` e `PLANNING_SUBTITLE` = `"Defina sua receita e divida entre o Momento Presente e o Momento Futuro."`; em `tests/unit/lib/control-labels.test.ts`, `SUMMARY_LABELS.used` = `"Usado"`, `usedLabel(107)` → `"107%"`, `usedLabel(null)` → `"—"`, `REGISTER_BUTTON_LABEL` = `"Registrar gasto"`, `EDIT_SHEET_TITLE` = `"Editar gasto"`, `dateHint("Novembro de 2026")` → `"Somente dias de novembro de 2026."`
- [X] T018 Implementar os textos de T017 em `src/lib/planning-labels.ts` e `src/lib/control-labels.ts` até T017 passar

**Checkpoint**: tokens, fonte, ícones, barra de uso e regras novas prontos; testes de design passando.

---

## Phase 3: User Story 1 - Identidade visual em todas as telas (Priority: P1) 🎯 MVP

**Goal**: cabeçalho, login, cards, formulários e diálogos no visual da referência, nos temas claro e escuro.

**Independent Test**: abrir Login, Controle e Planejamento em claro e escuro (emulação de `prefers-color-scheme`) e conferir fonte, cores, cabeçalho e contraste contra a referência.

### Tests for User Story 1 ⚠️

- [X] T019 [P] [US1] Atualizar `tests/unit/components/app-header.test.tsx`: além dos testes atuais (links, `aria-current`, "Sair"), o logo é um elemento `aria-hidden="true"` com `bg-primary`, e o link atual tem a classe `border-primary` (sublinhado) e o outro `border-transparent`
- [X] T020 [P] [US1] Atualizar `tests/unit/components/login-form.test.tsx`: o erro de credenciais continua "Email ou senha inválidos." e agora está num elemento `role="alert"` com `bg-danger-soft` e `text-destructive`; o botão "Entrar" tem altura mínima `min-h-11`

### Implementation for User Story 1

- [X] T021 [US1] Restilizar `src/features/planning/components/app-header.tsx` conforme [contracts/ui.md](./contracts/ui.md) (logo `size-7 rounded-lg bg-primary text-primary-foreground` com ícone decorativo; nome `font-bold`; links como texto com `border-b-2` — atual `border-primary text-foreground font-semibold`, outro `border-transparent text-muted-foreground` —, `min-h-11`; `flex-wrap` para quebrar no celular; "Sair" `variant="outline"`) até T019 passar
- [X] T022 [US1] Restilizar `src/app/login/page.tsx` e `src/features/auth/components/login-form.tsx`: tela centrada `min-h-svh` com padding, bloco do logo (`size-12 rounded-2xl bg-primary`), título "Finanças Pessoais", frase atual, card `bg-card border rounded-xl p-6` com o formulário, erro `role="alert" rounded-lg bg-danger-soft text-destructive`, botão "Entrar" largura total `min-h-11`, e a nota "O acesso é criado pelo administrador da plataforma." em `text-muted-foreground`; até T020 passar
- [X] T023 [P] [US1] Restilizar os componentes compartilhados para o visual de superfície com borda fina e tokens: `src/features/planning/components/delete-confirm-dialog.tsx`, `src/features/planning/components/over-budget-alert.tsx` (fundo `bg-danger-soft`, texto `text-destructive`, ícone de alerta, título "Planejamento incorreto"), `src/features/planning/components/section-total.tsx` (linha com rótulo e valor `font-semibold tabular-nums`) e `src/features/planning/components/category-select.tsx` (`min-h-11`); manter textos e testes existentes passando

**Checkpoint**: identidade aplicada; claro e escuro funcionando.

---

## Phase 4: User Story 2 - Controle redesenhado (Priority: P1)

**Goal**: "Disponível" em destaque, barra e Usado %, gráfico com área, ícones por categoria e formulário na coluna à direita.

**Independent Test**: no computador, com gastos planejados e realizados, alternar "Todos" e uma categoria (inclusive acima do limite) e conferir destaque, barra, percentual, gráfico, ícones e posição do formulário.

### Tests for User Story 2 ⚠️

- [X] T024 [P] [US2] Atualizar `tests/unit/components/spending-summary.test.tsx`: com planejado 150000 e gasto 75000 → texto "Disponível", valor "R$ 750,00" com a classe `text-display`, "Gasto R$ 750,00", "Planejado R$ 1.500,00", "Usado 50%" e uma `UsageBar` com 50%; com gasto 160500 → valor "-R$ 105,00" com `text-destructive`, ícone de alerta, "Acima do limite em R$ 105,00", "Usado 107%" e barra `bg-destructive` a 100%; com planejado 0 e gasto 100 → "Usado —"
- [X] T025 [P] [US2] Atualizar `tests/unit/components/spending-chart.test.tsx`: continua expondo `role="img"` com o resumo acessível; a legenda mostra "Limite R$ 1.500,00"; o gráfico usa área: o contêiner `data-slot="chart"` renderiza um elemento com a classe `recharts-area` e nenhum `recharts-line`
- [X] T026 [P] [US2] Atualizar `tests/unit/components/actual-expense-list.test.tsx`: cada item mostra um `CategoryIcon` da sua categoria (ex.: `bg-category-food-soft` para Alimentação), nome, data, valor e as ações; com `showCategory={false}` o nome da categoria some mas o ícone continua
- [X] T027 [P] [US2] Atualizar `tests/unit/components/actual-expense-form.test.tsx`: o campo "Data" tem a dica "Somente dias de novembro de 2026." associada por `aria-describedby`

### Implementation for User Story 2

- [X] T028 [US2] Reescrever `src/features/control/components/spending-summary.tsx`: bloco "Disponível" (rótulo `text-muted-foreground`; valor `text-display font-semibold tracking-tight tabular-nums` (token de T005); negativo `text-destructive` + `TriangleAlert` + `overLimitMessage`), `UsageBar` (`tone` `brand` ou `danger`, `value` de `getUsageBarPercentage(getUsedPercentage(...))`) e `dl` com "Gasto", "Planejado" e "Usado" (`usedLabel`); até T024 passar
- [X] T029 [US2] Trocar o gráfico em `src/features/control/components/spending-chart.tsx` para `AreaChart`/`Area` (`type="stepAfter"`, `stroke="var(--primary)"`, `fill="var(--brand-soft)"`, `fillOpacity={1}`, `connectNulls={false}`, `isAnimationActive={false}`) e `ReferenceLine` com `stroke="var(--chart-limit)"` e `strokeDasharray="6 5"`; legenda abaixo com o marcador tracejado e "Limite R$ X"; manter o resumo acessível; até T025 passar
- [X] T030 [US2] Atualizar `src/features/control/components/actual-expense-list.tsx`: `CategoryIcon` à esquerda de cada item, nome `font-semibold`, linha secundária `text-muted-foreground` com data e (em "Todos") categoria, valor `font-semibold tabular-nums`, ações com `size-11`; até T026 passar
- [X] T031 [US2] Atualizar `src/features/control/components/actual-expense-form.tsx`: dica `dateHint(formatMonthLabel(today))` abaixo do campo de data ligada por `aria-describedby`; campos `min-h-11`; formulário em coluna (layout do card da direita); até T027 passar
- [X] T032 [US2] Reorganizar `src/features/control/components/control-dashboard.tsx` e `src/app/control/page.tsx` conforme [contracts/ui.md](./contracts/ui.md): `main` `max-w-6xl` com `flex flex-wrap gap-10`; coluna principal (`flex-[999_1_560px] min-w-0`) com o mês e a seleção de categoria, `SpendingSummary`, `SpendingChart` e a lista "Gastos do mês"; `aside` (`flex-[1_1_300px]`, `hidden tablet:flex`) com o card "Registrar gasto" (`bg-card border rounded-xl p-5`); remover o título "Controle de <mês>" da página, substituído pelo mês discreto na coluna; testes de `control-dashboard.test.tsx` continuam passando (ajustar seletores só se mudarem papéis/textos)

**Checkpoint**: Controle no desktop igual à referência.

---

## Phase 5: User Story 3 - Planejamento redesenhado com cor por parte (Priority: P1)

**Goal**: título grande, cards de resumo como abas na cor de cada parte, cor da aba ativa nos botões e slider, conteúdo em uma coluna.

**Independent Test**: abrir o Planejamento, conferir os três cards e cores, trocar de card (cores, endereço, teclado) e mover o slider até o Momento Presente exceder.

### Tests for User Story 3 ⚠️

- [X] T033 [P] [US3] Escrever testes em `tests/unit/components/summary-tab-card.test.tsx` para `SummaryTabCard` (dentro de `Tabs`/`TabsList` do Radix): com `part="present"`, `label="Momento Presente"`, `value="R$ 3.125,25"`, `summary="50% da receita · gastos R$ 2.750,00 (88%)"`, `usage={88}`: a aba tem nome acessível "Momento Presente" e descrição com o valor e o resumo (`aria-describedby`); ícone com `bg-present-soft` quando não selecionada e `bg-present` quando selecionada; borda `border-present` quando selecionada e `border-border` quando não; com `alert` → nome "Momento Presente, com alerta", resumo `text-destructive` e `UsageBar tone="danger"`; com `part="income"` não há barra
- [X] T034 [P] [US3] Atualizar `tests/unit/components/planning-tabs.test.tsx`: manter os testes atuais (ordem e nomes das abas, `replaceState`, setas, permanência após `rerender`, "Momento Presente, com alerta"); acrescentar: o contêiner tem `data-section="income"` e muda para `"present"` ao clicar em "Momento Presente"; o card Receita mostra o total e "2 ganhos cadastrados" (prop `incomeCount={2}`); o card Momento Presente mostra o planejado ao vivo (slider em 50% com receita 625050 → "R$ 3.125,25") e "50% da receita · gastos R$ 2.750,00 (88%)"
- [X] T035 [P] [US3] Escrever testes em `tests/unit/components/split-bar.test.tsx`: `SplitBar` dentro de `AllocationProvider` (como em `allocation-slider.test.tsx`) com 50% renderiza dois segmentos `aria-hidden` com `bg-present` (largura 50%) e `bg-future`; ao mover o slider para 70% (via `AllocationSlider` na mesma árvore), o segmento presente passa a 70%
- [X] T036 [P] [US3] Atualizar `tests/unit/components/allocation-slider.test.tsx`: os rótulos "Momento Presente X%" e "Momento Futuro Y%" têm marcadores `bg-present` e `bg-future`; o slider usa a cor da seção (classe com `section`)
- [X] T037 [P] [US3] Atualizar os testes de listas e formulários do planejamento que mudarem de estrutura: `tests/unit/components/expense-form.test.tsx`, `goal-form.test.tsx`, `income-form.test.tsx` (botões de enviar com `variant="section"`, ou seja, classe `bg-section`; textos e chamadas das actions iguais) e criar `tests/unit/components/planning-lists.test.tsx` verificando que `ExpenseList` e `GoalList` mostram `CategoryIcon` por item (meta sem categoria → `bg-category-none-soft`)

### Implementation for User Story 3

- [X] T038 [US3] Implementar `src/features/planning/components/summary-tab-card.tsx` (renderiza um `TabsTrigger` com `asChild` ou conteúdo próprio; card `rounded-2xl border-2 bg-card p-5 text-left min-h-32` com ícone da parte — Receita `Wallet`, Momento Presente `Clock`, Momento Futuro `TrendingUp` —, rótulo com `id`, `TabAlertIndicator`, valor `text-2xl font-semibold tabular-nums`, `UsageBar` e resumo; classes por parte a partir de um mapa estático `income|present|future`; `aria-labelledby` = rótulo + indicador, `aria-describedby` = valor + resumo) até T033 passar
- [X] T039 [US3] Reescrever `src/features/planning/components/planning-tabs.tsx`: nova prop `incomeCount`; `Tabs` com `data-section={tab}`; `TabsList` como `grid gap-3 grid-cols-1 tablet:grid-cols-3` (sem fundo); três `SummaryTabCard` com valores calculados no cliente a partir de `useAllocation()` (planejado de cada momento, `getUsedPercentage`, `incomeCountLabel`, alertas com `useOverBudget`); `TabsContent` em `max-w-3xl` uma coluna; manter `replaceState`/`parsePlanningTab`; até T034 passar
- [X] T040 [P] [US3] Implementar `src/features/allocation/components/split-bar.tsx` (`"use client"` com comentário: acompanha o slider em tempo real; lê `useAllocation()`; dois segmentos `h-3 rounded-full overflow-hidden`, `bg-present` com largura = % do Momento Presente e `bg-future` no restante) até T035 passar
- [X] T041 [US3] Restilizar `src/features/allocation/components/allocation-section.tsx` e `allocation-slider.tsx`: seção "Divisão da receita" sem card (título `text-xl font-semibold`, descrição atual), rótulos com marcadores `size-2.5 rounded-full bg-present`/`bg-future` e valores planejados, `SplitBar` e o slider com a cor da seção (trilho preenchido `bg-section`, polegar `border-section`); até T036 passar
- [X] T042 [US3] Restilizar as seções do planejamento em `src/features/incomes/components/{income-section,income-form,income-list}.tsx`, `src/features/expenses/components/{expense-section,expense-form,expense-list}.tsx` e `src/features/goals/components/{goal-section,goal-form,goal-list}.tsx`: sem `Card` externo; título `text-xl font-semibold` e, nos momentos, "Planejado: R$ X (Y% da receita)"; formulário em linha num bloco `rounded-2xl border bg-card p-4` com `grid gap-3 grid-cols-1 sm:grid-cols-2 tablet:grid-cols-[1fr_9rem_12rem_auto]`, campos `min-h-11` e botão `variant="section"`; listas com `CategoryIcon` (ganhos: ícone `Wallet` em `bg-brand-soft text-brand-ink`), itens com divisória `border-b`; total no fim com `SectionTotal`; edição continua na linha; até T037 passar
- [X] T043 [US3] Atualizar `src/app/planning/page.tsx`: título `h1` "Planejamento" (`text-4xl font-bold tracking-tight`) e `PLANNING_SUBTITLE` (`text-muted-foreground`) acima das abas; passar `incomeCount={data.incomes.length}`; ordem da aba Receita: `AllocationSection` antes de `IncomeSection`; `main` `max-w-6xl`

**Checkpoint**: Planejamento igual à referência, com cor por parte e alertas nos cards.

---

## Phase 6: User Story 4 - Telas no celular, com registro rápido de gasto (Priority: P2)

**Goal**: todas as telas funcionando em 360 px; no Controle abaixo de 720 px, botão fixo "+ Registrar gasto" e painel de registro/edição.

**Independent Test**: em 360 px, percorrer as telas sem rolagem horizontal; no Controle, abrir o painel pelo botão fixo, fechar por X/fora/Esc, registrar e editar um gasto pelo painel.

### Tests for User Story 4 ⚠️

- [X] T044 [P] [US4] Escrever testes em `tests/unit/hooks/use-is-narrow.test.ts` para `useIsNarrow()` (com `window.matchMedia` simulado): retorna `true` quando `(max-width: 44.99rem)` casa e `false` caso contrário; atualiza ao disparar o evento `change`; remove o listener ao desmontar
- [X] T045 [P] [US4] Escrever testes em `tests/unit/components/actual-expense-sheet.test.tsx` (mockar `@/features/control/actions`, `next/navigation` e `useIsNarrow` → `true`; fixar a data como nos testes do formulário): o botão "Registrar gasto" (com ícone `+`) tem `aria-haspopup="dialog"`; ao clicar, abre um `role="dialog"` com título "Registrar gasto", data padrão hoje e "Adicionar gasto", e o foco fica dentro do diálogo; `Escape` e o botão "Fechar" fecham o diálogo e devolvem o foco ao botão; registrar com sucesso (`createActualExpense` → ok) fecha o diálogo; com erro `VALIDATION` o diálogo continua aberto mostrando o erro; `openEdit(item)` abre "Editar gasto" com os campos preenchidos e "Salvar" chamando `updateActualExpense(id, …)`; quando `useIsNarrow` muda para `false` com o painel aberto, o painel fecha
- [X] T046 [P] [US4] Acrescentar a `tests/unit/components/actual-expense-list.test.tsx`: com `useIsNarrow` → `true` e dentro do `ActualExpenseSheetProvider`, clicar em "Editar Mercado" abre o diálogo "Editar gasto" (e não a edição na linha); com `false`, a edição continua na linha
- [X] T047 [P] [US4] Acrescentar a `tests/unit/components/actual-expense-form.test.tsx`: com `onSuccess` informado, o callback é chamado após sucesso; no modo `edit` controlado (`showTrigger={false}`), o formulário aparece direto, sem o botão-lápis

### Implementation for User Story 4

- [X] T048 [P] [US4] Implementar `src/hooks/use-is-narrow.ts` (`"use client"` com comentário: depende de `window.matchMedia`; `useSyncExternalStore` com `matchMedia("(max-width: 44.99rem)")`, `false` no servidor) até T044 passar
- [X] T049 [US4] Atualizar `src/features/control/components/actual-expense-form.tsx`: props `onSuccess?: () => void` (chamada após sucesso, depois do `reset`/`onDone`) e `showTrigger?: boolean` (padrão `true`; com `false` no modo `edit`, renderiza os campos direto); até T047 passar
- [X] T050 [US4] Implementar `src/features/control/components/actual-expense-sheet.tsx` (`"use client"` com comentário: estado do painel e diálogo interativo): `ActualExpenseSheetProvider` (contexto com `openCreate()`, `openEdit(item)`, `close()`; fecha quando `useIsNarrow()` vira `false`), `RegisterExpenseButton` (barra `fixed inset-x-0 bottom-0 z-10 border-t bg-background p-3 tablet:hidden`, com espaço inferior extra pelo token `safe-bottom` de T005, e `Button` largura total `min-h-13` "+ Registrar gasto") e o `Sheet side="bottom"` (cantos superiores arredondados, `max-h-[90svh]` via token, título "Registrar gasto"/"Editar gasto", botão fechar com `aria-label="Fechar"`) contendo `ActualExpenseForm` com `onSuccess={close}`; até T045 passar
- [X] T051 [US4] Atualizar `src/features/control/components/actual-expense-list.tsx`: quando `useIsNarrow()` é `true` e há `ActualExpenseSheetProvider`, o botão "Editar <nome>" chama `openEdit(item)` em vez de abrir a edição na linha; até T046 passar
- [X] T052 [US4] Atualizar `src/app/control/page.tsx`: envolver dashboard e formulário no `ActualExpenseSheetProvider`, renderizar `RegisterExpenseButton` e o painel, e dar ao `main` espaço inferior `pb-28 tablet:pb-16` para o botão fixo não cobrir o último item
- [X] T053 [US4] Revisar a responsividade em 360 px de todas as telas e ajustar classes onde necessário: cabeçalho (`flex-wrap`, `gap-y-2`), Controle (seleção de categoria em largura total no celular, número `text-display`, legenda do gráfico com `flex-wrap`), Planejamento (cards empilhados `grid-cols-1`, formulários `grid-cols-1 sm:grid-cols-2`, rótulos da divisão com `flex-wrap`), listas (ações quebrando para a linha de baixo sem estourar), Login; garantir `min-h-11`/`size-11` em botões, campos, cards e ações

**Checkpoint**: todas as histórias funcionando de forma independente, no desktop e no celular.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T054 [P] Escrever `tests/unit/specs/004-visual-redesign.spec.test.ts` rastreável à spec (cenários citando FR/US): FR-003 (pares AA dos dois temas via `contrastRatio` sobre os tokens de `globals.css`); FR-004 (tokens `income`, `present`, `future` e `primary` existem nos dois temas); FR-008 (`getUsedPercentage` 50%, 107%, `null`); FR-011 (`getCategoryStyle` dos 11 nomes + neutro + sem categoria); FR-017 (`incomeCountLabel` 0/1/N); SC-007 (reaproveitar a varredura de `tokens.test.ts` extraída para `tests/unit/design/scan-hardcoded.ts`)
- [X] T055 [P] Atualizar `README.md`: seção curta "Visual" com a referência `docs/design/redesign/`, os tokens em `src/app/globals.css`, tema pela preferência do dispositivo, cores fixas por parte e os testes de design
- [X] T056 Auditoria final: todo `"use client"` justificado; `npm run test:unit` (incluindo `tests/unit/design/`), `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros; conferir que nenhum texto das features 001–003 mudou além dos listados na spec
- [ ] T057 (Usuário) Executar a validação manual de `specs/004-visual-redesign/quickstart.md` (passos 1–7), comparando com `docs/design/redesign/` e o canvas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências (necessário só para a US4).
- **Foundational (Phase 2)**: T003 depende de T002; T004 de T003; T005 de T004; T006 depois de T005; T010 de T009; T012 de T010 e T011; T014 de T013; T016 de T015; T018 de T017. BLOQUEIA as histórias.
- **US1 (Phase 3)**: depende da Phase 2.
- **US2 (Phase 4)**: depende da Phase 2 (independente da US1, mas convém depois dela para o cabeçalho).
- **US3 (Phase 5)**: depende da Phase 2 (T008 para a variante `section`).
- **US4 (Phase 6)**: depende de T001 e da US2 (formulário, lista e página do Controle).
- **Polish (Phase 7)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- `actual-expense-form.tsx` é editado por T031 e T049; `actual-expense-list.tsx` por T030 e T051; `src/app/control/page.tsx` por T032 e T052 — sequenciais.
- `globals.css` só é editado em T005 (se um token novo for necessário depois, como `text-display` ou `pb-safe`, acrescentá-lo em T005 antes de usar).

### Parallel Opportunities

- Foundational: T002, T006 (após T005), T008, T009, T011, T013, T015, T017 em paralelo.
- US1: T019 e T020 em paralelo; T023 em paralelo com T021/T022.
- US2: T024–T027 em paralelo.
- US3: T033–T037 em paralelo; T040 em paralelo com T038.
- US4: T044–T047 em paralelo; T048 em paralelo com T049.
- US2 e US3 podem ser feitas em paralelo após a Phase 2.

---

## Parallel Example: User Story 3

```bash
Task: "Testes do SummaryTabCard em tests/unit/components/summary-tab-card.test.tsx"
Task: "Atualizar tests/unit/components/planning-tabs.test.tsx"
Task: "Testes do SplitBar em tests/unit/components/split-bar.test.tsx"
Task: "Atualizar tests/unit/components/allocation-slider.test.tsx"
Task: "Testes de listas e formulários do planejamento"
```

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Phase 1 + Phase 2 (tokens e testes de design primeiro: todo o resto se apoia neles)
2. US1 (identidade), US2 (Controle) e US3 (Planejamento) — juntas entregam o design no desktop
3. **PARAR e VALIDAR**: passos 1–4 e 7 do quickstart

### Incremental Delivery

1. Setup + Foundational → o app já troca de fonte, cores e tema escuro
2. US1 → cabeçalho e login
3. US2 → Controle
4. US3 → Planejamento
5. US4 → celular e painel de registro
6. Polish → teste da spec, README, auditoria e build

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências pendentes.
- Os protótipos em `docs/design/redesign/screens/` são referência visual e de estrutura, não
  código para copiar; os valores de cor vêm sempre dos tokens.
- Nenhuma migração, Server Action ou consulta muda; os testes de integração não são afetados.
