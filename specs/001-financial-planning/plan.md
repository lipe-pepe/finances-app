# Implementation Plan: Planejamento Financeiro Pessoal

**Branch**: `001-financial-planning` | **Date**: 2026-11-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-financial-planning/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Plataforma web em que o usuário (cadastrado pelo administrador) faz login com email e senha,
cadastra ganhos (receita total), divide a receita entre gastos essenciais e metas futuras com um
slider salvo automaticamente, registra gastos (com categoria obrigatória) e metas (categoria
opcional) e vê alertas quando a soma de uma seção excede o valor planejado.

Abordagem: Next.js App Router com a tela de planejamento renderizada no servidor; mutações via
Server Actions validadas com Zod e protegidas por Supabase Auth; dados acessados com Prisma
sempre filtrados por `userId`, com RLS no banco como defesa extra; valores em centavos
inteiros; slider e alertas em Client Components mínimos ligados por um Context. Detalhes em
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22 LTS

**Primary Dependencies**: Next.js 16 (App Router, React 19), `@supabase/ssr` +
`@supabase/supabase-js`, Prisma 7 (`@prisma/adapter-pg`), React Hook Form + Zod +
`@hookform/resolvers`, Tailwind CSS 4 + shadcn/ui (Radix)

**Storage**: Supabase PostgreSQL; schema e migrations via Prisma Migrate; RLS e constraints em
SQL manual nas migrations

**Testing**: Vitest (projetos `unit` com jsdom/node e `integration` com node), Testing Library
para componentes; banco de teste via Supabase local

**Target Platform**: navegadores modernos (desktop e mobile); deploy Node (ex.: Vercel)

**Project Type**: aplicação web full-stack (Next.js monolítico)

**Performance Goals**: tela de planejamento carregada em < 2 s; alertas e valores planejados
reagem ao slider em < 100 ms no cliente e em < 1 s após mutações (SC-006)

**Constraints**: cálculos exatos ao centavo (SC-005); isolamento total entre usuários (SC-003);
SSR por padrão; sem cadastro de usuários

**Scale/Scope**: uso pessoal, poucas dezenas de usuários; até ~100 itens por seção por usuário;
2 rotas (`/login`, `/`); 12 Server Actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Arquivos, modelos, tabelas, rotas e identificadores em inglês (`incomes`, `createExpense`, `OverBudgetAlert`); comentários em português; textos de UI em pt-BR | ✅ Pass |
| II. Testes (não negociável) | Unitários para cada funcionalidade (`money`, `planning`, schemas, componentes); teste da spec em `tests/unit/specs/001-financial-planning.spec.test.ts`; teste de integração para cada uma das 12 Server Actions e para `getPlanningData`, todos com Vitest | ✅ Pass |
| III. SSR primeiro | Páginas, listas e somas são Server Components; Client Components restritos a formulários RHF, slider/contexto, alerta, valor planejado e diálogo de confirmação — cada um com comentário justificando o `"use client"` | ✅ Pass |
| IV. React Hook Form | Login, ganhos, gastos e metas usam RHF + `zodResolver`; os mesmos schemas validam no servidor; o slider não é um formulário (Server Action direta) | ✅ Pass |
| V. Supabase, Prisma e Auth | Supabase Auth exclusivo; Prisma Client para dados; migrations só com Prisma Migrate (RLS, FK para `auth.users` e `CHECK` em SQL manual nas migrations); schema `auth` não alterado; queries filtram por `userId`; Prisma Client e `DATABASE_URL` apenas no servidor (`server-only`) | ✅ Pass |
| Quality gates | Gates 1–6 verificáveis via `npm test`, revisão e checklist de PR | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass — data-model e contracts mantêm todos os princípios.
Observação: o Supabase CLI é usado só para o ambiente local de testes, não para migrations.

## Project Structure

### Documentation (this feature)

```text
specs/001-financial-planning/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── server-actions.md
│   └── routes.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma
├── migrations/                     # somente Prisma Migrate (+ SQL manual de RLS/CHECK/FK)
└── seed.ts                         # categories
prisma.config.ts

src/
├── proxy.ts                        # renovação de sessão e redirecionamento para /login
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                    # tela de planejamento (Server Component, protegida)
│   └── login/
│       └── page.tsx
├── features/
│   ├── auth/
│   │   ├── actions.ts              # signIn, signOut
│   │   ├── schemas.ts
│   │   └── components/{login-form.tsx, sign-out-button.tsx}
│   ├── incomes/
│   │   ├── actions.ts
│   │   ├── schemas.ts
│   │   └── components/{income-section.tsx, income-list.tsx, income-form.tsx}
│   ├── allocation/
│   │   ├── actions.ts              # saveAllocation
│   │   ├── schemas.ts
│   │   └── components/{allocation-provider.tsx, allocation-slider.tsx, planned-amount.tsx}
│   ├── expenses/
│   │   ├── actions.ts
│   │   ├── schemas.ts
│   │   └── components/{expense-section.tsx, expense-list.tsx, expense-form.tsx}
│   ├── goals/
│   │   ├── actions.ts
│   │   ├── schemas.ts
│   │   └── components/{goal-section.tsx, goal-list.tsx, goal-form.tsx}
│   └── planning/
│       ├── queries.ts              # getPlanningData
│       └── components/{over-budget-alert.tsx, section-total.tsx, delete-confirm-dialog.tsx}
├── components/ui/                  # shadcn/ui
├── generated/prisma/               # Prisma Client gerado (não versionado)
└── lib/
    ├── money.ts                    # parse/format BRL, centavos
    ├── planning.ts                 # valores planejados, isOverBudget
    ├── action-result.ts            # tipos ActionResult/ActionError
    ├── prisma.ts                   # singleton (server-only)
    ├── auth.ts                     # getCurrentUserId (server-only)
    └── supabase/server.ts          # createServerClient (cookies)

tests/
├── setup/                          # helpers: db de teste, usuários A/B, mocks de auth
├── unit/
│   ├── lib/{money.test.ts, planning.test.ts}
│   ├── schemas/*.test.ts
│   ├── components/*.test.tsx
│   └── specs/001-financial-planning.spec.test.ts
└── integration/
    ├── auth.actions.test.ts
    ├── incomes.actions.test.ts
    ├── allocation.actions.test.ts
    ├── expenses.actions.test.ts
    ├── goals.actions.test.ts
    └── planning.queries.test.ts

vitest.config.ts
```

**Structure Decision**: projeto Next.js único (front-end e back-end no mesmo app), organizado
por domínio em `src/features/*` (actions, schemas e componentes juntos) e utilitários puros em
`src/lib`. Testes em `tests/`, separados em `unit` e `integration` para os projetos do Vitest.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
