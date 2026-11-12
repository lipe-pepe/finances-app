# Quickstart: Divisão do Momento Presente em partes

**Feature**: `006-present-moment-parts`

Guia para validar a feature de ponta a ponta. Contratos em [contracts/](./contracts/) e modelo em
[data-model.md](./data-model.md).

## Pré-requisitos

- Supabase local rodando (`supabase start`), com `.env.local` e `.env.test` configurados.
- Migrações anteriores aplicadas, inclusive `profiles` (feature 005).

## Setup

```bash
npm run db:deploy          # aplica <timestamp>_present_parts
npm run db:deploy:test
npm run dev
```

## Testes automatizados

```bash
npm run test:unit          # inclui tests/unit/specs/006-present-moment-parts.spec.test.ts
npm run test:integration   # allocation, expenses, control e consultas
npm run lint
```

## Validação manual

Preparação: um ganho de R$ 10.000,00 e, na aba Receita, o Momento Presente em 70%.

| # | Passo | Resultado esperado | Ref. |
|---|---|---|---|
| 1 | Abrir a aba Momento Presente | "70% da Receita · R$ 7.000,00"; Gastos Essenciais 70% (R$ 7.000,00), Educação 0%, Livre 0% | US1-1, FR-007 |
| 2 | Arrastar as divisões até 60/5/5 | Valores mudam durante o arraste; terminam em R$ 6.000,00, R$ 500,00 e R$ 500,00 | US1-2, FR-004 |
| 3 | Soltar e recarregar | "Salvo"; a divisão continua 60/5/5 | FR-005 |
| 4 | Focar uma divisão e usar as setas | Ajusta de 1 em 1 ponto percentual; a soma continua 70% | FR-009 |
| 5 | Na aba Receita, mudar o Momento Presente para 35% | Voltando à aba Momento Presente: 30/3/2 | FR-008 |
| 6 | Voltar o Momento Presente para 70% e a divisão para 60/5/5. Criar o gasto "Curso" de R$ 400,00 em Educação | A lista mostra "Educação"; a linha de Educação diz "Planejado R$ 400,00 de R$ 500,00" | US2 |
| 7 | Criar o gasto "Livro" de R$ 200,00 em Educação | Alerta "Educação excede o valor da parte em R$ 100,00" | FR-014 |
| 8 | Conferir os gastos antigos | Todos em "Gastos Essenciais" | FR-021 |
| 9 | No Controle, registrar R$ 1.200,00 (Essenciais), R$ 100,00 (Educação) e R$ 50,00 (Livre) | A lista mostra a parte de cada gasto | US3 |
| 10 | Conferir a barra de uso | Três trechos coloridos; o tooltip de Educação diz "Educação · 5% da Receita" | US5-1/2 |
| 11 | Clicar em Educação (no trecho ou na legenda) | Disponível R$ 400,00, Limite R$ 500,00; o gráfico e a lista só com Educação | US5-3 |
| 12 | Clicar de novo em Educação | Volta ao Momento Presente inteiro: Limite R$ 7.000,00; o gráfico com três curvas e três limites | US5-4, US4-1 |
| 13 | Selecionar uma categoria | As curvas e o gasto filtram pela categoria; os limites não mudam | US4-5, US5-6 |
| 14 | Repetir 1, 2, 10 e 11 em 360, 768 e 1280 px, nos temas claro e escuro | Sem rolagem horizontal; alvos ≥ 44 px; cores das partes legíveis | FR-023, SC-007 |
