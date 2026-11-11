# Implementation Plan: Perfil do usuário

**Branch**: `005-user-profile` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-user-profile/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Trocar o botão "Sair" do cabeçalho por um **avatar** (foto ou iniciais, borda cinza neutra) que
abre um menu com "Perfil" e "Sair", e criar a página **`/profile`**, que mostra foto, nome,
sobrenome e email e permite editar nome, sobrenome e foto (o email é só leitura).

Abordagem: nova tabela `profiles` (Prisma Migrate, RLS) com nome, sobrenome e caminho da foto; a
foto fica num bucket **privado** `avatars` do Supabase Storage, criado com as políticas na própria
migração do Prisma, e é exibida por URL assinada gerada no servidor. Uma única Server Action
`updateProfile(formData)` valida nomes com Zod e a foto pelos bytes do arquivo (JPG/PNG/WebP,
≤ 2 MB), grava no Storage com a sessão do usuário (sem `service_role`) e revalida o layout para o
cabeçalho refletir a mudança na mesma resposta. Componentes shadcn/ui novos: `avatar` e
`dropdown-menu`. Detalhes em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: Next.js 16.4 (App Router), React 19.3, Prisma 7, `@supabase/ssr`,
React Hook Form 7 + Zod 4, shadcn/ui (`radix-ui` já instalado). Novos componentes shadcn/ui:
`avatar` e `dropdown-menu`. Nenhuma dependência nova de infraestrutura.

**Storage**: Supabase PostgreSQL via Prisma (nova tabela `profiles`, 1 migração) e Supabase
Storage (novo bucket privado `avatars`, criado na mesma migração)

**Testing**: Vitest + Testing Library (unitários) e integração da Server Action e da consulta
contra Supabase local (Auth + Storage reais)

**Target Platform**: navegadores modernos, desktop e celular, temas claro e escuro

**Project Type**: aplicação web Next.js (mesmo projeto)

**Performance Goals**: cabeçalho atualizado na mesma resposta do salvamento (SC-004, ≤ 2 s);
edição de nome em < 30 s (SC-003)

**Constraints**: SSR por padrão; foto ≤ 2 MB validada no cliente e no servidor (pelos bytes, não
pela extensão); limite de corpo das Server Actions elevado para `3mb`; email nunca alterado
(FR-016/017); tokens do tema para a borda do avatar (FR-026)

**Scale/Scope**: 1 rota nova (`/profile`), 1 tabela, 1 bucket, 1 Server Action, 1 consulta,
~6 componentes novos, cabeçalho alterado nas 2 páginas existentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Rota `/profile`, modelo `Profile`, tabela `profiles`, colunas `first_name`, `last_name`, `avatar_path`, bucket `avatars`, domínio `profile`; comentários em português; textos de UI em pt-BR | ✅ Pass |
| II. Testes (não negociável) | Unitários: `initials`, `avatar-file` (tipo por bytes, tamanho), `profile.schemas`, `UserAvatar`, `AccountMenu`, `AppHeader` atualizado, `ProfileEditor`, `useUnsavedChangesGuard`, teste da spec `tests/unit/specs/005-user-profile.spec.test.ts`. Integração: `updateProfile` (sucesso, validação, foto, remoção, email ignorado, sem sessão) e `getProfile`, além do isolamento do bucket entre usuários A e B | ✅ Pass |
| III. SSR primeiro | Página `/profile`, `AppHeader` e consulta no servidor. Client Components justificados: `AccountMenu` (menu suspenso com foco e teclado), `UserAvatar` (fallback para iniciais quando a imagem falha ao carregar), `ProfileEditor` (alternância leitura/edição, RHF, prévia da foto, guarda de alterações não salvas) | ✅ Pass |
| IV. React Hook Form | Formulário do perfil com RHF + `profileSchema`; a foto é campo do mesmo formulário; validação repetida no servidor (`profileSchema` + `validateAvatarBytes`) | ✅ Pass |
| V. Supabase, Prisma e Auth | Migração do Prisma com a tabela, FK para `auth.users`, RLS e, em SQL manual, o bucket `avatars` e as políticas em `storage.objects` (schema `storage`, não `auth`). Consultas via Prisma filtram por `userId` de `auth.getUser()`. Upload com o cliente da sessão do usuário; nenhuma chave privilegiada no app | ✅ Pass |
| VI. Design system e acessibilidade | Novo token `--avatar-ring` (cinza neutro) nos dois temas com contraste ≥ 3:1 contra fundo e cabeçalho; nenhuma cor de significado fixo usada; menu operável por teclado; alvos ≥ 44 × 44 px; layout de 360 px a desktop | ✅ Pass |
| Commits | `tipo(escopo): descrição [T###]` por tarefa | ✅ Pass |

