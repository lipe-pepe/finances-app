# Contract: Server Actions e consultas

**Feature**: `005-user-profile`

Tipos comuns (`ActionResult`, `ActionError`) e regras gerais: os de
`specs/001-financial-planning/contracts/server-actions.md`. Cada action é um endpoint para o
Princípio II e MUST ter ao menos um teste de integração, incluindo o caso sem sessão.

## Profile — `src/features/profile/actions.ts` (novo)

| Action | Entrada | Sucesso (`data`) | Erros |
|---|---|---|---|
| `updateProfile(formData)` | `FormData` com `firstName`, `lastName`, `photo?` (File), `removePhoto?` (`"true"`) | `void` | `UNAUTHENTICATED`, `VALIDATION`, `UNKNOWN` |

Regras:

1. Executa via `authenticatedAction`; sem sessão → `UNAUTHENTICATED` e nada é gravado.
2. `firstName`/`lastName` validados com `profileSchema` (data-model.md). Erros →
   `VALIDATION` com `fieldErrors.firstName` / `fieldErrors.lastName`.
3. `photo` presente e com tamanho > 0:
   - tamanho > 2 MiB → `VALIDATION`, `fieldErrors.photo = ["Use uma imagem JPG, PNG ou WebP de até 2 MB."]`;
   - primeiros bytes não são JPEG, PNG ou WebP → mesma mensagem e mesmo campo;
   - a extensão gravada é derivada do tipo detectado, nunca do nome do arquivo.
4. `photo` e `removePhoto` juntos → a foto nova prevalece.
5. Qualquer outra chave do `FormData` (ex.: `email`) é ignorada; o email da conta nunca muda.
6. Ordem e falhas parciais: ver research.md R5. Falha de Storage ou de banco → `UNKNOWN`, sem
   alterar o perfil.
7. Em sucesso: `revalidatePath("/", "layout")`.

## Profile — `src/features/profile/queries.ts` (novo)

| Função | Entrada | Retorno |
|---|---|---|
| `getProfile(userId)` | id do usuário autenticado | `ProfileView` (data-model.md) |

Regras:

1. `server-only`, envolvida em `cache()` do React.
2. Lê `profiles` com `where: { userId }`. Sem linha → nomes `null` e `avatarUrl = null`.
3. O email vem de `supabase.auth.getUser()`.
4. Com `avatarPath`, gera a URL assinada (3600 s); se falhar, `avatarUrl = null` e registra no
   log (o avatar mostra as iniciais).

## `src/features/profile/avatar-storage.ts` (novo, `server-only`)

| Função | Responsabilidade |
|---|---|
| `uploadAvatar(supabase, userId, bytes, type)` | Grava `{userId}/{uuid}.{ext}` com `contentType` e devolve o caminho |
| `removeAvatar(supabase, path)` | Apaga o objeto; falha registrada no log, sem lançar exceção |
| `getAvatarSignedUrl(supabase, path)` | URL assinada por 3600 s, ou `null` |

Todas usam o cliente da sessão do usuário (`createSupabaseServerClient`).

## Alterações em código existente

| Item | Mudança |
|---|---|
| `signOut()` (`features/auth/actions.ts`) | Sem mudança de contrato; passa a ser chamada pelo item "Sair" do menu |
| `next.config.ts` | `experimental.serverActions.bodySizeLimit = "3mb"` |
| `lib/app-routes.ts` | `PROFILE_PATH = "/profile"` |
| `tests/setup/db.ts` | `resetDatabase()` também limpa `profiles` e esvazia o bucket `avatars` |
