# Research: Perfil do usuário

**Feature**: `005-user-profile` | **Date**: 2026-11-11

Todas as incógnitas do Technical Context foram resolvidas abaixo; não restam itens
"NEEDS CLARIFICATION".

## R1. Onde guardar nome, sobrenome e foto

- **Decision**: nova tabela `profiles` no Prisma, chave `user_id` (1:1 com `auth.users`, FK com
  `ON DELETE CASCADE`), colunas `first_name`, `last_name` e `avatar_path`, todas opcionais. A
  linha é criada no primeiro salvamento (`upsert`); a ausência da linha equivale a um perfil vazio.
- **Rationale**: o Princípio V exige o Prisma como acesso a dados, com RLS e filtro por usuário. A
  criação sob demanda dispensa trigger em `auth.users` (que o Princípio V proíbe alterar) e cobre
  as contas existentes, que ainda não têm perfil.
- **Alternatives considered**: `user_metadata` do Supabase Auth (fora do Prisma, sem tipagem nem
  migration, e o usuário consegue alterar sozinho pela API do Auth); trigger que cria o perfil ao
  cadastrar (exige tocar o schema `auth`, e o cadastro está desativado de qualquer forma).

## R2. Onde guardar a foto

- **Decision**: Supabase Storage, bucket **privado** `avatars`, com o objeto em
  `{userId}/{uuid}.{ext}`. O bucket (`file_size_limit` = 2 MiB, `allowed_mime_types` = JPEG, PNG
  e WebP) e as políticas de `storage.objects` (SELECT/INSERT/UPDATE/DELETE apenas quando
  `bucket_id = 'avatars'` e `(storage.foldername(name))[1] = auth.uid()::text`) são criados em SQL
  manual dentro da migração do Prisma, com `ON CONFLICT DO NOTHING` e `DROP POLICY IF EXISTS`.
  Cada upload gera um nome novo; o arquivo anterior é apagado depois que o banco é atualizado.
- **Rationale**: o Supabase é a única camada de back-end (Princípio V), e "SQL que o Prisma não
  expressa" deve ficar nas migrações do Prisma. O schema `storage` não é o `auth`, então a regra
  que proíbe alterá-lo não se aplica. Um nome novo por upload evita foto velha presa em cache, e
  as políticas por pasta garantem que ninguém leia, liste ou altere a foto de outro usuário
  (FR-024, SC-008). Os limites do bucket repetem os da aplicação como defesa em profundidade.
- **Alternatives considered**: bucket público (qualquer pessoa com a URL vê a foto, o que viola o
  FR-024); guardar a imagem no Postgres em `bytea` (incha o banco e cada página carregaria bytes
  da foto); configurar o bucket só no `supabase/config.toml` (vale apenas no ambiente local, e não
  é versionado como migração).

## R3. Como exibir a foto

- **Decision**: no servidor, `createSignedUrl(path, 3600)` a cada renderização que mostra o avatar,
  com o resultado passado ao componente `Avatar` do shadcn/ui (`<img>` comum). Se a URL falhar ao
  ser gerada ou a imagem não carregar, o `AvatarFallback` mostra as iniciais (FR-002).
- **Rationale**: o bucket privado exige URL assinada, e uma hora cobre uma sessão de uso. O
  `Avatar` do Radix já trata o erro de carregamento e mostra o fallback, sem código próprio.
- **Alternatives considered**: `next/image` (a URL assinada muda a cada renderização, o que anula
  o cache do otimizador, e exigiria `remotePatterns` para o domínio do Supabase, sem ganho para
  uma imagem de 36 px); um Route Handler que repassa os bytes da foto (mais uma rota para proteger
  e testar, e o `matcher` do proxy ignora caminhos terminados em `.png` e `.jpg`).

## R4. Como enviar a foto

