# Research: Planejamento Financeiro Pessoal

**Feature**: `001-financial-planning` | **Date**: 2026-11-08

A stack é fixada pela constituição (v1.1.0): Next.js, Supabase (PostgreSQL + Auth), Prisma,
React Hook Form e Vitest. Esta pesquisa resolve as decisões em aberto dentro dessa stack.

## R1. Versões e estrutura do Next.js

- **Decision**: Next.js 16 (App Router) + React 19 + TypeScript (strict), código em `src/`.
  O refresh de sessão roda em `src/proxy.ts` (antigo `middleware.ts`, renomeado no Next.js 16).
- **Rationale**: o App Router suporta React Server Components e Server Actions, o que atende ao
  Princípio III (SSR primeiro) e oferece mutações sem precisar de uma API REST separada.
- **Alternatives considered**: Pages Router (sem RSC, contraria o Princípio III); manter
  `middleware.ts` (obsoleto no Next 16). Confirmar a versão estável mais recente no setup.

## R2. Integração Supabase Auth com SSR

- **Decision**: `@supabase/ssr` com dois helpers: `createServerClient` (Server Components,
  Server Actions, proxy) e `createBrowserClient` (não necessário nesta feature). A sessão vive
  em cookies; o `proxy.ts` chama `supabase.auth.getUser()` em cada requisição para renovar os
  tokens e redireciona para `/login` quando não há usuário em rotas protegidas.
- **Login/logout**: Server Actions `signIn` (`signInWithPassword`) e `signOut`.
- **Sessão persistente (FR-003)**: refresh tokens do Supabase não expiram por padrão; manter
  "Inactivity timeout" e "Time-box user sessions" desligados no painel. O usuário só sai ao
  clicar em "Sair".
- **Mensagem genérica (FR-002)**: qualquer erro de `signInWithPassword` é mapeado para
  "Email ou senha inválidos".
- **Identidade no servidor**: sempre `supabase.auth.getUser()` (valida o JWT no servidor), nunca
  `getSession()` sozinho, para obter o `userId` usado nos filtros do Prisma.
- **Alternatives considered**: NextAuth/Auth.js (proibido pelo Princípio V); auth no cliente
  (contraria o Princípio III e expõe a lógica).

## R3. Prisma com Supabase e RLS

- **Decision**: Prisma 7 com `prisma.config.ts`, gerador `prisma-client` (output em
  `src/generated/prisma`) e driver adapter `@prisma/adapter-pg`.
  - Conexão em runtime: pooler do Supabase (transaction mode, porta 6543) via `DATABASE_URL`.
  - Migrations: conexão direta/session (porta 5432) via `DIRECT_URL`, configurada no
    `prisma.config.ts`.
- **RLS**: o Prisma conecta com um papel que ignora o RLS. Por isso (Princípio V):
  1. Toda query de dados de usuário recebe o `userId` de `getCurrentUserId()` e filtra por ele
     (`where: { id, userId }` em update/delete, usando `updateMany`/`deleteMany` ou checagem
     prévia, para que IDs de outros usuários resultem em "não encontrado").
  2. O RLS é habilitado mesmo assim em todas as tabelas, com políticas `auth.uid() = user_id`,
     como defesa em profundidade contra acesso pela API do Supabase (PostgREST) com a anon key.
  3. As políticas, a FK para `auth.users` e as constraints `CHECK` são adicionadas como SQL
     manual dentro dos arquivos de migração do Prisma (`prisma migrate dev --create-only`).
- **Alternatives considered**: Supabase JS client para dados (RLS nativo, mas contraria a
  constituição, que exige o Prisma Client); definir `request.jwt.claims` por transação para o
  Prisma respeitar o RLS (mais complexo, frágil com pooler; desnecessário para o MVP).

## R4. Representação de valores monetários

- **Decision**: armazenar como `DECIMAL(12,2)` (máx. R$ 9.999.999.999,99, cobre o caso de
  R$ 999.999.999,99 da spec) e fazer todo cálculo em **centavos inteiros** (`number`) na
  aplicação. Conversão em `src/lib/money.ts`: `parseBrlToCents`, `centsToDecimalString`,
  `decimalToCents`, `formatBrl` (`Intl.NumberFormat('pt-BR', { style: 'currency',
  currency: 'BRL' })`).
- **Rationale**: inteiros evitam erros de ponto flutuante (FR-028, SC-005); 999.999.999.999
  centavos fica abaixo de `Number.MAX_SAFE_INTEGER`, então somas de muitos itens são exatas.
- **Entrada**: aceita formato brasileiro (`1.234,56`, `1234,56`) e com ponto (`1234.56`);
  rejeita mais de 2 casas decimais, zero, negativos e valores não numéricos.
- **Valor planejado**: `Math.round(revenueCents * percentage / 100)` (arredonda ao centavo); o
  alerta compara a soma com esse mesmo valor arredondado (edge case da spec).
- **Alternatives considered**: `BIGINT` em centavos (serialização de `bigint` incômoda entre
  servidor e cliente); `float` (impreciso); biblioteca decimal (desnecessária com centavos).

## R5. Mutações: Server Actions vs. Route Handlers

