# Quickstart: Planejamento Financeiro Pessoal

**Feature**: `001-financial-planning`

Guia para subir o ambiente e validar a feature de ponta a ponta. Detalhes de dados em
[data-model.md](./data-model.md); endpoints em [contracts/server-actions.md](./contracts/server-actions.md);
rotas e UI em [contracts/routes.md](./contracts/routes.md).

## Pré-requisitos

- Node.js 22 LTS e npm
- Docker (para o Supabase local usado nos testes de integração)
- Supabase CLI (apenas para subir o ambiente local; migrations são feitas pelo Prisma)
- Um projeto Supabase (desenvolvimento) com "Inactivity timeout" e "Time-box user sessions"
  desligados

## Variáveis de ambiente (`.env.local`)

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave pública (anon/publishable) |
| `DATABASE_URL` | conexão via pooler (runtime do Prisma) |
| `DIRECT_URL` | conexão direta (Prisma Migrate) |

Para testes: `.env.test` apontando para o Supabase local (`supabase start`).

## Setup

```bash
npm install
npx prisma migrate deploy      # aplica schema, RLS e constraints
npx prisma db seed             # popula categories
npm run dev                    # http://localhost:3000
```

Crie um ou dois usuários manualmente no painel do Supabase (Authentication → Users), pois o
cadastro está fora de escopo.

## Testes

```bash
npm run test:unit              # Vitest — libs, schemas, componentes, teste da spec
supabase start && npm run test:integration   # Vitest — Server Actions contra o banco local
npm test                       # todos
```

Esperado: todos os testes passam; existe ao menos um teste de integração por Server Action
listada em `contracts/server-actions.md` e o teste
`tests/unit/specs/001-financial-planning.spec.test.ts`.

## Validação manual (mapeada às User Stories)

1. **US1 — Login**: acesse `/` deslogado → vai para `/login`. Senha errada → "Email ou senha
   inválidos". Login correto → tela de planejamento. Feche e reabra o navegador → continua
   logado. Clique em "Sair" → volta a `/login`.
2. **US1 — Isolamento**: com o usuário A, crie dados; entre com B → nenhum dado de A aparece.
3. **US2 — Ganhos**: crie "Salário" R$ 5.000,00 e "Freelance" 1.250,50 → receita
   R$ 6.250,50. Edite e apague um ganho (com confirmação) → receita recalculada. Recarregue →
   persiste.
4. **US3 — Slider**: primeiro acesso mostra 50/50. Com receita R$ 6.000,00, arraste até 70% →
   R$ 4.200,00 / R$ 1.800,00 durante o arraste. Solte e recarregue → continua 70/30.
5. **US4 — Gastos**: crie "Aluguel" R$ 1.500,00 (Moradia) e outro de R$ 450,75 → soma
   R$ 1.950,75. Tente salvar sem categoria → erro no campo. Edite e apague um gasto.
6. **US5 — Metas**: crie "Viagem" R$ 500,00 sem categoria e outra de R$ 300,00 com categoria →
   soma R$ 800,00. Edite e apague uma meta.
7. **US6 — Alertas**: receita R$ 4.000,00, 50/50, gastos R$ 2.100,00 → alerta em gastos
   essenciais. Ajuste para R$ 2.000,00 → alerta some. Mova o slider para 60% → alerta
   aparece/some em tempo real conforme o planejado.
