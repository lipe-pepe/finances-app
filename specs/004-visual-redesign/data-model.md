# Data Model: Redesign visual da plataforma

**Feature**: `004-visual-redesign` | **Date**: 2026-11-09

**Banco**: sem alterações (nenhuma tabela, coluna ou migração). Os dados continuam os de
`specs/001-financial-planning/data-model.md` e `specs/003-spending-control/data-model.md`.

## Valores derivados novos (não persistidos)

| Valor | Regra | Onde |
|---|---|---|
| Usado (%) | planejado > 0 → `round(gasto ÷ planejado × 100)`; planejado = 0 e gasto = 0 → `0`; planejado = 0 e gasto > 0 → indefinido (exibe "—") | Controle (seleção) e cards dos momentos |
| Barra de uso (%) | `min(Usado, 100)`; indefinido → 100; acima do limite → cor de alerta | Controle e cards dos momentos |
| Quantidade de ganhos | número de ganhos do usuário; rótulo "Nenhum ganho cadastrado" / "1 ganho cadastrado" / "N ganhos cadastrados" | Card Receita |
| Estilo da categoria | nome da categoria → `{ key, ícone }`; desconhecida → `neutral`; meta sem categoria → `none` | Listas de gastos e metas |
| Parte ativa | aba selecionada (`income`/`present`/`future`) → tokens `section-*` | Planejamento |

## Mapa de categorias

| Nome (seed) | key | Ícone |
|---|---|---|
| Alimentação | `food` | Utensils |
| Moradia | `housing` | House |
| Transporte | `transport` | Car |
| Saúde | `health` | Heart |
| Lazer | `leisure` | Star |
| Reserva de Emergência | `emergency` | ShieldCheck |
| Viagem | `travel` | Plane |
| Educação | `education` | BookOpen |
| Contas e Serviços | `bills` | Zap |
| Investimentos | `investments` | TrendingUp |
| Outros | `other` | CircleEllipsis |
| (desconhecida) | `neutral` | CircleEllipsis (cinza) |
| (meta sem categoria) | `none` | Target (cinza) |

## Tokens do tema

Lista completa e valores: [contracts/design-tokens.md](./contracts/design-tokens.md).
