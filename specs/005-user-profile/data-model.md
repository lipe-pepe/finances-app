# Data Model: Perfil do usuário

**Feature**: `005-user-profile` | **Date**: 2026-11-11

## Profile (nova tabela `profiles`)

Dados de apresentação de uma conta. Relação 1:1 com `auth.users`, e a linha só passa a existir no
primeiro salvamento do perfil.

| Campo (Prisma) | Coluna | Tipo | Regras |
|---|---|---|---|
| `userId` | `user_id` | `UUID`, PK | FK `auth.users(id) ON DELETE CASCADE` (SQL manual) |
| `firstName` | `first_name` | `VARCHAR(50)`, nulo | Nulo só enquanto o usuário nunca salvou; ao salvar é obrigatório, `trim`, de 1 a 50 caracteres |
| `lastName` | `last_name` | `VARCHAR(50)`, nulo | Opcional, `trim`, até 50 caracteres; vazio é gravado como `NULL` |
| `avatarPath` | `avatar_path` | `TEXT`, nulo | Caminho do objeto no bucket `avatars`, no formato `{userId}/{uuid}.{jpg\|png\|webp}`; `NULL` = sem foto |
| `updatedAt` | `updated_at` | `TIMESTAMPTZ(6)` | `@updatedAt` |

**SQL manual na migração** (Princípio V):

- FK `user_id → auth.users(id) ON DELETE CASCADE`.
- `CHECK (first_name IS NULL OR char_length(first_name) BETWEEN 1 AND 50)` e
  `CHECK (last_name IS NULL OR char_length(last_name) BETWEEN 1 AND 50)`.
- `CHECK (avatar_path IS NULL OR avatar_path LIKE user_id::text || '/%')`: a foto fica na pasta do
  próprio dono.
- RLS habilitado, com políticas `profiles_{select,insert,update,delete}_own` para o papel
  `authenticated` e a condição `auth.uid() = user_id`.

**Acesso via Prisma**: sempre com `where: { userId }`, sendo `userId` o de `auth.getUser()`. A
escrita usa `upsert({ where: { userId }, create: {...}, update: {...} })`.

## Conta (existente, `auth.users`, somente leitura)

| Campo | Uso |
|---|---|
| `id` | Dono do perfil e pasta da foto |
| `email` | Exibido no menu e no perfil; nunca alterado por esta feature (FR-016/017) |

## Objeto de foto (Supabase Storage, bucket `avatars`)

| Propriedade | Valor |
|---|---|
| Bucket | `avatars`, privado (`public = false`) |
| Limite do bucket | `file_size_limit` = 2 MiB (2.097.152 bytes); `allowed_mime_types` = `image/jpeg`, `image/png`, `image/webp` |
| Caminho | `{userId}/{uuid}.{ext}`, com um nome novo a cada upload |
| Políticas em `storage.objects` | SELECT, INSERT, UPDATE e DELETE para `authenticated` quando `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text` |
| Exibição | URL assinada válida por 3600 s, gerada no servidor |

## Tipos da aplicação

```ts
// Valor exposto às telas (features/profile/queries.ts)
type ProfileView = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;   // URL assinada ou null
  initials: string;           // 1–2 letras (R10)
  displayName: string;        // "Nome Sobrenome" ou o email
};

// Entrada validada (features/profile/schemas.ts)
type ProfileInput = { firstName: string; lastName: string | null };
```

## Transições da foto (em um salvamento)

| Estado antes | Ação no formulário | Estado depois | Limpeza |
|---|---|---|---|
| sem foto | escolhe foto | `avatarPath` novo | — |
| com foto A | escolhe foto B | `avatarPath` = B | apaga A após gravar o banco |
| com foto A | "Remover foto" | `avatarPath = NULL` | apaga A após gravar o banco |
| qualquer | não mexe na foto | inalterado | — |
| qualquer | "Cancelar" | inalterado (nada é enviado) | — |
