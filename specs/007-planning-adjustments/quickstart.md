# Quickstart: Ajustes do Planejamento e cores das partes

**Feature**: `007-planning-adjustments`

Sem migração. Contratos em [contracts/](./contracts/).

## Testes automatizados

```bash
npm run test:unit          # inclui tests/unit/specs/007-planning-adjustments.spec.test.ts
npm run test:integration   # expenses.actions (updateExpense ignora part); requer Supabase local
npm run lint
```

## Validação manual (`npm run dev`)

Preparação: um ganho de R$ 6.000,00, Momento Presente em 70% e partes 60/5/5, com gastos nas três
partes.

| # | Passo | Resultado esperado | Ref. |
|---|---|---|---|
| 1 | Abrir a aba Receita | Um único slider, laranja até a divisão e azul depois; nenhuma barra separada e nenhum cartão de valor | US1-1/3 |
| 2 | Ler os rótulos | "Momento Presente 70%" com "R$ 4.200,00" abaixo e "Momento Futuro 30%" com "R$ 1.800,00" abaixo | US1-2 |
| 3 | Arrastar até 60% | Cores, porcentagens e valores mudam juntos; "Salvo" ao soltar | US1-4 |
| 4 | Abrir a aba Momento Presente | Seletor em "Gastos Essenciais"; só o planejado, a barra e a lista de Gastos Essenciais | US3-1 |
| 5 | Escolher "Educação" | Dados, lista e "Total de Educação" só de Educação | US3-2 |
| 6 | Adicionar "Curso" com Educação selecionada | Não há campo "Parte"; o gasto entra na lista de Educação | US3-3 |
| 7 | Editar "Curso" | Não há campo "Parte"; depois de salvar, continua em Educação | US3-6 |
| 8 | Planejar em Livre acima do valor e voltar para Gastos Essenciais | O seletor mostra "Livre — excedida" | US3-5 |
| 9 | Conferir as cores no Planejamento e no Controle, nos temas claro e escuro | Gastos Essenciais laranja, Educação ciano e Livre roxo, sempre com o nome | US2 |
| 10 | Repetir 1, 4 e 9 em 360, 768 e 1280 px | Sem rolagem horizontal; alvos ≥ 44 px | FR-017 |
