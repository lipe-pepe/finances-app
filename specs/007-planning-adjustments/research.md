# Research: Ajustes do Planejamento e cores das partes

**Feature**: `007-planning-adjustments` | **Date**: 2026-11-11

Não há itens "NEEDS CLARIFICATION" no Technical Context.

## R1. Slider da Receita em duas cores (FR-001, FR-002)

- **Decision**: o `AllocationSlider` usa o `Slider` atual (um thumb) com classes que pintam o
  `Range` (do 0 até o thumb) de `bg-present` e o `Track` de `bg-future`:
  `[&_[data-slot=slider-range]]:bg-present [&_[data-slot=slider-track]]:bg-future`. O thumb ganha
  a borda `border-foreground`, para ficar visível sobre as duas cores. Acima do slider, uma linha com
  dois blocos: à esquerda, "Momento Presente X%" e, abaixo, o valor; à direita, alinhado à direita,
  "Momento Futuro Y%" e, abaixo, o valor. Os valores vêm de `calculatePlannedCents` com as
  porcentagens em tempo real do provider. O componente passa a receber `revenueCents`. O
  `SplitBar` e o seu teste são removidos.
- **Rationale**: o Radix já separa trilho e faixa; pintar os dois elimina a barra duplicada sem
  componente novo, no mesmo padrão do `PresentSplitSlider`.
- **Alternatives considered**: desenhar faixas por baixo de um trilho transparente, como no slider
  das partes (desnecessário com um thumb só, já que o `Range` faz isso nativamente).

## R2. Cartões de valor da aba Receita (FR-003)

- **Decision**: a `AllocationSection` deixa de renderizar os dois `PlannedAmount showSectionLabel`.
  A prop `showSectionLabel` sai do `PlannedAmount`, que continua em uso nos cabeçalhos do Momento
  Presente e do Momento Futuro.
- **Rationale**: elimina a redundância pedida sem afetar os outros usos.

## R3. Cores das partes (FR-005–FR-007)

- **Decision**: trocar só os valores dos tokens, já que todas as telas usam `--part-*`:

  | Token | Claro | Escuro |
  |---|---|---|
  | `--part-essentials` (laranja) | `#ea580c` | `var(--present)` = `#fb923c` |
  | `--part-education` (ciano) | `#0891b2` | `#22d3ee` |
  | `--part-free` (roxo) | `#9333ea` | `#c084fc` |

  Contraste contra `--background` e `--card`: claro 3,41/3,56 (laranja), 3,52/3,68 (ciano) e
  5,15/5,38 (roxo); escuro 8,2/7,6, 10,3/9,5 e 7,0/6,5. Todos ≥ 3:1.
- **Rationale**: no tema claro, o `--present` (`#ee6a10`) dá 2,997:1 contra o fundo, um pouco abaixo
  dos 3:1. O `#ea580c` é o tom vizinho do mesmo laranja e passa. No tema escuro, o próprio
  `--present` passa e é usado por referência. O ciano (`#0891b2` e `#22d3ee`) tem matiz bem
  diferente do azul do Momento Futuro (`#1d4ed8` e `#60a5fa`). O roxo não colide com nenhuma cor de
  significado fixo.
- **Alternatives considered**: usar `var(--present)` também no tema claro (falharia no teste de
  contraste contra o fundo); um ciano mais escuro (`#0e7490`, que ficaria próximo demais do azul do
  Futuro).

## R4. Uma parte por vez com SSR (FR-008–FR-010, FR-014)

- **Decision**: a `ExpenseSection` (Server Component) monta, para cada parte, um bloco renderizado
  no servidor com a `ExpenseList` dos gastos da parte e o `SectionTotal` da parte. Ela passa
  `panels: Record<PresentPart, ReactNode>` ao `PresentPartPanel` (Client), junto com `categories`,
  `revenueCents` e `expensesTotalCentsByPart`. O painel guarda `selectedPart` em `useState`
  (inicial `"essentials"`, sem ficar no endereço) e renderiza, nesta ordem: o seletor, o
  `PartBudget` da parte (planejado × valor, barra e alerta), o formulário de adicionar
  (`ExpenseForm mode="create" part={selectedPart}`), a lista e o total da parte. O
  `PresentSplitSlider` e o `OverBudgetAlert` do Momento Presente inteiro ficam fora do painel, sempre
  visíveis.
- **Rationale**: o mesmo padrão do `PlanningTabs` (seções no servidor, cliente só escolhe qual
  mostrar) atende ao Princípio III e troca de parte sem ida ao servidor.
- **Alternatives considered**: transformar a lista em Client Component e filtrar no navegador
  (enviaria mais JavaScript e quebraria o padrão SSR); guardar a parte no endereço (`?part=`), o que
  a spec descarta.

## R5. Seletor de parte (FR-008, FR-013)

- **Decision**: usar o `Select` do shadcn/ui (`src/components/ui/select.tsx`), com o rótulo visível
  "Parte" e as três opções na ordem fixa. Cada opção mostra o ponto de cor, o nome e, quando a parte
  está excedida, o sufixo " — excedida" (`partOptionLabel`). O valor exibido com o seletor fechado
  usa o mesmo texto. "Excedida" vem de `isOverBudget(planejado, valorDaParte)`, com os valores em
  tempo real do provider. O gatilho tem `min-h-11` e fica com largura total no celular.
- **Rationale**: o pedido fala em "select", e o `Select` já é usado no `CategorySelect`, com
  teclado e leitor de tela resolvidos.

## R6. Formulários sem o campo "Parte" (FR-011, FR-012)

- **Decision**: o `ExpenseForm` deixa de renderizar o `PartPicker`. No modo `create`, recebe a prop
  `part: PresentPart` e envia `createExpense({ ...values, part })`; o `part` sai dos valores do
  formulário. No modo `edit`, envia `updateExpense(id, values)` sem `part`. No servidor, o novo
  `expenseUpdateSchema = expenseSchema.omit({ part: true })` valida a edição, e `updateExpense` não
  escreve `part` (mesmo que o cliente envie, o campo é descartado). O `expenseSchema` (com `part`
  obrigatório) continua sendo o da criação.
- **Rationale**: a parte fica fixa desde a criação (Clarifications), também contra requisições
  forjadas. Trocar de parte no meio do preenchimento não perde o que foi digitado: a parte é lida
  na hora de salvar (Edge Cases).

## R7. Textos novos (FR-013, FR-015, Edge Cases)

- **Decision**: em `src/lib/part-labels.ts`: `PART_SELECT_LABEL = "Parte"`,
  `partOptionLabel(part, exceeded)` → "Educação" ou "Educação — excedida",
  `partEmptyMessage(part)` → "Nenhum gasto em Educação." e `partTotalLabel(part)` → "Total de
  Educação". A `ExpenseList` ganha a prop opcional `emptyMessage`.
