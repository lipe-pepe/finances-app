# Finanças Pessoais Constitution

## Core Principles

### I. Convenções de Idioma no Código

- Nomes de arquivos, diretórios, variáveis, funções, classes, tipos, interfaces, componentes,
  tabelas, colunas e rotas MUST ser escritos em inglês.
- Comentários no código (incluindo JSDoc/TSDoc) MUST ser escritos em português.
- Textos exibidos ao usuário final não são regidos por esta regra e seguem o idioma do produto.

**Rationale**: identificadores em inglês mantêm consistência com o ecossistema (Next.js,
Supabase, bibliotecas), enquanto comentários em português facilitam a leitura e manutenção
pela equipe do projeto.

### II. Cobertura de Testes Obrigatória (NÃO NEGOCIÁVEL)

- Toda funcionalidade MUST ter ao menos um teste unitário cobrindo seu comportamento principal.
- Toda spec (`specs/*/spec.md`) MUST ter ao menos um teste unitário rastreável a ela; o
  `tasks.md` da feature MUST listar explicitamente a(s) tarefa(s) desse teste.
- Todo endpoint (Route Handler, Server Action exposta ou função de API) MUST ter ao menos um
  teste de integração que exercite o fluxo de requisição → resposta, incluindo o caso de
  usuário não autenticado quando o endpoint for protegido.
- Os testes MUST ser escritos com Vitest.
- Uma funcionalidade, spec ou endpoint sem os testes exigidos acima NÃO é considerado concluído
  e MUST NOT ser mesclado.

**Rationale**: dados financeiros exigem alta confiabilidade; testes obrigatórios por
funcionalidade, spec e endpoint evitam regressões em cálculos e no acesso a dados.

### III. Server-Side Rendering em Primeiro Lugar

- Páginas e componentes MUST ser implementados como React Server Components / renderizados no
  servidor por padrão.
- Client Components (`"use client"`) MUST ser usados somente quando houver necessidade real
  (estado interativo, event handlers, APIs exclusivas do navegador, bibliotecas que exigem o
  cliente) e MUST ser mantidos o menor possível, próximos às folhas da árvore de componentes.
- Todo uso de `"use client"` MUST ter um comentário (em português) justificando por que o SSR
  não é possível naquele ponto.
- A busca de dados MUST ocorrer no servidor sempre que possível, evitando buscas no cliente.

**Rationale**: SSR reduz o JavaScript enviado ao navegador, melhora desempenho e SEO e mantém
credenciais e lógica sensível fora do cliente.

### IV. Formulários com React Hook Form

- Todo formulário MUST ser implementado com React Hook Form.
- A validação de dados do formulário MUST ser repetida no servidor antes de qualquer
  persistência; a validação do cliente é apenas uma conveniência de UX.
- Formulários não controlados manualmente com `useState` por campo MUST NOT ser criados.

**Rationale**: um padrão único de formulários reduz código repetitivo, padroniza validação e
mensagens de erro e melhora o desempenho por evitar re-renderizações desnecessárias.

### V. Supabase, Prisma e Autenticação

- O Supabase MUST ser a única camada de back-end e banco de dados (PostgreSQL) do projeto.
- O Prisma MUST ser o ORM do projeto: o schema do banco é definido em `prisma/schema.prisma`, e
  o acesso a dados no servidor MUST ser feito pelo Prisma Client.
- Toda migração de banco MUST ser criada e aplicada com o Prisma Migrate (`prisma migrate`), com
  os arquivos versionados em `prisma/migrations/`. Migrations via Supabase CLI, SQL manual no
  painel ou `prisma db push` em ambientes compartilhados MUST NOT ser usadas.
- SQL que o Prisma não expressa no schema (políticas RLS, triggers, funções) MUST ser incluído
  em arquivos de migração do Prisma, editados manualmente quando necessário.
- O schema `auth` gerenciado pelo Supabase Auth MUST NOT ser alterado por migrations do projeto.
- A autenticação MUST usar exclusivamente o Supabase Auth; soluções de autenticação próprias ou
  de terceiros MUST NOT ser introduzidas.
- Toda tabela com dados de usuário MUST ter Row Level Security (RLS) habilitado, com políticas
  que restrinjam o acesso ao próprio usuário.
- Como a conexão do Prisma ignora o RLS, toda consulta via Prisma a dados de usuário MUST
  filtrar pelo `id` do usuário autenticado, obtido do Supabase Auth no servidor.
- O Prisma Client e chaves privilegiadas (ex.: `service_role`, `DATABASE_URL`) MUST NOT ser
  expostos ao cliente.

**Rationale**: centralizar back-end e autenticação no Supabase simplifica a arquitetura; o
Prisma oferece tipagem forte e um único fluxo de migrations versionado; o RLS somado à
filtragem explícita por usuário garante o isolamento dos dados financeiros de cada usuário.

## Stack Tecnológica e Restrições

- **Front-end**: Next.js (App Router) com React e TypeScript.
- **Back-end / Banco de dados**: Supabase (PostgreSQL, RLS).
- **ORM e migrations**: Prisma (Prisma Client + Prisma Migrate).
- **Autenticação**: Supabase Auth.
- **Formulários**: React Hook Form.
- **Testes**: Vitest para testes unitários e de integração.
- A adoção de qualquer nova dependência de infraestrutura (outro banco, outro provedor de auth,
  outro ORM, outro framework de testes) MUST ser justificada e aprovada via emenda a esta constituição.

