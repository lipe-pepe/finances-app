# Contract: Rotas e UI (abas)

**Feature**: `002-planning-tabs`

Server Actions: **sem alterações** — continuam as de
`specs/001-financial-planning/contracts/server-actions.md`.

## Rota `/`

| Endereço | Aba selecionada |
|---|---|
| `/` | Receita |
| `/?tab=income` | Receita |
| `/?tab=present` | Momento Presente |
| `/?tab=future` | Momento Futuro |
| `/?tab=qualquer-outro` ou `?tab=present&tab=future` | Receita |

- Acesso, autenticação e redirecionamento: inalterados (proxy e `requireUserId`).
- Usuário sem sessão em `/?tab=future` → `/login` (o parâmetro não é preservado).

## Estrutura da tela

```text
AppHeader (Server)
AllocationProvider (Client: porcentagem do slider)
└── PlanningTabs (Client: aba selecionada + endereço)
    ├── TabsTrigger "Receita"
    ├── TabsTrigger "Momento Presente" + TabAlertIndicator(section="expenses")
    ├── TabsTrigger "Momento Futuro"   + TabAlertIndicator(section="goals")
    ├── TabsContent income  → IncomeSection + AllocationSection   (Server)
    ├── TabsContent present → ExpenseSection                     (Server)
    └── TabsContent future  → GoalSection                        (Server)
```

As seções continuam Server Components, passadas ao `PlanningTabs` como props (`income`,
`present`, `future`) — o componente cliente só controla qual delas é exibida.

## `PlanningTabs` (Client Component)

| Prop | Tipo | Descrição |
|---|---|---|
| `initialTab` | `PlanningTab` | aba vinda do servidor (`parsePlanningTab`) |
| `revenueCents` | `number` | para os indicadores de alerta |
| `expensesTotalCents` | `number` | idem |
| `goalsTotalCents` | `number` | idem |
| `income` / `present` / `future` | `ReactNode` | conteúdo de cada aba |

Comportamento:

- Lista de abas com `role="tablist"`, ordem fixa Receita → Momento Presente → Momento Futuro.
- `onValueChange(tab)`: atualiza o estado e chama
  `window.history.replaceState(null, "", buildPlanningTabUrl(tab))`.
- Teclado: setas esquerda/direita trocam o foco e a aba (comportamento do Radix).
- Em telas estreitas, a lista de abas ocupa a largura disponível sem rolagem horizontal da página.

## `TabAlertIndicator` (Client Component)

| Prop | Tipo |
|---|---|
| `section` | `"expenses" \| "goals"` |
| `revenueCents` | `number` |
| `totalCents` | `number` |

- Usa `useOverBudget` (mesma regra do `OverBudgetAlert`).
- Quando excedido: ícone `TriangleAlert` (`aria-hidden="true"`, cor de destaque) +
  `<span class="sr-only">, com alerta</span>`; caso contrário, não renderiza nada.

## Textos alterados (FR-009 a FR-012)

| Onde | Antes | Depois |
|---|---|---|
| Slider | "Gastos essenciais X%" / "Metas futuras Y%" | "Momento Presente X%" / "Momento Futuro Y%" |
| Descrição do slider | "...gastos essenciais e para metas futuras..." | "...Momento Presente e para o Momento Futuro..." |
| Título da seção | "Gastos essenciais" / "Metas futuras" | "Momento Presente" / "Momento Futuro" |
| Total | "Total de gastos" / "Total de metas" | "Total do Momento Presente" / "Total do Momento Futuro" |
| Alerta | "Os gastos essenciais excedem..." / "As metas futuras excedem..." | "O Momento Presente excede o planejado em R$ X" / "O Momento Futuro excede o planejado em R$ X" |
| `aria-label` do slider | "Divisão entre gastos essenciais e metas futuras" | "Divisão entre Momento Presente e Momento Futuro" |
