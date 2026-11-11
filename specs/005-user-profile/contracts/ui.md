# Contract: UI

**Feature**: `005-user-profile`

Textos em pt-BR, centralizados em `src/features/profile/labels.ts`. Todos os componentes usam
apenas tokens do tema (Princípio VI).

## Rota `/profile` — `src/app/profile/page.tsx`

- Server Component: `requireUserId()` → `getProfile(userId)` → `<AppHeader />` (sem `current`) +
  `<main>` com `<ProfileEditor profile={...} />`.
- Sem sessão: o proxy redireciona para `/login` (regra existente, FR-009).
- Layout: `main` com `max-w-2xl` centralizado. Abaixo de 720 px (`tablet`), uma coluna com a foto
  no topo, centralizada. A partir de 720 px, foto à esquerda e dados à direita dentro de um `Card`
  (US5).

## `AppHeader` (alterado) — `features/planning/components/app-header.tsx`

- Vira `async`; `current?: AppSection` passa a ser opcional.
- O `SignOutButton` é substituído por `<AccountMenu profile={...} />`, no canto direito, depois
  da navegação.
- Em 360 px, logo, navegação e avatar continuam numa linha sem rolagem horizontal; a quebra
  existente (`flex-wrap`) continua valendo.

## `UserAvatar` — `features/profile/components/user-avatar.tsx` (Client)

| Prop | Tipo | Uso |
|---|---|---|
| `avatarUrl` | `string \| null` | Foto; `null` → iniciais |
| `initials` | `string` | Fallback (FR-002) |
| `size` | `"sm" \| "lg"` | `sm` = 36 px no cabeçalho; `lg` = 96 px no perfil (escala do Tailwind) |
| `alt` | `string` | Texto alternativo da foto |

- Borda `ring-2 ring-avatar-ring` (ou `border-2 border-avatar-ring`), igual para todos (FR-001).
- Imagem `object-cover`, recortada em círculo, sem distorção.
- Imagem que não carrega → iniciais (`AvatarFallback` do Radix).

## `AccountMenu` — `features/profile/components/account-menu.tsx` (Client)

- Gatilho: botão de 44 × 44 px com `UserAvatar size="sm"` e
  `aria-label="Menu da conta de {displayName}"` (FR-008).
- Conteúdo (`DropdownMenuContent align="end"`, sempre dentro da tela):
  1. `DropdownMenuLabel`: `displayName` e email, truncados com reticências.
  2. Separador.
  3. Item **"Perfil"** (ícone `User`): `Link` para `/profile` (FR-004).
  4. Item **"Sair"** (ícone `LogOut`): `<form action={signOut}>` com botão de envio (FR-005).
- Fecha ao escolher, ao clicar fora ou com Esc; o foco volta ao gatilho (FR-007, Radix).

## `ProfileEditor` — `features/profile/components/profile-editor.tsx` (Client)

### Modo leitura (padrão)

- `UserAvatar size="lg"`, `displayName` (ou "Nome não informado" em `text-muted-foreground`) e
  email.
- Rótulos visíveis: "Nome", "Sobrenome", "Email". Um valor vazio aparece como "Não informado"
  (FR-011).
- Botão **"Editar perfil"** (ícone `Pencil`).
- Sem nome: convite "Complete seu perfil adicionando seu nome." (US2-2).

### Modo edição

- React Hook Form com `zodResolver(profileSchema)` e valores iniciais do perfil.
- Foto: `UserAvatar size="lg"` com a prévia (`URL.createObjectURL`, revogada ao trocar ou
  desmontar). Botões **"Escolher foto"** (aciona um `<input type="file"
  accept="image/jpeg,image/png,image/webp">` oculto) e **"Remover foto"** (aparece só quando há
  foto atual ou prévia). Arquivo inválido no cliente (tipo ou tamanho) → erro em `photo`, sem
  prévia (FR-019).
- Campos **"Nome"** (obrigatório) e **"Sobrenome"** (opcional), com `maxLength=50`, erros via
  `FormFieldError`.
- **Email**: exibido como texto com a nota "O email não pode ser alterado." Não é campo do
  formulário (FR-016).
- Botões **"Salvar"** (desabilitado e com "Salvando…" durante o envio) e **"Cancelar"**.
- Envio: monta o `FormData` e chama `runAction(() => updateProfile(fd), …)`. Os erros do servidor
  vão para os campos via `applyFieldErrors`; uma mensagem geral (conexão ou genérica) aparece em
  `Alert` e os valores digitados continuam no formulário (FR-022).
- Sucesso: volta ao modo leitura e mostra "Perfil atualizado." numa região `role="status"`
  (FR-021).
- "Cancelar": `reset()`, descarta a prévia e volta ao modo leitura (FR-014).
- `useUnsavedChangesGuard(isDirty || hasPhotoChange)` (R9, FR-023): diálogo **"Descartar
  alterações?"** com os botões "Continuar editando" e "Descartar".

### Responsividade e acessibilidade

- Todos os botões têm no mínimo 44 px de altura (`min-h-11`); em 360 px os botões ocupam a largura
  toda, empilhados.
- Ao entrar no modo de edição, o foco vai para o campo "Nome"; ao salvar ou cancelar, volta para
  "Editar perfil".
- Textos longos (nome, email) com `truncate` e `min-w-0` (Edge Cases).
