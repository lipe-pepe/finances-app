---

description: "Task list for feature 005-user-profile"
---

# Tasks: Perfil do usuário

**Input**: Design documents from `/specs/005-user-profile/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md,
contracts/ui.md, quickstart.md

**Tests**: obrigatórios pela constituição (Princípio II). Cada funcionalidade nova precisa de teste
unitário, a spec precisa de um teste unitário rastreável e cada endpoint precisa de ao menos um
teste de integração: `updateProfile` e a consulta `getProfile`. Escrever os testes antes e vê-los
falhar. Os testes de integração só rodam com o Supabase local (Docker); sem ele, registrar isso no
corpo do commit e no relatório.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Convenções obrigatórias para todas as tarefas

- Identificadores, rotas, tabelas e colunas em inglês; comentários em português; textos de UI em
  pt-BR (Princípio I).
- Todo `"use client"` novo leva, na linha seguinte, um comentário em português justificando o uso
  (Princípio III).
- Textos da UI do perfil vêm de `src/features/profile/labels.ts`; caminhos vêm de
  `src/lib/app-routes.ts` (nunca `"/profile"` escrito à mão fora desse arquivo e dos testes).
- Somente tokens do tema: nada de hex, `bg-[#...]`, `text-[13px]` nem cores da paleta bruta; a
  borda do avatar usa `avatar-ring` (Princípio VI).
- O email **nunca** é lido do `FormData` nem gravado (FR-016/017). A cor do usuário está fora do
  escopo: nenhum campo, token ou texto de cor personalizada.
- Nenhuma chave privilegiada (`SUPABASE_SERVICE_ROLE_KEY`) em `src/`; o Storage é acessado com o
  cliente da sessão (`createSupabaseServerClient`). O cliente admin existe só em `tests/setup/`.
- Commits por tarefa ou grupo coeso no padrão `tipo(escopo): descrição [T###]` (primeira linha
  ≤ 72 caracteres), feitos apenas com testes unitários, `npx tsc --noEmit` e lint passando.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Adicionar os componentes do shadcn/ui com `npx shadcn@4.23.0 add avatar dropdown-menu -y`, gerando `src/components/ui/avatar.tsx` e `src/components/ui/dropdown-menu.tsx` (sem dependências novas: usam o pacote `radix-ui` já instalado); em cada arquivo, na linha seguinte ao `"use client"`, incluir o comentário "// Client Component: primitivo do Radix (shadcn/ui) que controla estado e eventos no navegador."; remover do código gerado qualquer valor visual escrito à mão, se houver; conferir que `npm run test:unit` (inclusive `tests/unit/design`) e `npx tsc --noEmit` continuam passando
- [ ] T002 [P] Em `next.config.ts`, acrescentar `experimental: { serverActions: { bodySizeLimit: "3mb" } }`, com o comentário em português "Foto do perfil até 2 MB + sobra do multipart (specs/005-user-profile/research.md R4)"; mantendo a configuração `turbopack` existente

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Acrescentar `PROFILE_PATH = "/profile"` em `src/lib/app-routes.ts`, sem alterar `AppSection` (o perfil não é uma seção da navegação)
- [ ] T004 [P] Escrever testes unitários em `tests/unit/lib/initials.test.ts` para `src/lib/initials.ts`: `getInitials({ firstName: "Felipe", lastName: "Pêpe", email: "x@y.com" })` → `"FP"`; `({ firstName: "ana", lastName: null, ... })` → `"A"`; `({ firstName: "Élio", lastName: "Ávila", ... })` → `"ÉÁ"`; `({ firstName: null, lastName: null, email: "maria@teste.local" })` → `"M"`; `({ firstName: "  ", lastName: null, email: "z@t.com" })` → `"Z"`; o resultado nunca passa de 2 caracteres; `getDisplayName({ firstName: "Ana-Clara", lastName: "D'Ávila", email })` → `"Ana-Clara D'Ávila"`; `({ firstName: "Ana", lastName: null, email })` → `"Ana"`; `({ firstName: null, lastName: null, email: "a@b.com" })` → `"a@b.com"`
- [ ] T005 Implementar `src/lib/initials.ts` (funções puras `getInitials` e `getDisplayName`; `trim`, primeiro caractere via `Array.from`, `toLocaleUpperCase("pt-BR")`) até T004 passar
- [ ] T006 [P] Escrever testes unitários em `tests/unit/lib/avatar-file.test.ts` para `src/lib/avatar-file.ts`: `AVATAR_MAX_BYTES === 2 * 1024 * 1024`; `AVATAR_ACCEPT === "image/jpeg,image/png,image/webp"`; `detectAvatarType` com `Uint8Array` iniciando em `FF D8 FF E0` → `"image/jpeg"`, `89 50 4E 47 0D 0A 1A 0A` → `"image/png"`, `"RIFF" + 4 bytes + "WEBP"` → `"image/webp"`, `"GIF89a"` → `null`, texto `"hello"` → `null`, array vazio → `null`; `extensionFor("image/jpeg")` → `"jpg"`, `"image/png"` → `"png"`, `"image/webp"` → `"webp"`; `checkAvatarFile({ size, type })` (validação no cliente): `{ size: 2097152, type: "image/png" }` → `null`, `{ size: 2097153, type: "image/png" }` → `AVATAR_FILE_ERROR`, `{ size: 1000, type: "image/gif" }` → `AVATAR_FILE_ERROR`; `AVATAR_FILE_ERROR === "Use uma imagem JPG, PNG ou WebP de até 2 MB."`
- [ ] T007 Implementar `src/lib/avatar-file.ts` (funções puras, sem Node/Next, usáveis no cliente e no servidor) até T006 passar
- [ ] T008 [P] Escrever testes unitários em `tests/unit/schemas/profile.schemas.test.ts` para `profileSchema` de `src/features/profile/schemas.ts`: `{ firstName: " Ana ", lastName: "" }` → `{ firstName: "Ana", lastName: null }`; `{ firstName: "Ana-Clara", lastName: "D'Ávila" }` aceito; `firstName: ""` e `"   "` → erro "Informe o nome."; `firstName` com 51 caracteres → "Use no máximo 50 caracteres."; com 50 → aceito; `lastName` com 51 → "Use no máximo 50 caracteres."; uma chave extra `email` é descartada do resultado (não aparece em `data`)
- [ ] T009 Implementar `src/features/profile/schemas.ts` com `profileSchema` (Zod 4: `firstName` obrigatório, `trim`, de 1 a 50 caracteres; `lastName` opcional, `trim`, até 50, string vazia → `null`), os tipos `ProfileFormValues` (entrada do formulário, strings) e `ProfileInput` (`{ firstName: string; lastName: string | null }`) até T008 passar
- [ ] T010 [P] Criar `src/features/profile/labels.ts` com os textos de contracts/ui.md: `PROFILE_TITLE = "Perfil"`, `MENU_PROFILE = "Perfil"`, `MENU_SIGN_OUT = "Sair"`, `accountMenuLabel(name)` → `"Menu da conta de ${name}"`, `FIELD_LABELS = { firstName: "Nome", lastName: "Sobrenome", email: "Email" }`, `NAME_NOT_SET = "Nome não informado"`, `VALUE_NOT_SET = "Não informado"`, `COMPLETE_PROFILE_HINT = "Complete seu perfil adicionando seu nome."`, `EDIT_PROFILE = "Editar perfil"`, `SAVE = "Salvar"`, `SAVING = "Salvando…"`, `CANCEL = "Cancelar"`, `CHOOSE_PHOTO = "Escolher foto"`, `REMOVE_PHOTO = "Remover foto"`, `EMAIL_READ_ONLY_NOTE = "O email não pode ser alterado."`, `PROFILE_SAVED = "Perfil atualizado."`, `DISCARD_TITLE = "Descartar alterações?"`, `DISCARD_DESCRIPTION = "As alterações que você fez no perfil não foram salvas."`, `KEEP_EDITING = "Continuar editando"`, `DISCARD = "Descartar"`; cobrir os textos com função em `tests/unit/lib/profile-labels.test.ts`
- [ ] T011 [P] Adicionar ao `src/app/globals.css` o token `--avatar-ring` em `:root` e no bloco `@media (prefers-color-scheme: dark)`, e `--color-avatar-ring: var(--avatar-ring);` no `@theme inline`, com um cinza neutro da mesma família de `--muted-foreground`; escolher valores com contraste ≥ 3:1 contra `--background` e `--card` nos dois temas (ponto de partida: claro `#8a877f`, escuro `#7c7972`; ajustar se não passar); acrescentar os pares `["avatar-ring", "background"]` e `["avatar-ring", "card"]` à lista de componentes de interface (3:1) em `tests/unit/design/contrast.test.ts`
- [ ] T012 Adicionar ao `prisma/schema.prisma` o modelo `Profile` (`@@map("profiles")`) com, exatamente: `userId String @id @map("user_id") @db.Uuid`; `firstName String? @map("first_name") @db.VarChar(50)`; `lastName String? @map("last_name") @db.VarChar(50)`; `avatarPath String? @map("avatar_path")`; `updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)`; comentário em português "Dados de apresentação da conta (1:1 com auth.users); criado no primeiro salvamento"; rodar `npx prisma generate`
- [ ] T013 Criar a migração `prisma/migrations/20261111000000_profiles/migration.sql` com o Prisma Migrate (`npx prisma migrate diff --from-schema <schema anterior, de git show HEAD:prisma/schema.prisma> --to-schema prisma/schema.prisma --script`, como nas migrações anteriores) e acrescentar à mão, no mesmo arquivo e no padrão de `20261109000000_actual_expenses/migration.sql`: FK `profiles_user_id_fkey` → `auth.users("id") ON DELETE CASCADE`; `CHECK ("first_name" IS NULL OR char_length("first_name") BETWEEN 1 AND 50)` como `profiles_first_name_check`; o mesmo para `last_name` (`profiles_last_name_check`); `CHECK ("avatar_path" IS NULL OR "avatar_path" LIKE "user_id"::text || '/%')` como `profiles_avatar_path_check`; `ENABLE ROW LEVEL SECURITY`; políticas `profiles_select_own`, `_insert_own`, `_update_own` e `_delete_own` `TO authenticated` com `auth.uid() = "user_id"`. Em seguida, num bloco comentado "Supabase Storage (schema storage, não auth)": `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('avatars', 'avatars', false, 2097152, ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT (id) DO NOTHING;` e quatro políticas em `storage.objects` (`avatars_select_own`, `avatars_insert_own`, `avatars_update_own`, `avatars_delete_own`), cada uma precedida de `DROP POLICY IF EXISTS`, `TO authenticated`, com `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text` em USING e/ou WITH CHECK; conferir com `npx prisma validate`. A aplicação no banco remoto é feita pelo usuário (T050)
- [ ] T014 Atualizar `tests/setup/db.ts`: `resetDatabase()` também roda `prisma.profile.deleteMany()` e esvazia o bucket `avatars` com o cliente admin (listar as pastas dos usuários de teste e `remove` dos objetos); acrescentar os helpers `createProfileRow(userId, { firstName, lastName, avatarPath })`, `signInAs(email)` (faz `signInWithPassword` via `signIn` de `@/features/auth/actions`, engolindo o `RedirectError`, para gravar a sessão no cookie mock) e `pngBytes()` / `jpegBytes()` que devolvem `Uint8Array` mínimos e válidos para os testes de upload
- [ ] T015 Criar `src/features/profile/avatar-storage.ts` (`import "server-only"`) com `AVATAR_BUCKET = "avatars"`, `SIGNED_URL_TTL_SECONDS = 3600`, `uploadAvatar(supabase, userId, bytes, type)` → grava em `` `${userId}/${crypto.randomUUID()}.${extensionFor(type)}` `` com `contentType: type` e `upsert: false`, devolvendo o caminho ou lançando um erro; `removeAvatar(supabase, path)` → `remove([path])`, e falha só registrada com `console.error`; `getAvatarSignedUrl(supabase, path)` → `createSignedUrl(path, SIGNED_URL_TTL_SECONDS)`, com `null` (e log) em caso de erro; comentários em português citando research.md R2/R3
- [ ] T016 [P] Escrever testes de integração em `tests/integration/profile.queries.test.ts` para `getProfile(userId)` (com `signInAs` do usuário A, sem mockar `@/lib/auth`): sem linha em `profiles` → `{ firstName: null, lastName: null, email: TEST_USERS.a, avatarUrl: null, initials: "U", displayName: TEST_USERS.a }`; com `createProfileRow(A, { firstName: "Ana", lastName: "Souza" })` → `initials: "AS"`, `displayName: "Ana Souza"`; com `avatarPath` de um objeto enviado de verdade → `avatarUrl` começa com `NEXT_PUBLIC_SUPABASE_URL` e contém `/storage/v1/object/sign/avatars/`; com `avatarPath` de objeto inexistente → `avatarUrl: null`; a linha do usuário B nunca é devolvida para A
- [ ] T017 Implementar `src/features/profile/queries.ts` (`import "server-only"`): `getProfile` envolvida em `cache()` do React, que lê `prisma.profile.findUnique({ where: { userId } })`, pega o email de `supabase.auth.getUser()` e gera `avatarUrl` com `getAvatarSignedUrl`; devolve `ProfileView` (data-model.md) com `initials` e `displayName` de `src/lib/initials.ts`; até T016 passar (com o Supabase local)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Avatar e menu da conta no cabeçalho (Priority: P1) 🎯 MVP

**Goal**: avatar (foto ou iniciais, borda cinza) no canto direito do cabeçalho, com menu "Perfil" / "Sair"; o botão "Sair" solto deixa de existir.

**Independent Test**: logado, em `/control` e `/planning`, ver o avatar à direita; abrir o menu pelo mouse e pelo teclado; "Perfil" leva a `/profile` e "Sair" leva a `/login`.

### Tests for User Story 1 ⚠️

- [ ] T018 [P] [US1] Escrever testes unitários em `tests/unit/components/user-avatar.test.tsx` para `UserAvatar`: com `avatarUrl: null` e `initials: "FP"`, mostra o texto "FP"; com `avatarUrl` definido, a imagem tem o `alt` recebido (simular o `load` da imagem no jsdom, ou testar o fallback disparando `error` na `<img>` → mostra as iniciais); o elemento raiz tem a classe da borda `avatar-ring` nos dois tamanhos; `size="sm"` e `size="lg"` aplicam `size-9` e `size-24`
- [ ] T019 [P] [US1] Escrever testes unitários em `tests/unit/components/account-menu.test.tsx` para `AccountMenu` (mockar `@/features/auth/actions` com `signOut: vi.fn()`; usar `userEvent`): o gatilho é um botão com nome acessível "Menu da conta de Ana Souza"; ao clicar, aparecem `menuitem` "Perfil" (link com `href="/profile"`) e "Sair", nessa ordem, além do nome e do email; Esc fecha o menu e devolve o foco ao gatilho; Enter no gatilho focado abre o menu; o item "Sair" está dentro de um `form`
- [ ] T020 [P] [US1] Atualizar `tests/unit/components/app-header.test.tsx`: mockar `@/lib/auth` (`requireUserId` → `"user-1"`) e `@/features/profile/queries` (`getProfile` → um `ProfileView` fixo); renderizar o Server Component assíncrono com `render(await AppHeader({ current: "control" }))`; manter os testes de navegação e de `aria-current`; trocar "mantém o botão Sair" por: não existe `button` "Sair" visível no cabeçalho e existe o botão "Menu da conta de …"; sem `current` (`AppHeader({})`), nenhum link tem `aria-current`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Criar `src/features/profile/components/user-avatar.tsx` (Client; justificar: "o fallback para as iniciais depende do evento de erro de carregamento da imagem no navegador") com `Avatar`, `AvatarImage` e `AvatarFallback` de `src/components/ui/avatar.tsx`; props `avatarUrl`, `initials`, `alt` e `size: "sm" | "lg"`; borda `ring-2 ring-avatar-ring` (ou `border-2 border-avatar-ring`) com `ring-offset` de `bg-background`; imagem `object-cover`; fallback `bg-muted text-muted-foreground font-semibold`; até T018 passar
- [ ] T022 [US1] Criar `src/features/profile/components/account-menu.tsx` (Client; justificar: "menu suspenso com estado aberto/fechado, foco e navegação por teclado (Radix)") seguindo contracts/ui.md: gatilho `button` de 44 × 44 px (`size-11 rounded-full`) com `UserAvatar size="sm"` e `aria-label={accountMenuLabel(displayName)}`; `DropdownMenuContent align="end"` com `DropdownMenuLabel` (nome e email com `truncate`, `max-w-64`), separador, item "Perfil" (`asChild` + `next/link` para `PROFILE_PATH`, ícone `User`) e item "Sair" (`<form action={signOut}>` com botão de envio, ícone `LogOut`); itens com `min-h-11`; até T019 passar
- [ ] T023 [US1] Atualizar `src/features/planning/components/app-header.tsx`: transformar em `async`; `current?: AppSection` opcional; chamar `requireUserId()` e `getProfile(userId)`; substituir `<SignOutButton />` por `<AccountMenu profile={profile} />` como último item à direita; atualizar o comentário do componente (FR-001/006); até T020 passar
- [ ] T024 [US1] Remover `src/features/auth/components/sign-out-button.tsx` e conferir com `grep -rn "SignOutButton" src tests` que não sobrou referência; conferir que `src/app/control/page.tsx` e `src/app/planning/page.tsx` continuam compilando sem mudanças (`npx tsc --noEmit`)

**Checkpoint**: User Story 1 funcional — avatar e menu em todas as páginas logadas; "Perfil" leva a uma rota que entra na US2.

---

## Phase 4: User Story 2 - Ver o próprio perfil (Priority: P1)

**Goal**: página `/profile` que mostra foto (ou iniciais), nome e sobrenome e email, com textos indicativos quando faltam dados.

**Independent Test**: pelo menu do avatar, abrir o perfil de uma conta sem perfil e de uma com nome e foto; sem sessão, `/profile` redireciona para o login.

### Tests for User Story 2 ⚠️

- [ ] T025 [P] [US2] Escrever testes unitários em `tests/unit/components/profile-editor.test.tsx` (modo leitura; mockar `@/features/profile/actions`): com nome e sobrenome, mostra `heading` com "Ana Souza", os rótulos "Nome", "Sobrenome" e "Email" com os valores e o botão "Editar perfil"; com `firstName: null`, mostra "Nome não informado" e "Complete seu perfil adicionando seu nome."; `lastName: null` → "Não informado" no sobrenome; o email aparece como texto
- [ ] T026 [P] [US2] Acrescentar a `tests/unit/lib/auth-redirect.test.ts`: `resolveAuthRedirect("/profile", false)` → `"/login"` e `resolveAuthRedirect("/profile", true)` → `null`

### Implementation for User Story 2

- [ ] T027 [US2] Criar `src/features/profile/components/profile-editor.tsx` (Client; justificar: "alterna entre leitura e edição, controla o formulário (React Hook Form) e a prévia da foto") com o estado `isEditing` e, por enquanto, só o modo leitura de contracts/ui.md: `UserAvatar size="lg"`, `<h2>` com `displayName` ou `NAME_NOT_SET` (`text-muted-foreground`), lista de definições (`dl`) com Nome/Sobrenome/Email (vazio → `VALUE_NOT_SET`), `COMPLETE_PROFILE_HINT` quando não há nome, botão "Editar perfil" (ícone `Pencil`, `min-h-11`); textos de `labels.ts`; até T025 passar
- [ ] T028 [US2] Criar `src/app/profile/page.tsx` (Server Component, comentário em português): `requireUserId()`, `getProfile(userId)`, `<AppHeader />` sem `current` e `<main className="mx-auto w-full max-w-2xl px-4 py-8 tablet:px-6 tablet:py-10">` com `<h1>`/título visual `PROFILE_TITLE` e `<ProfileEditor profile={profile} />`; `export const metadata = { title: "Perfil · Finanças Pessoais" }`; conferir T026 (o proxy já protege `/profile`)

**Checkpoint**: User Stories 1 e 2 funcionais — avatar, menu, logout e página de perfil em modo leitura.

---

## Phase 5: User Story 3 - Editar nome e sobrenome (Priority: P2)

**Goal**: "Editar perfil" transforma os dados em formulário (nome, sobrenome; email só leitura), com "Salvar"/"Cancelar", validação no cliente e no servidor, e o cabeçalho atualizado após salvar.

**Independent Test**: editar nome e sobrenome e salvar → perfil e iniciais do cabeçalho mudam sem recarregar; cancelar não muda nada; nome vazio é recusado; o email não pode ser editado.

### Tests for User Story 3 ⚠️

- [ ] T029 [P] [US3] Escrever testes de integração em `tests/integration/profile.actions.test.ts` para `updateProfile(formData)` (sem mockar `@/lib/auth`; `signInAs` do usuário A): `firstName=" Ana "`, `lastName=""` → `{ ok: true }`, a linha em `profiles` tem `firstName: "Ana"`, `lastName: null`, e `revalidatePath` foi chamado com `("/", "layout")`; segunda chamada com `lastName="Souza"` atualiza a mesma linha (upsert); `firstName=""` → `VALIDATION` com `fieldErrors.firstName`, nada gravado; `firstName` com 51 caracteres → `VALIDATION`; `FormData` com `email="outro@teste.local"` → `ok`, e `supabase.auth.getUser()` continua devolvendo `TEST_USERS.a` (FR-017, SC-006); sem sessão (`resetCookies()`) → `{ ok: false, error: { code: "UNAUTHENTICATED" } }` e nada gravado; salvar como B nunca altera a linha de A
- [ ] T030 [P] [US3] Acrescentar a `tests/unit/components/profile-editor.test.tsx` (modo edição; `updateProfile` mockado): "Editar perfil" mostra os campos "Nome" e "Sobrenome" preenchidos, o email como texto com "O email não pode ser alterado." e nenhum `textbox` de email; o foco vai para "Nome"; nome vazio + "Salvar" → "Informe o nome." e `updateProfile` não é chamado; "Salvar" válido chama `updateProfile` com um `FormData` contendo `firstName`/`lastName` e sem `email`; em sucesso, volta ao modo leitura e mostra "Perfil atualizado." em `role="status"`; `VALIDATION` do servidor aparece no campo; falha de conexão (mock rejeitando) mostra a mensagem de conexão e mantém os valores digitados; "Cancelar" volta ao modo leitura com os valores antigos
- [ ] T031 [P] [US3] Escrever testes unitários em `tests/unit/hooks/use-unsaved-changes-guard.test.ts` para `useUnsavedChangesGuard` (`renderHook`; mockar `next/navigation` `useRouter`): com `isDirty=false`, clicar num `<a href="/planning">` do documento não é interceptado; com `isDirty=true`, o clique é prevenido e `pendingHref === "/planning"`; `confirmDiscard()` chama `router.push("/planning")`; `cancelDiscard()` limpa `pendingHref`; links externos, `target="_blank"` e cliques com Ctrl/Meta não são interceptados; com `isDirty=true`, um `beforeunload` disparado tem `defaultPrevented`; o listener sai ao desmontar

### Implementation for User Story 3

- [ ] T032 [US3] Criar `src/features/profile/actions.ts` (`"use server"`) com `updateProfile(formData: FormData): Promise<ActionResult>` via `authenticatedAction`: lê **apenas** `firstName` e `lastName` do `FormData`, valida com `profileSchema` (`validationError` em caso de erro), faz `prisma.profile.upsert({ where: { userId }, create: { userId, ...data }, update: data })` e chama `revalidatePath("/", "layout")`; comentário em português citando FR-016/017 (o email nunca é lido); até T029 passar (com o Supabase local)
- [ ] T033 [P] [US3] Criar `src/features/profile/hooks/use-unsaved-changes-guard.ts` (`"use client"` justificado: "escuta eventos do documento e da janela") com a assinatura `useUnsavedChangesGuard(isDirty: boolean)` → `{ pendingHref, confirmDiscard, cancelDiscard }`: listener de `click` na fase de captura que intercepta `<a>` de mesma origem (sem `target="_blank"`, `download` nem teclas modificadoras) e um `beforeunload`, ambos ativos só com `isDirty`; até T031 passar
- [ ] T034 [US3] Implementar o modo edição em `src/features/profile/components/profile-editor.tsx` seguindo contracts/ui.md: `useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues })`; campos `Input` + `Label` "Nome" (`maxLength={50}`, `autoComplete="given-name"`, foco ao entrar no modo de edição) e "Sobrenome" (`autoComplete="family-name"`) com `FormFieldError`; o email como texto com `EMAIL_READ_ONLY_NOTE`; "Salvar" (`SAVING` e `disabled` durante o envio) e "Cancelar" (`reset()`, volta à leitura e devolve o foco a "Editar perfil"); envio monta o `FormData` e usa `runAction` + `applyFieldErrors` de `src/lib/handle-action-result.ts`; mensagem geral em `Alert`; sucesso → leitura + `PROFILE_SAVED` em `role="status"`; `useUnsavedChangesGuard(isEditing && isDirty)` ligado a um `AlertDialog` (`DISCARD_TITLE`, `DISCARD_DESCRIPTION`, `KEEP_EDITING`, `DISCARD`); até T030 passar

**Checkpoint**: User Story 3 funcional — editar e salvar nome/sobrenome, cabeçalho atualizado sem recarregar.

---

## Phase 6: User Story 4 - Trocar ou remover a foto (Priority: P2)

**Goal**: no modo edição, escolher JPG/PNG/WebP de até 2 MB com prévia, salvar no bucket privado e exibir no perfil e no cabeçalho; remover a foto volta às iniciais.

**Independent Test**: escolher foto válida → prévia → salvar → foto no perfil e no cabeçalho; arquivo de 3 MB ou não-imagem é recusado; "Remover foto" + salvar → iniciais e objeto apagado do bucket.

### Tests for User Story 4 ⚠️

- [ ] T035 [P] [US4] Acrescentar a `tests/integration/profile.actions.test.ts` (com `signInAs` de A): `photo` = `new File([pngBytes()], "eu.png", { type: "image/png" })` → `ok`, `avatarPath` casa com `^<userIdA>/[0-9a-f-]{36}\.png$` e o objeto existe no bucket; uma nova foto JPEG troca o `avatarPath` para `.jpg` e o objeto anterior deixa de existir; arquivo de `AVATAR_MAX_BYTES + 1` bytes → `VALIDATION` com `fieldErrors.photo = [AVATAR_FILE_ERROR]` e `avatarPath` inalterado; bytes de texto num `File` chamado `"x.png"` com `type: "image/png"` → `VALIDATION` em `photo`; `removePhoto="true"` → `avatarPath: null` e o objeto apagado; `photo` e `removePhoto` juntos → a foto nova prevalece; isolamento (SC-008): com a sessão de B, `storage.from("avatars").download(<caminho de A>)` falha, `list(<userIdA>)` devolve vazio e `upload("<userIdA>/x.png", ...)` é recusado
- [ ] T036 [P] [US4] Acrescentar a `tests/unit/components/profile-editor.test.tsx` (foto; mockar `URL.createObjectURL`/`revokeObjectURL`): "Escolher foto" aciona o `input[type=file]` com `accept="image/jpeg,image/png,image/webp"`; ao escolher um PNG válido, aparece a prévia (`img` com a URL de objeto); um arquivo de 3 MB ou GIF mostra `AVATAR_FILE_ERROR` e não gera prévia; "Remover foto" só aparece com foto atual ou prévia; "Salvar" envia `photo` no `FormData` (ou `removePhoto="true"`); "Cancelar" descarta a prévia e chama `revokeObjectURL`; escolher foto sem mexer nos nomes também ativa a guarda de alterações não salvas

### Implementation for User Story 4

- [ ] T037 [US4] Estender `updateProfile` em `src/features/profile/actions.ts` seguindo contracts/server-actions.md e research.md R5: ler `photo` (`File` com `size > 0`) e `removePhoto === "true"`; validar o tamanho (`> AVATAR_MAX_BYTES` → `fieldError("photo", AVATAR_FILE_ERROR)`) e o tipo por `detectAvatarType(new Uint8Array(await photo.arrayBuffer()))` (`null` → mesmo erro), antes de qualquer gravação; buscar o `avatarPath` atual; com foto nova, `uploadAvatar` com o tipo detectado; `upsert` com `avatarPath` novo, `null` (remoção) ou inalterado; se o `upsert` falhar, `removeAvatar` do upload novo e relançar (vira `UNKNOWN`); após sucesso, `removeAvatar` do caminho anterior quando trocado ou removido; `revalidatePath("/", "layout")`; até T035 passar (com o Supabase local)
- [ ] T038 [US4] Implementar a foto no modo edição de `src/features/profile/components/profile-editor.tsx`: `input type="file"` oculto (`accept={AVATAR_ACCEPT}`, `sr-only`) acionado por "Escolher foto" (`Button variant="outline"`, ícone `Camera`); validar com `checkAvatarFile` (erro em `photo` via `setError`, exibido com `FormFieldError`); prévia com `URL.createObjectURL` no `UserAvatar size="lg"`, revogada ao trocar, cancelar ou desmontar; "Remover foto" (`variant="ghost"`, ícone `Trash2`) marca a remoção e mostra as iniciais; incluir `photo`/`removePhoto` no `FormData`; a guarda de alterações considera `isDirty || hasPhotoChange`; até T036 passar

**Checkpoint**: User Story 4 funcional — foto enviada, exibida por URL assinada, trocada e removida.

---

## Phase 7: User Story 5 - Perfil bem apresentado em qualquer tela (Priority: P3)

**Goal**: perfil e menu no visual da plataforma, de 360 px ao desktop, nos temas claro e escuro.

**Independent Test**: perfil (leitura e edição) e menu em 360, 768 e 1280 px, claro e escuro: sem rolagem horizontal, alvos ≥ 44 px, contraste legível.

### Tests for User Story 5 ⚠️

- [ ] T039 [P] [US5] Acrescentar a `tests/unit/components/profile-editor.test.tsx`: o contêiner usa layout em coluna com `tablet:flex-row` (foto ao lado dos dados a partir de 720 px); todos os `button` do modo leitura e edição têm `min-h-11` (ou `size-11`); o nome e o email têm `truncate` e o pai tem `min-w-0`; e a `tests/unit/components/account-menu.test.tsx`: o conteúdo do menu usa `align="end"` e tem largura máxima limitada (`max-w-[calc(100vw-2rem)]` não é permitido: usar `max-w-xs` ou equivalente da escala)

### Implementation for User Story 5

- [ ] T040 [US5] Ajustar o layout de `src/features/profile/components/profile-editor.tsx` conforme contracts/ui.md: `Card` com `flex flex-col items-center gap-6 tablet:flex-row tablet:items-start`; foto centralizada no celular; botões empilhados com `w-full` abaixo de 720 px e lado a lado a partir de `tablet`; `min-w-0` + `truncate` em nome e email; até T039 passar
- [ ] T041 [US5] Ajustar `src/features/profile/components/account-menu.tsx` e `src/features/planning/components/app-header.tsx` para 360 px: o avatar fica sempre visível à direita sem gerar rolagem horizontal (conferir com o `flex-wrap` atual); o menu com `max-w-xs` e `collisionPadding` do Radix para ficar inteiro dentro da tela; até T039 passar
- [ ] T042 [US5] Rodar `npm run test:unit -- tests/unit/design` (varredura de valores escritos à mão e contraste) e corrigir qualquer ocorrência em `src/features/profile/`, `src/components/ui/avatar.tsx` e `src/components/ui/dropdown-menu.tsx`

**Checkpoint**: todas as histórias funcionais e responsivas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Escrever `tests/unit/specs/005-user-profile.spec.test.ts` rastreável à spec (cenários citando FR/US): iniciais e nome exibido com e sem nome (FR-002, US2-2); `profileSchema` recusa nome vazio e com mais de 50 caracteres e descarta `email` (FR-015/017); `checkAvatarFile` e `detectAvatarType` recusam 2 MB + 1 byte e não-imagem (FR-018/019, SC-005); `PROFILE_PATH === "/profile"` e `/profile` protegido (FR-009); token `avatar-ring` com contraste ≥ 3:1 contra o fundo nos dois temas (FR-026); `AccountMenu` com "Perfil" e "Sair" nessa ordem (FR-003)
- [ ] T044 [P] Atualizar `README.md`: seção sobre o perfil (avatar, menu, `/profile`); nova migração e bucket `avatars` (`npm run db:deploy` após atualizar); limite de corpo das Server Actions em 3 MB; estrutura com `src/features/profile/` e `src/app/profile/`
- [ ] T045 Conferir que `SUPABASE_SERVICE_ROLE_KEY` não aparece em `src/` (`grep -rn SERVICE_ROLE src` vazio), que nenhum código em `src/` lê `email` de `FormData` (`grep -rn 'get("email")' src/features/profile` vazio) e que nenhum texto de cor personalizada ficou na UI
- [ ] T046 Auditoria final: todo `"use client"` em `src/` com comentário de justificativa; textos do perfil só em `labels.ts`; rodar `npm run test:unit`, `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros
- [ ] T047 Rodar `npm run db:deploy:test` e `npm run test:integration` se houver Supabase local; caso contrário, registrar no relatório e no corpo do commit que os testes de integração de T016, T029 e T035 não foram executados
- [ ] T048 [P] Verificar à mão, com `npm run dev`, os passos 1–14 de `specs/005-user-profile/quickstart.md` que forem possíveis localmente e registrar o resultado no relatório
- [ ] T049 Marcar as tarefas concluídas neste `tasks.md` e fazer o commit no padrão do projeto
- [ ] T050 (Usuário) Aplicar a migração no Supabase remoto com `npm run db:deploy` (cria `profiles` e o bucket `avatars`) e executar a validação manual de `specs/005-user-profile/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências. T001 é necessário para a US1 (avatar e menu); T002 só para a US4 (upload).
- **Foundational (Phase 2)**: T005 depende de T004; T007 de T006; T009 de T008; T013 de T012; T014 de T012 e T007; T015 de T007; T017 de T015, T016, T005 e T012. BLOQUEIA as histórias.
- **US1 (Phase 3)**: depende de T001, T003, T010, T011 e T017.
- **US2 (Phase 4)**: depende da US1 (T021 e T023, para o avatar e o cabeçalho) e de T003.
- **US3 (Phase 5)**: depende da US2 (T027, o `ProfileEditor`), de T009 e T014.
- **US4 (Phase 6)**: depende da US3 (T032 e T034), de T002, T007 e T015.
- **US5 (Phase 7)**: depende das US1–US4 (ajusta os mesmos componentes).
- **Polish (Phase 8)**: depende das histórias desejadas.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- `profile-editor.tsx` é editado por T027, T034, T038 e T040, que são sequenciais.
- `actions.ts` é editado por T032 e depois T037.
- `tests/integration/profile.actions.test.ts` é criado por T029 e estendido por T035.
- `tests/unit/components/profile-editor.test.tsx` é criado por T025 e estendido por T030, T036 e T039, também em sequência.

### Parallel Opportunities

- Setup: T001 e T002 em paralelo.
- Foundational: T003, T004, T006, T008, T010, T011 e T012 em paralelo; depois T005, T007, T009 e T013.
- US1: T018–T020 em paralelo; T021 em paralelo com os testes.
- US2: T025 e T026 em paralelo.
- US3: T029–T031 em paralelo; T032 e T033 em paralelo.
- US4: T035 e T036 em paralelo.
- Polish: T043, T044 e T048 em paralelo.

---

## Parallel Example: User Story 3

```bash
Task: "Testes de integração de updateProfile (nomes, email ignorado, sem sessão) em tests/integration/profile.actions.test.ts"
Task: "Testes do modo edição em tests/unit/components/profile-editor.test.tsx"
Task: "Testes do hook em tests/unit/hooks/use-unsaved-changes-guard.test.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)

1. Phase 1 + Phase 2
2. US1 (avatar, menu, logout) e US2 (perfil em leitura)
3. **PARAR e VALIDAR**: passos 1–4, 12 e 13 do quickstart (após `npm run db:deploy`)

### Incremental Delivery

1. Setup + Foundational
2. US1 → avatar e menu no lugar do "Sair"
3. US2 → página de perfil em leitura
4. US3 → editar nome e sobrenome
5. US4 → foto
6. US5 → responsividade e temas
7. Polish → teste da spec, README, auditorias, build

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências pendentes.
- Integração sem o Supabase local: os testes são escritos e carregam, mas não rodam; isso não
  bloqueia commits, desde que fique registrado.
- A migração só chega ao banco remoto quando o usuário rodar `npm run db:deploy` (T050). Até lá,
  o cabeçalho de todas as páginas falha ao consultar `profiles` no ambiente do usuário. Aplicar
  a migração antes de publicar a US1.
