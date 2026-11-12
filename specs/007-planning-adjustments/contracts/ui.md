# Contract: UI

**Feature**: `007-planning-adjustments`

Textos em pt-BR, em `src/lib/part-labels.ts` e `src/lib/planning-labels.ts`. Somente tokens do tema.

## Aba Receita — `AllocationSection` e `AllocationSlider`

- `AllocationSection` mostra o título, a descrição e o `AllocationSlider revenueCents={...}`. Os
  dois cartões de valor deixam de existir.
- `AllocationSlider`:
  - Acima do slider, uma linha `flex justify-between` com dois blocos:
    - à esquerda: "Momento Presente 70%" (com o ponto `bg-present`) e, abaixo, "R$ 4.200,00"
      (`data-testid="slider-value-expenses"`);
    - à direita, alinhado à direita: "Momento Futuro 30%" (com o ponto `bg-future`) e, abaixo,
      "R$ 1.800,00" (`data-testid="slider-value-goals"`).
  - O `Slider` tem o `Range` em `bg-present` e o `Track` em `bg-future`; não há `SplitBar`.
  - O status de salvamento ("Salvando…", "Salvo", "Divisão não salva" + "Tentar novamente") não
    muda.
- Em 360 px, os dois blocos ficam lado a lado, e os valores podem quebrar linha sem rolagem
  horizontal.

## Aba Momento Presente — `ExpenseSection` (Server) + `PresentPartPanel` (Client)

Ordem: título e `PlannedAmount` → card com o `PresentSplitSlider` → `OverBudgetAlert` do Momento
Presente inteiro → `PresentPartPanel`.

### `PresentPartPanel`

| Prop | Tipo |
|---|---|
| `panels` | `Record<PresentPart, ReactNode>` (lista + total da parte, renderizados no servidor) |
| `categories` | `CategoryOption[]` |
| `revenueCents` | `number` |
| `plannedCentsByPart` | `PartCents` |

- **Seletor** (`Select`, rótulo visível "Parte", `min-h-11`, `w-full sm:w-64`): opções Gastos
  Essenciais, Educação e Livre, cada uma com o ponto de cor e o texto `partOptionLabel(part,
  excedida)`. Começa em `essentials`.
- **`PartBudget`** da parte selecionada: nome, "Planejado R$ X de R$ Y", a barra de uso na cor da
  parte e, quando excedida, o `Alert` com `partExcessMessage`.
- **Formulário**: `ExpenseForm mode="create" part={selectedPart}`, num card, sem o campo "Parte".
- **Bloco da parte**: `panels[selectedPart]`, só o da parte selecionada.

### Bloco por parte (servidor, em `ExpenseSection`)

- `ExpenseList expenses={gastos da parte} emptyMessage={partEmptyMessage(part)}`.
- `SectionTotal label={partTotalLabel(part)} totalCents={expensesTotalCentsByPart[part]}`.

### `ExpenseForm`

- Não renderiza mais o `PartPicker`, nem ao criar nem ao editar.
- `mode="create"`: a prop obrigatória `part` é enviada no `createExpense`.
- `mode="edit"`: envia só nome, valor e categoria.

## Cores das partes

Valores dos tokens em data-model.md. Valem em todas as telas que já usam `bg-part-*`,
`border-part-*` e `var(--part-*)`: slider das partes, `PartPicker` (Controle), `PartBadge`, barra
de uso e legenda do Controle e gráfico do Controle.
