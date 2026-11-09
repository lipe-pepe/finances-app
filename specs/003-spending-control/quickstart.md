# Quickstart: Planejamento e Controle de gastos

**Feature**: `003-spending-control`

Ambiente e setup: os mesmos da feature 001 ([README](../../README.md)). Esta feature tem **uma
migração nova** (`actual_expenses`):

```bash
npm install          # inclui recharts (shadcn chart)
npm run db:deploy    # aplica a migração no Supabase remoto
```

Detalhes de rotas e componentes em [contracts/ui.md](./contracts/ui.md); actions em
[contracts/server-actions.md](./contracts/server-actions.md).

## Testes automatizados

```bash
npm run test:unit         # inclui tests/unit/specs/003-spending-control.spec.test.ts
npm run test:integration  # requer Supabase local (actions do Controle e getControlData)
npm run lint && npx tsc --noEmit && npm run build
```

## Validação manual (`npm run dev`, usuário logado)

Preparação: no Planejamento, gastos do Momento Presente de R$ 1.500,00 em "Moradia" e R$ 800,00 em
"Alimentação"; uma meta de R$ 300,00 com categoria "Moradia".

1. **Rotas (US1)**: abrir `/` → vai para `/control`; o topo mostra "Planejamento" e "Controle",
   com "Controle" destacado, e "Sair".
2. **Planejamento (US1)**: clicar em "Planejamento" → `/planning` com a aba Receita; trocar para
   Momento Futuro → `/planning?tab=future`; recarregar → continua na aba.
3. **Login (US1)**: sair e entrar de novo → cai em `/control`. Deslogado, abrir `/planning` →
   `/login`.
4. **Registrar (US2)**: o campo de data mostra hoje; registrar "Mercado", R$ 230,50,
   "Alimentação" → aparece na lista e o formulário volta com a data de hoje.
5. **Validação (US2)**: tentar salvar sem nome, com valor 0 e com uma data do mês anterior
   (digitada) → mensagens por campo; nada salvo.
6. **Independência (US2)**: abrir Planejamento → Momento Presente → lista e soma inalteradas.
7. **Dashboard (US3)**: "Todos" → planejado R$ 2.300,00 (a meta não entra), gasto R$ 230,50,
   disponível R$ 2.069,50; selecionar "Moradia" → planejado R$ 1.500,00, lista vazia ("Nenhum
   gasto registrado"), disponível R$ 1.500,00, gráfico só com a linha "Limite".
8. **Acima do limite (US3)**: com "Moradia" selecionada, registrar R$ 1.600,00 em "Moradia" →
   disponível −R$ 100,00 destacado; o gráfico cruza a linha de limite; a seleção continua em
   "Moradia".
9. **Editar e apagar (US2)**: editar o gasto de R$ 1.600,00 para R$ 1.400,00 → disponível
   R$ 100,00; apagá-lo (confirmando) → some da lista.
10. **Celular**: no modo responsivo, topo, formulário, seleção, gráfico e lista sem rolagem
    horizontal da página.