**Re-check pós-design (Phase 1)**: ✅ Pass. Duas decisões registradas em research.md sem violar a
constituição: SQL do schema `storage` dentro da migração do Prisma (R2) e o aumento de
`bodySizeLimit` das Server Actions (R4).

## Project Structure

### Documentation (this feature)

```text
specs/005-user-profile/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── server-actions.md
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
next.config.ts                                      # ALTERADO: serverActions.bodySizeLimit "3mb"

prisma/
├── schema.prisma                                   # ALTERADO: model Profile
└── migrations/<timestamp>_profiles/                # NOVO: tabela, FK auth.users, CHECKs, RLS,
                                                    #       bucket avatars e políticas do Storage

src/
├── app/
│   ├── globals.css                                 # ALTERADO: token --avatar-ring (claro/escuro)
│   └── profile/page.tsx                            # NOVO: página de perfil (Server Component)
├── components/ui/
│   ├── avatar.tsx                                  # NOVO (shadcn/ui)
│   └── dropdown-menu.tsx                           # NOVO (shadcn/ui)
├── lib/
│   ├── app-routes.ts                               # ALTERADO: PROFILE_PATH
│   ├── initials.ts                                 # NOVO: iniciais a partir de nome/email
│   └── avatar-file.ts                              # NOVO: limites, tipo pelos bytes, extensão
└── features/
    ├── auth/components/sign-out-button.tsx         # REMOVIDO (Sair vai para o menu)
    ├── planning/components/app-header.tsx          # ALTERADO: async, AccountMenu no lugar do Sair
    └── profile/                                    # NOVO
        ├── actions.ts                              # updateProfile
        ├── queries.ts                              # getProfile (cache por requisição)
        ├── schemas.ts                              # profileSchema
        ├── avatar-storage.ts                       # upload, remoção e URL assinada (server-only)
        ├── labels.ts                               # textos da UI do perfil
        ├── hooks/use-unsaved-changes-guard.ts
        └── components/
            ├── user-avatar.tsx                     # Client: foto ou iniciais, borda neutra
            ├── account-menu.tsx                    # Client: menu Perfil / Sair
            └── profile-editor.tsx                  # Client: leitura ⇄ edição, RHF, prévia

tests/
├── setup/db.ts                                     # ALTERADO: limpa profiles e o bucket avatars
├── unit/
│   ├── lib/{initials,avatar-file}.test.ts                       # NOVOS
│   ├── schemas/profile.schemas.test.ts                          # NOVO
│   ├── hooks/use-unsaved-changes-guard.test.ts                  # NOVO
│   ├── components/{user-avatar,account-menu,profile-editor}.test.tsx  # NOVOS
│   ├── components/app-header.test.tsx                           # ALTERADO
│   └── specs/005-user-profile.spec.test.ts                      # NOVO
└── integration/
    ├── profile.actions.test.ts                                  # NOVO
    └── profile.queries.test.ts                                  # NOVO
```

**Structure Decision**: novo domínio `src/features/profile`, seguindo a organização por domínio.
O `AppHeader` continua em `features/planning` para não mover um arquivo usado por todas as
páginas; ele passa a buscar o perfil sozinho, então as páginas não mudam de assinatura. Reaproveita
`authenticatedAction`, `runAction`/`applyFieldErrors`, `FormFieldError`, `AlertDialog`, `Button`,
`Input`, `Label` e `Card`.

## Complexity Tracking

Nenhuma violação da constituição; seção não aplicável.