- **Decision**: uma única Server Action `updateProfile(formData: FormData)` recebe `firstName`,
  `lastName`, `photo` (arquivo, opcional) e `removePhoto` (`"true"` ou ausente). O
  `experimental.serverActions.bodySizeLimit` vai para `"3mb"` (2 MB de foto mais a sobra do
  multipart, segundo `node_modules/next/dist/docs/.../serverActions.md`). No servidor, o tipo é
  verificado pelos primeiros bytes (JPEG `FF D8 FF`; PNG `89 50 4E 47 0D 0A 1A 0A`; WebP
  `RIFF....WEBP`), sem confiar em `file.type` nem na extensão. O upload usa o cliente Supabase da
  sessão (`createSupabaseServerClient`), então as políticas do Storage valem também para a
  aplicação.
- **Rationale**: mantém a gravação no servidor (Princípio III) e um único ponto de validação
  (FR-020). Usar a sessão do usuário dispensa a chave `service_role`, que o Princípio V não deixa
  expor.
- **Alternatives considered**: upload direto do navegador para o Storage (exigiria um cliente
  Supabase no navegador e uma segunda etapa para gravar o caminho no banco, além de validar o
  arquivo só pelo bucket); duas actions separadas, uma para os dados e outra para a foto (o
  "Salvar" do formulário deixaria de ser atômico do ponto de vista do usuário).

## R5. Ordem das operações e falhas parciais

- **Decision**: (1) valida tudo; (2) se houver foto nova, faz o upload; (3) faz o `upsert` do
  perfil em `profiles`; (4) se o banco falhar, apaga o upload novo e devolve `UNKNOWN`; (5) se o
  banco gravar, apaga a foto anterior (se trocou ou foi removida), e uma falha nessa limpeza só é
  registrada no log; (6) `revalidatePath("/", "layout")`.
- **Rationale**: o banco nunca aponta para um arquivo que não existe; o pior caso é um arquivo
  órfão, que não fica visível para ninguém.
- **Alternatives considered**: gravar o banco antes do upload (se o upload falhasse, o perfil
  apontaria para uma foto inexistente).

## R6. Email só para leitura

- **Decision**: o email vem sempre de `supabase.auth.getUser()` e nunca é lido do `FormData`.
  `profileSchema` não tem campo de email, e o Zod descarta chaves desconhecidas. O formulário mostra
  o email como texto, fora dos campos editáveis.
- **Rationale**: atende ao FR-016 e ao FR-017 sem nenhum caminho de código capaz de alterar o
  email.

## R7. Dados do cabeçalho e atualização após salvar

- **Decision**: `getProfile(userId)` em `features/profile/queries.ts`, envolvida em `cache()` do
  React, devolve `{ firstName, lastName, email, avatarUrl, initials, displayName }`. O `AppHeader`
  vira um Server Component assíncrono que chama `requireUserId()` e `getProfile()`. A prop
  `current` fica opcional (em `/profile` nenhuma seção é destacada). Depois de salvar, a action
  chama `revalidatePath("/", "layout")`, e o Next devolve o novo RSC Payload na mesma resposta, de
  modo que o cabeçalho atualiza sem recarregar a página (FR-021, SC-004).
- **Rationale**: as páginas atuais continuam iguais (`<AppHeader current="control" />`), e o
  `cache()` evita consultar o perfil duas vezes quando a página e o cabeçalho pedem os mesmos
  dados.
- **Alternatives considered**: passar o perfil como prop vindo de cada página (repete a consulta
  em todas as páginas); um contexto no cliente (exigiria um Client Component no topo da árvore).

## R8. Menu do avatar e "Sair"

- **Decision**: `dropdown-menu` do shadcn/ui (Radix), que já traz foco, setas, Esc, clique fora e
  devolução do foco ao gatilho (FR-007). O gatilho é um botão de 44 × 44 px com
  `aria-label="Menu da conta de {displayName}"` (FR-008). O item "Perfil" é um `Link` para
  `/profile`. O item "Sair" envolve um `<form action={signOut}>` com um botão de envio, que
  reaproveita a Server Action existente (FR-005). O `SignOutButton` é removido (FR-006).
