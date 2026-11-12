# Contract: UI

**Feature**: `006-present-moment-parts`

Textos em pt-BR, centralizados em `src/lib/part-labels.ts` (partes) e `src/lib/control-labels.ts`
(Controle). Todos os componentes usam apenas tokens do tema; cada parte aparece sempre com o nome,
nunca só com a cor.

## Textos (`src/lib/part-labels.ts`)

| Chave | Texto |
|---|---|
| `PART_LABELS` | `{ essentials: "Gastos Essenciais", education: "Educação", free: "Livre" }` |
| `PART_FIELD_LABEL` | "Parte" |
| `partPercentLabel(part, pct)` | "Educação · 5% da Receita" (tooltip) |
| `partExcessMessage(part, cents)` | "Educação excede o valor da parte em R$ 100,00" |
| `partPlannedLabel(planned, limit)` | "Planejado R$ 400,00 de R$ 500,00" |
| `thumbLabel(left, right)` | "Divisão entre Gastos Essenciais e Educação" |
| `PRESENT_ZERO_HINT` | "Defina a porcentagem do Momento Presente na aba Receita." |
| `presentTotalLabel(pct, cents)` | "70% da Receita · R$ 7.000,00" |
| `partChartSummary(...)` | "Gastos Essenciais: gasto acumulado de R$ 1.200,00 de um limite de R$ 6.000,00." (uma frase por parte; com " Acima do limite." quando for o caso) |

## Planejamento — aba Momento Presente (`ExpenseSection`)

Ordem: título e total do Momento Presente (`presentTotalLabel`) → `PresentSplitSlider` →
`PartBudgetList` → alerta atual do Momento Presente → formulário → lista → total.

### `PresentSplitSlider` (Client)

- Usa o `useAllocation()` (presente e partes em tempo real) e o `savePresentSplit` no commit.
- Mostra três rótulos acima do slider, cada um com o ponto de cor, o nome, a % e o valor em R$
  (FR-004), atualizados a cada passo.
- Mostra três faixas coloridas sob o trilho (larguras = % da parte / presente) e dois thumbs com
  `thumbLabels` e `aria-valuetext`.
- Com o Momento Presente em 0%, o slider fica `disabled` e mostra `PRESENT_ZERO_HINT`.
- Mostra o status "Salvando…", "Salvo" ou "Divisão não salva" com o botão "Tentar novamente",
  igual ao `AllocationSlider`.

### `PartBudgetList`

- Três linhas: nome, `partPlannedLabel(planned, limit)` e uma barra de uso fina na cor da parte.
- Quando planejado > valor, mostra um `Alert` destrutivo com `partExcessMessage` (FR-014), que
  não substitui o alerta do Momento Presente.

### `PartPicker` (Client, campo RHF)

- `fieldset` com `legend` "Parte" e três `input type="radio" name="part"`, em botões
  segmentados lado a lado de `min-h-11`, com o ponto de cor e o nome.
- Valor padrão `"essentials"`. O erro aparece via `FormFieldError`.
- É usado em `ExpenseForm` (criar e editar) e em `ActualExpenseForm` (card, painel e edição).

### Listas

- `ExpenseList` e `ActualExpenseList`: em cada item, um selo com o ponto de cor e o nome da parte,
  ao lado da categoria (o selo aparece sempre, mesmo quando a categoria fica escondida pelo
  filtro).

## Controle — `ControlDashboard`

Ordem: mês e seleção de categoria → `PartUsageBar` → `SpendingSummary` → `SpendingChart` →
lista.

### `PartUsageBar` (Client)

| Prop | Tipo |
|---|---|
| `spentByPart` | `PartCents` (na seleção de categoria) |
| `limitCents` | limite do Momento Presente |
| `percentages` | `PartPercentages` |
| `activePart` | `PresentPart \| null` |
| `onToggle` | `(part: PresentPart) => void` |

- Trilho `h-3 rounded-full bg-muted`, com trechos `bg-part-*` de largura `getPartBarWidths` e
  `border-x-2 border-background` entre eles. Cada trecho tem um `Tooltip` com
  `partPercentLabel`, `aria-hidden` e `tabIndex={-1}`, e funciona só com o mouse (R10).
- Legenda abaixo: três `button` com `aria-pressed`, `min-h-11`, o ponto de cor, o nome e a %, e
  o nome acessível "Educação, 5% da Receita, gasto R$ 100,00". Clicar chama `onToggle`.
- Parte ativa: o trecho e o botão da legenda ganham `ring-2 ring-ring`, e os demais trechos ficam
  com `opacity-40` (FR-030).

### `SpendingSummary` (alterado)

- A prop `plannedCents` vira `limitCents`, e o rótulo "Planejado" vira "Limite".
- Disponível = limite − gasto. O alerta e o "Usado" ficam como estão.
- A `UsageBar` antiga sai do resumo; a `PartUsageBar` ocupa o lugar dela acima do resumo.

### `SpendingChart` (alterado)

| Prop | Tipo |
|---|---|
| `series` | `PartSeriesPoint[]` |
| `parts` | `PresentPart[]` (as três, ou só a ativa) |
| `limits` | `PartCents` |
| `monthLabel` | `string` |

- Uma parte: `Area` + `ReferenceLine`, na cor da parte.
- Três partes: três `Line` `stepAfter` + três `ReferenceLine` tracejadas, cada par na cor da sua
  parte.
- Eixo Y até o maior valor entre os dados e os limites.
- Legenda visível com nome, traço sólido ("Gasto") e tracejado ("Limite R$ X") por parte.
- `figcaption` com `partChartSummary` (FR-020).

## Responsividade e acessibilidade

- Em 360 px: os rótulos do slider e a legenda da barra quebram em linhas, sem rolagem horizontal,
  e o `PartPicker` mantém as três opções numa linha (os rótulos podem quebrar).
- Todos os botões, rádios e thumbs têm alvo ≥ 44 × 44 px.
- Nos dois temas, as cores das partes têm contraste ≥ 3:1 contra o fundo e o card (teste de
  tokens).