- **Decision**: Server Actions em `src/features/<domain>/actions.ts`, todas com
  `"use server"`, validação Zod no servidor, checagem de autenticação, filtro por `userId` e
  `revalidatePath('/')`. Retorno padronizado `ActionResult` (ver `contracts/server-actions.md`).
- **Rationale**: integração direta com React Hook Form (`handleSubmit` → action), sem API
  pública extra. Cada Server Action é um endpoint para o Princípio II e recebe teste de
  integração.
- **Alternatives considered**: Route Handlers REST (mais código e superfície pública sem
  necessidade nesta feature).

## R6. Formulários e validação

- **Decision**: React Hook Form + `zod` + `@hookform/resolvers/zod`. Os schemas Zod ficam em
  `src/features/<domain>/schemas.ts` e são usados **no cliente e na Server Action** (FR e
  Princípio IV: validação repetida no servidor).
- **Limites**: nome obrigatório, 1–100 caracteres após `trim`; valor > 0, ≤ 2 casas,
  ≤ R$ 999.999.999,99.

## R7. Slider em tempo real e salvamento automático

- **Decision**: Radix Slider (via shadcn/ui) em um Client Component pequeno.
  - Um `AllocationProvider` (Client Component, Context) guarda a porcentagem atual. Ele envolve
    a tela de planejamento, mas recebe as seções renderizadas no servidor como `children`, que
    continuam Server Components.
  - `onValueChange` atualiza o contexto (valores planejados e alertas em tempo real, FR-016a).
  - `onValueCommit` (ao soltar) chama a Server Action `saveAllocation` (FR-016). Commits em
    sequência rápida: uma `requestId` crescente garante que só o resultado do último commit
    atualize o estado de "salvo"; o servidor faz upsert, então a última gravação prevalece.
  - Em erro, mostra aviso "Divisão não salva" com a opção de tentar de novo (FR-016b).
- **Componentes cliente nesta feature** (todos justificados com comentário): `LoginForm`,
  `AllocationProvider`, `AllocationSlider`, `PlannedAmount`, `OverBudgetAlert`, formulários de
  ganho/gasto/meta e o diálogo de confirmação de exclusão. Listas, somas e a página são
  Server Components.
- **Alternatives considered**: guardar a porcentagem só no servidor e recarregar a cada
  movimento (lento, viola FR-016a); botão salvar (rejeitado na clarificação).

## R8. Alertas de planejamento excedido

- **Decision**: função pura `isOverBudget(totalCents, plannedCents)` → `totalCents >
  plannedCents` e `excessCents`, em `src/lib/planning.ts`. O `OverBudgetAlert` (cliente) lê a
  porcentagem do contexto e recebe a receita e a soma da seção como props vindas do servidor.
  Após qualquer mutação, `revalidatePath('/')` re-renderiza as somas no servidor (< 1 s,
  SC-006).
- **Visual**: alerta com `role="alert"`, cor de destaque de erro, ícone e texto "Planejamento
  incorreto: os gastos essenciais excedem o planejado em R$ X".

## R9. Categorias

- **Decision**: tabela global `categories` (apenas `id` e `name`, `name` único), populada pelo
  seed do Prisma (`prisma/seed.ts`). `Expense.categoryId` com `onDelete: Restrict` (categoria em
  uso não pode ser apagada pelo administrador); `Goal.categoryId` opcional com
  `onDelete: SetNull`. Lista lida no servidor e passada aos formulários.
- **Seed inicial sugerido**: Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Contas e
  Serviços, Viagem, Reserva de Emergência, Investimentos, Outros.
- **Nota**: o `id` é um detalhe técnico (chave primária); o modelo de domínio continua tendo
  somente o atributo nome, como pede a spec.

## R10. Estratégia de testes (Princípio II)

- **Decision**: Vitest com dois projetos (`vitest.config.ts` com `projects`):
  - **unit** (`tests/unit/**`, ambiente `jsdom` para componentes, `node` para libs): `money`,
    `planning`, schemas Zod, componentes cliente (`OverBudgetAlert`, `AllocationSlider`,
    formulários) com Testing Library.
  - **integration** (`tests/integration/**`, ambiente `node`, sequencial): cada Server Action
    chamada diretamente contra um banco PostgreSQL de teste (Supabase local via
    `supabase start`, schema aplicado com `prisma migrate deploy`). `getCurrentUserId` e
    `revalidatePath` são mockados; dois usuários de teste validam isolamento (FR-006) e cada
    action protegida tem caso "não autenticado".
  - **spec** (`tests/unit/specs/001-financial-planning.spec.test.ts`): teste unitário
    rastreável à spec, cobrindo os cenários de cálculo das User Stories 2, 3 e 6.
- **Nota**: o Supabase CLI é usado só para subir o ambiente local; migrations seguem
  exclusivamente pelo Prisma Migrate (Princípio V).
- **Alternatives considered**: Playwright E2E (útil depois, mas não exigido pela constituição;
  fica para uma feature futura).

## R11. UI

- **Decision**: Tailwind CSS 4 + shadcn/ui (Button, Input, Label, Select, Slider, Card,
  Alert, AlertDialog). Textos da interface em português; identificadores em inglês
  (Princípio I).