- **Rationale**: o Radix cobre a acessibilidade exigida sem código próprio, e o `signOut` já tem
  teste de integração.
- **Alternatives considered**: um menu feito à mão (repetiria o tratamento de foco e teclado do
  Radix); o `Popover` (não tem semântica de menu nem navegação por setas).

## R9. Alterações não salvas (FR-023)

- **Decision**: hook `useUnsavedChangesGuard(isDirty)`. Enquanto há alterações, ele (a) registra
  `beforeunload`, para recarregar ou fechar a aba, e (b) intercepta, na fase de captura, cliques
  em links internos (`<a href>` de mesma origem, inclusive os do cabeçalho e do menu do avatar)
  e abre um `AlertDialog` com "Descartar alterações?". Ao confirmar, faz `router.push(href)`. O
  botão "Voltar" do navegador não é interceptado: o App Router não oferece bloqueio de navegação,
  e essa limitação fica registrada.
- **Rationale**: cobre as saídas que acontecem de fato na plataforma (os links do cabeçalho e
  fechar a aba) com o `AlertDialog` já usado no projeto.
- **Alternatives considered**: `window.confirm` (fora do visual da plataforma); interceptar o
  `popstate` (frágil, com o histórico já alterado quando o evento chega).

## R10. Iniciais e nome exibido

- **Decision**: a função pura `getInitials({ firstName, lastName, email })` devolve a primeira letra
  do nome mais a primeira do sobrenome, em maiúsculas e no máximo duas letras. Sem nome, devolve a
  primeira letra do email. Para acentos, usa `toLocaleUpperCase("pt-BR")` e pega o primeiro
  caractere visível com `Array.from`. `displayName` é "Nome Sobrenome" ou, sem nome, o email.
- **Rationale**: atende às Assumptions da spec e ao FR-002, com um teste unitário simples.

## R11. Validação dos nomes

- **Decision**: `profileSchema` em Zod. `firstName` é obrigatório (`trim`, entre 1 e 50
  caracteres, mensagens "Informe o nome." e "Use no máximo 50 caracteres."). `lastName` é opcional
  (`trim`, até 50 caracteres; vazio vira `null`). O mesmo schema roda no RHF e na action.
  `CHECK (char_length(...) <= 50)` no banco como última defesa.
- **Rationale**: atende ao FR-015 e ao FR-020. Apóstrofos, hífens e acentos passam, porque a
  validação é só de tamanho (Edge Cases).

## R12. Estratégia de testes de integração

- **Decision**: `profile.actions.test.ts` **não** mocka `@/lib/auth`. Ele faz login de verdade
  (como `auth.actions.test.ts`), porque o Storage precisa da sessão para as políticas valerem.
  Cenários: salvar nomes; validação; foto válida e o caminho em `{userId}/`; foto acima de 2 MB;
  bytes que não são imagem com extensão `.png`; remover a foto (apaga o objeto); `email` no
  `FormData` ignorado; sem sessão → `UNAUTHENTICATED`; usuário B não consegue baixar nem listar a
  foto de A pelo cliente da sessão dele. `resetDatabase()` passa a limpar `profiles` e esvaziar o
  bucket `avatars` com o cliente admin (apenas nos testes).
- **Rationale**: o Princípio II exige um teste de integração por endpoint, incluindo o caso sem
  sessão. O isolamento entre usuários (SC-008) só pode ser provado contra o Storage real.

## R13. Token visual da borda

- **Decision**: novo token `--avatar-ring` (exposto como `--color-avatar-ring`) em cinza neutro
  nos dois temas, com contraste ≥ 3:1 contra `--background`, verificado por um teste no padrão de
  `tests/unit/design/contrast.test.ts`. O fundo das iniciais usa `bg-muted` com
  `text-muted-foreground`, já aprovados no AA.
- **Rationale**: o Princípio VI proíbe valores visuais escritos à mão, e o FR-026 pede 3:1. O
  `--border` atual é claro demais para 3:1 e serve só para divisórias.
