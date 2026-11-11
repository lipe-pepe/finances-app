# Quickstart: Perfil do usuário

**Feature**: `005-user-profile`

Guia para validar a feature de ponta a ponta. Contratos em [contracts/](./contracts/) e modelo em
[data-model.md](./data-model.md).

## Pré-requisitos

- Supabase local rodando (`supabase start`), com `.env.local` e `.env.test` configurados como nas
  features anteriores.
- Dependências instaladas (`npm install`).

## Setup

```bash
npm run db:deploy          # aplica a migração <timestamp>_profiles (tabela + bucket avatars)
npm run db:deploy:test     # idem no banco de testes
npm run dev
```

Para confirmar que o bucket existe: no Supabase Studio local, em Storage, deve aparecer o bucket
`avatars`, **privado**, com limite de 2 MB.

## Testes automatizados

```bash
npm run test:unit          # inclui tests/unit/specs/005-user-profile.spec.test.ts
npm run test:integration   # inclui profile.actions e profile.queries
npm run lint
```

Resultado esperado: todos os testes passam e nenhum aviso de valor visual escrito à mão
(`tests/unit/design`).

## Validação manual

| # | Passo | Resultado esperado | Ref. |
|---|---|---|---|
| 1 | Entrar com uma conta sem perfil e abrir `/control` | Avatar com a inicial do email no canto direito, borda cinza; nenhum botão "Sair" solto | US1, FR-001/002/006 |
| 2 | Clicar no avatar | Menu com nome/email, "Perfil" e "Sair"; Esc fecha e o foco volta ao avatar | FR-003/007 |
| 3 | Tab até o avatar, Enter, setas, Enter em "Perfil" | Abre `/profile` | FR-004/007 |
| 4 | Em `/profile`, sem nome salvo | "Nome não informado" e o convite para completar | US2-2, FR-011 |
| 5 | "Editar perfil" → nome vazio → "Salvar" | Erro "Informe o nome." e nada é salvo | FR-015 |
| 6 | Nome "Ana-Clara", sobrenome "D'Ávila" → "Salvar" | Volta para leitura, "Perfil atualizado.", iniciais "AD" no cabeçalho sem recarregar | FR-021, SC-004 |
| 7 | Editar → escolher um PNG de 1 MB | Prévia no círculo; "Cancelar" mantém a foto anterior | FR-018, US4-3 |
| 8 | Editar → escolher um JPG de 3 MB | Mensagem "Use uma imagem JPG, PNG ou WebP de até 2 MB." | FR-019 |
| 9 | Editar → escolher uma foto válida → "Salvar" | Foto no perfil e no cabeçalho, recortada em círculo | US4-2 |
| 10 | Editar → "Remover foto" → "Salvar" | Iniciais de volta; o objeto some do bucket no Studio | US4-5 |
| 11 | Editar → mudar o nome → clicar em "Planejamento" no cabeçalho | Diálogo "Descartar alterações?" | FR-023 |
| 12 | Avatar → "Sair" | Tela de login; "Voltar" do navegador não mostra dados | FR-005 |
| 13 | Abrir `/profile` sem sessão | Redireciona para `/login` | FR-009 |
| 14 | Repetir 1, 4, 6 e 9 em 360, 768 e 1280 px, nos temas claro e escuro | Sem rolagem horizontal, botões ≥ 44 px, textos legíveis | US5, SC-007 |

## Isolamento entre usuários (SC-008)

Coberto por `tests/integration/profile.actions.test.ts`: com a sessão do usuário B, baixar ou
listar `avatars/{userIdA}/...` falha, e `updateProfile` de B nunca altera a linha de A.
