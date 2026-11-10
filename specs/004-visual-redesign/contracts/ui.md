# Contract: Telas e componentes

**Feature**: `004-visual-redesign`

Rotas, Server Actions e consultas: **sem alterações** (contratos das features 001–003). Exceção:
`getPlanningData` passa a expor `incomeCount` (derivado de `incomes.length`).

## Cabeçalho (`AppHeader`, Server)

```text
header (bg-background, borda inferior)
├── logo (quadrado bg-primary com ícone) + "Finanças Pessoais"
├── nav[aria-label="Seções"]: Planejamento | Controle  (atual: aria-current="page", sublinhado border-primary)
└── SignOutButton "Sair" (outline)
```

## Controle (`/control`)

```text
main (max-w 1120 px; flex-wrap)
├── coluna principal (flex 999 1 560px)
│   ├── "Novembro de 2026" (muted) + Select "Categoria"
│   ├── SpendingSummary
│   │   ├── "Disponível" + número (clamp 40–64 px; vermelho + ícone + "Acima do limite em R$ X" quando negativo)
│   │   ├── UsageBar (bg-muted; preenchimento bg-primary ou bg-destructive)
│   │   └── dl: Gasto · Planejado · Usado (N% | —)
│   ├── SpendingChart (Area stepAfter primary/brand-soft + ReferenceLine chart-limit; legenda "Limite R$ X"; resumo sr-only)
│   └── "Gastos do mês": ActualExpenseList (CategoryIcon · nome · data[ · categoria] · valor · Editar · Apagar)
├── aside (≥ 720 px: card "Registrar gasto" com ActualExpenseForm; dica "Somente dias de <mês>")
└── < 720 px:
    ├── barra fixa no rodapé: Button "+ Registrar gasto" (aria-haspopup="dialog")
    └── Sheet (side=bottom, role=dialog): "Registrar gasto" | "Editar gasto" + ActualExpenseForm
```

- `ActualExpenseSheetProvider` (Client): estado do painel; `openCreate()`, `openEdit(item)`,
  `close()`; fecha ao registrar/salvar com sucesso e quando a tela passa de 720 px.
- `ActualExpenseForm` ganha `onSuccess?` (fecha o painel) e modo `edit` controlado
  externamente (sem o botão-lápis interno) quando usado no painel.
- Editar na lista: ≥ 720 px → edição na linha (como hoje); < 720 px → `openEdit(item)`.
- `main` tem espaço inferior extra abaixo de 720 px (botão fixo não cobre o último item).

## Planejamento (`/planning`)

```text
main
├── h1 "Planejamento" (text-4xl, bold) + frase "Defina sua receita e divida entre o Momento Presente e o Momento Futuro."
├── PlanningTabs (Client; Radix Tabs; data-section = aba ativa)
│   ├── TabsList (grid auto-fit minmax(240px, 1fr); empilha no celular)
│   │   └── SummaryTabCard × 3 (TabsTrigger)
│   │       ├── ícone (bg-<parte>-soft/text-<parte>-ink; selecionado: bg-<parte>/text-<parte>-foreground)
│   │       ├── rótulo (id; nome acessível) + TabAlertIndicator (", com alerta")
│   │       ├── valor (Receita: total; momentos: planejado ao vivo pelo slider)
│   │       ├── UsageBar (momentos; bg-<parte> ou bg-destructive)
│   │       └── resumo: "N ganhos cadastrados" | "X% da receita · gastos/metas R$ Y (Z%)"
│   │       (selecionado: border-2 border-<parte>; demais: border-border)
│   └── TabsContent (max-w 880 px, uma coluna)
│       ├── income:  AllocationSection (rótulos com marcador present/future + SplitBar + Slider accent-section) → IncomeSection (form em linha → lista → "Receita total")
│       ├── present: título + "Planejado: R$ X (Y% da receita)" → OverBudgetAlert → ExpenseForm em linha → ExpenseList (CategoryIcon) → total
│       └── future:  idem com GoalForm/GoalList (meta sem categoria: ícone Target cinza)
└── Botões primários dentro das abas: variante `section` (bg-section text-section-foreground)
```

- Endereço `?tab=`, teclado, `replaceState` e permanência após mutações: inalterados (002).
- Nome acessível das abas: "Receita", "Momento Presente[, com alerta]", "Momento Futuro[, com
  alerta]"; valores do card via `aria-describedby`.

## Login (`/login`)

Card central (max-w 400 px): logo, "Finanças Pessoais", "Entre com seu email e senha para acessar
seu planejamento.", Email, Senha, erro (`role="alert"`, bg-danger-soft text-destructive),
"Entrar"; abaixo: "O acesso é criado pelo administrador da plataforma."

## Componentes novos (compartilhados)

| Componente | Tipo | Responsabilidade |
|---|---|---|
| `CategoryIcon` | Server | Ícone e cores da categoria (`category-style.ts`) |
| `UsageBar` | Server | Barra de uso com `value` 0–100 e `tone` (`brand`/`section`/`income`/`present`/`future`/`danger`); `aria-hidden` (valores ficam no texto) |
| `SplitBar` | Client | Barra Momento Presente × Momento Futuro na proporção do slider |
| `ui/sheet` | Client | shadcn/ui (Radix Dialog) |