## Fluxo de Desenvolvimento e Quality Gates

- Toda feature MUST seguir o fluxo Spec Kit: spec → plan → tasks → implement.
- O `plan.md` de cada feature MUST conter uma verificação de conformidade (Constitution Check)
  com os cinco princípios acima.
- Antes de mesclar qualquer alteração, os seguintes gates MUST passar:
  1. Todos os testes Vitest executam com sucesso.
  2. Existem os testes exigidos pelo Princípio II (unitário por funcionalidade e por spec,
     integração por endpoint).
  3. Nomes em inglês e comentários em português (Princípio I).
  4. Todo `"use client"` está justificado (Princípio III).
  5. Formulários usam React Hook Form (Princípio IV).
  6. Alterações de schema possuem migration do Prisma Migrate, novas tabelas possuem RLS e
     consultas via Prisma filtram pelo usuário autenticado (Princípio V).
  7. As mensagens de commit seguem o padrão da seção "Commits e Controle de Versão".
- Revisões de código MUST verificar esses gates explicitamente.

## Commits e Controle de Versão

### Padrão de mensagem

- Toda mensagem de commit MUST seguir o formato:

  ```text
  tipo(escopo): descrição breve [T###]
  ```

  - **tipo** (MUST ser um destes): `feat` (nova funcionalidade), `fix` (correção de bug),
    `test` (somente testes), `refactor` (mudança sem alterar comportamento), `docs`
    (documentação, specs e constituição), `style` (formatação, sem mudança de lógica), `perf`
    (desempenho), `build` (dependências e build), `ci` (integração contínua), `chore`
    (manutenção e configuração).
  - **escopo** (MUST): a área afetada, em inglês e minúsculas, preferencialmente o domínio em
    `src/features/` (`auth`, `incomes`, `allocation`, `expenses`, `goals`, `planning`) ou uma
    área transversal (`db`, `ui`, `lib`, `tests`, `config`, `specs`, `constitution`).
  - **descrição** (MUST): em português, no imperativo ou presente, com no máximo 72 caracteres
    na primeira linha incluindo tipo e escopo, sem ponto final.
  - **referência à tarefa** (MUST quando o trabalho vem de um `tasks.md`): o id da tarefa entre
    colchetes ao final, ex.: `[T046]`; várias tarefas separadas por vírgula, ex.:
    `[T041, T046]`. Commits sem tarefa associada (ex.: emendas à constituição, correções
    pontuais fora de uma feature) omitem a referência.
- Exemplos válidos:
  - `feat(incomes): adiciona formulário de ganhos com React Hook Form [T046]`
  - `test(allocation): cobre salvamento automático do slider [T051]`
  - `docs(constitution): adiciona padrão de commits`
- Cada commit MUST conter uma unidade lógica de trabalho (uma tarefa ou um grupo coeso de
  tarefas); commits que misturam tarefas não relacionadas MUST NOT ser criados.
- O corpo do commit (opcional) MAY detalhar o porquê da mudança, em português.

### Commits feitos por agentes de IA

- Agentes de IA (ex.: Claude Code durante o `/speckit-implement`) estão AUTORIZADOS a criar
  commits sem pedir confirmação a cada commit, desde que sigam o padrão acima.
- Antes de cada commit, o agente MUST executar os testes afetados e MUST NOT commitar com
  testes falhando; se os testes de integração não puderem ser executados (ex.: banco
  indisponível), o agente MUST informar isso no corpo do commit e ao usuário.
- O agente MUST commitar na branch da feature (ex.: `001-financial-planning`), nunca
  diretamente na branch principal, salvo pedido explícito do usuário.
- Sem pedido explícito do usuário, o agente MUST NOT: fazer `push`, `force-push`, reescrever
  histórico já commitado (`rebase`, `amend`, `reset`), apagar branches ou mesclar na branch
  principal.
- O agente MUST NOT commitar segredos (arquivos `.env*` reais, chaves, senhas); apenas os
  arquivos de exemplo (`.env.example`, `.env.test.example`) são versionados.
- Ao concluir, o agente MUST informar ao usuário os commits criados (hash curto e mensagem).

**Rationale**: um padrão único de mensagens torna o histórico legível e rastreável até as
tarefas do Spec Kit; autorizar commits da IA dentro de limites claros agiliza o fluxo sem abrir
mão do controle humano sobre o que é publicado ou reescrito.

## Governance

- Esta constituição prevalece sobre quaisquer outras práticas ou convenções do projeto.
- Emendas MUST ser documentadas neste arquivo, com justificativa, e incluir plano de migração
  quando afetarem código existente.
- Versionamento semântico da constituição:
  - **MAJOR**: remoção ou redefinição incompatível de princípios ou regras de governança.
  - **MINOR**: novo princípio/seção ou expansão material de orientações.
  - **PATCH**: esclarecimentos, ajustes de redação e correções sem impacto semântico.
- Toda revisão de PR MUST verificar a conformidade com esta constituição; qualquer exceção MUST
  ser justificada por escrito no `plan.md` (seção de Complexity Tracking) da feature.
- A conformidade MUST ser reavaliada a cada nova feature durante o `/speckit-plan` e o
  `/speckit-analyze`.

**Version**: 1.2.0 | **Ratified**: 2026-11-08 | **Last Amended**: 2026-11-09
