# Contract: Rotas e UI

**Feature**: `003-spending-control`

## Rotas

| Endereço | Logado | Sem sessão |
|---|---|---|
| `/` | redireciona para `/control` | `/login` |
| `/control` | página Controle | `/login` |
| `/planning` | página Planejamento, aba Receita | `/login` |
| `/planning?tab=present` / `?tab=future` | aba correspondente (regras da feature 002) | `/login` |
| `/login` | redireciona para `/control` | formulário de login |

- `buildPlanningTabUrl("income")` → `/planning`; `"present"` → `/planning?tab=present`.
- Após o login: `/control`.

## Cabeçalho (todas as páginas logadas)

```text
AppHeader(current) (Server)
├── h1 "Finanças Pessoais"
├── nav[aria-label="Seções"]
│   ├── Link "Planejamento" → /planning   (aria-current="page" quando current = "planning")
│   └── Link "Controle"     → /control    (aria-current="page" quando current = "control")
└── SignOutButton "Sair"
```

Em telas estreitas, a navegação quebra para uma segunda linha, sem rolagem horizontal.

## Página `/control`

```text
AppHeader(current="control")
main
├── ActualExpenseForm (Client: React Hook Form)        "Registrar gasto"
│   ├── Nome do gasto       (Input)
│   ├── Valor (R$)          (Input, formato BRL)
│   ├── Categoria           (Select, mesma lista do planejamento)
│   ├── Data                (input type="date", padrão = hoje, min/max = mês atual)
│   └── Botão "Adicionar gasto"
└── ControlDashboard (Client: categoria selecionada)
    ├── título "Controle de <Mês de AAAA>"
    ├── Select "Categoria" → "Todos" (padrão) + categorias em ordem alfabética
    ├── Resumo: "Planejado" R$ X · "Gasto" R$ Y · "Disponível" R$ Z
    │   └── Disponível negativo: texto e cor de destaque + "Acima do limite em R$ |Z|"
    ├── SpendingChart (Client: Recharts)  — acumulado por dia + linha "Limite"
    │   └── resumo para leitor de tela: "Gasto acumulado de R$ Y de um limite de R$ X em <Mês de AAAA>"
    └── ActualExpenseList
        ├── item: nome · categoria (só em "Todos") · data DD/MM/AAAA · valor · Editar · Apagar
        └── vazio: "Nenhum gasto registrado"
```

- Editar abre o mesmo formulário (modo edição) com os dados do gasto; Apagar usa o
  `DeleteConfirmDialog` existente.
- Depois de criar, editar ou apagar, a categoria selecionada no dashboard é mantida.
- Textos e rótulos centralizados em `src/lib/control-labels.ts`.

## Página `/planning`

Conteúdo e comportamento da antiga `/` (feature 002), com `AppHeader(current="planning")`.
