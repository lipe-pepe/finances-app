# Finanças Pessoais

Plataforma de planejamento financeiro pessoal: o usuário cadastra seus ganhos (receita total),
divide a receita entre **Momento Presente** (gastos) e **Momento Futuro** (metas) com um slider e
acompanha alertas quando o planejamento é excedido. A tela é organizada em três abas: Receita,
Momento Presente e Momento Futuro.

Stack: Next.js 16 (App Router) · Supabase (PostgreSQL + Auth) · Prisma 7 · React Hook Form + Zod ·
Tailwind CSS 4 + shadcn/ui · Vitest.

Especificações, planos e tarefas: [`specs/`](specs/) (001: planejamento financeiro; 002: abas e
novos nomes).
Regras do projeto: [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

## Pré-requisitos

- Node.js 22+ e npm
- Um projeto no [Supabase](https://supabase.com) para desenvolvimento
- Para os testes de integração: Docker e o Supabase CLI (`npx supabase`)

## Configuração

1. Instale as dependências (o `postinstall` gera o Prisma Client):

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha:

   | Variável | Onde encontrar |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys (publishable/anon) |
   | `DATABASE_URL` | Connect → Transaction pooler (porta 6543), com `?pgbouncer=true` |
   | `DIRECT_URL` | Connect → Session pooler (porta 5432) |

   > A conexão direta (`db.<ref>.supabase.co`) só funciona com IPv6. Em redes ou no WSL sem
   > IPv6 ela falha com `P1001: Can't reach database server`; use o Session pooler.

3. Aplique o schema (tabelas, constraints e RLS) e as categorias iniciais:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

4. **Configure o Supabase Auth no painel** (Authentication → Sign In / Providers e Sessions):
   - Desligue **"Allow new users to sign up"**: o cadastro está fora de escopo e os usuários
     são criados pelo administrador. Sem isso, qualquer pessoa poderia se cadastrar pela API.
   - Mantenha desligados **"Time-box user sessions"** e **"Inactivity timeout"**, para que o
     usuário permaneça logado até clicar em "Sair".

5. Crie os usuários em Authentication → Users → **Add user** (email e senha, com "Auto Confirm").

6. Rode o app:

   ```bash
   npm run dev   # http://localhost:3000
   ```

## Banco de dados e migrations

- O schema fica em [`prisma/schema.prisma`](prisma/schema.prisma). **Toda migração é feita com o
  Prisma Migrate** (`npm run db:migrate -- --name <nome>`); nada de SQL manual no painel nem
  migrations do Supabase CLI.
- O que o Prisma não expressa (FK para `auth.users`, `CHECK`s e políticas RLS) é escrito à mão
  dentro do arquivo `migration.sql` gerado (use `--create-only` para editar antes de aplicar).
- O Prisma ignora o RLS; por isso toda consulta a dados de usuário filtra por `userId`. O RLS
  fica habilitado como defesa extra para acessos pela API do Supabase.

## Testes

```bash
npm run test:unit          # libs, schemas, componentes e o teste da spec
npm run test:integration   # Server Actions contra um banco Supabase local
npm test                   # todos
```

Os testes de integração precisam de um Supabase local:

```bash
npx supabase start                 # requer Docker; mostra URL e chaves
cp .env.test.example .env.test     # preencha as chaves exibidas pelo comando acima
npm run db:deploy:test             # aplica as migrations do Prisma no banco local
npm run db:seed:test               # categorias
npm run test:integration
```

O [`supabase/config.toml`](supabase/config.toml) já desativa o cadastro público e as migrations
do Supabase CLI no ambiente local.

## Estrutura

```text
prisma/                 schema, migrations (Prisma Migrate) e seed das categorias
src/app/                rotas: / (tela de planejamento) e /login
src/features/<domínio>/ actions (Server Actions), schemas (Zod) e componentes
src/lib/                dinheiro em centavos, regras de planejamento, auth, Prisma, Supabase
src/proxy.ts            renovação da sessão e redirecionamentos de autenticação
tests/unit/             testes unitários (Vitest + Testing Library)
tests/integration/      testes de integração das Server Actions
```
