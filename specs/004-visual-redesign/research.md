# Research: Redesign visual da plataforma

**Feature**: `004-visual-redesign` | **Date**: 2026-11-09

Stack e arquitetura: as das features 001–003. Referência visual:
[`docs/design/redesign/README.md`](../../docs/design/redesign/README.md). Esta pesquisa cobre só
as decisões novas.

## R1. Tokens do tema (Princípio VI)

- **Decision**: todos os valores visuais ficam em `src/app/globals.css`, como CSS variables em
  `:root` (tema claro) e em `@media (prefers-color-scheme: dark) { :root { … } }` (tema
  escuro), expostas ao Tailwind 4 por `@theme inline`. Os tokens usam **hex** (os valores da
  referência), não `oklch`, para que o teste de contraste (R9) leia os mesmos valores do arquivo.
  - Tokens do shadcn/ui mantidos e remapeados para a referência: `background` (fundo),
    `card`/`popover` (superfície), `foreground`, `muted-foreground` (texto secundário),
    `border`/`input`, `muted` (trilho), `primary` = marca rosa, `destructive` = alerta, `ring`.
  - Tokens novos: `brand-soft`, `danger-soft`, `chart-limit`; por parte do planejamento
    `income`, `present`, `future`, cada um com `-foreground` (texto sobre a cor), `-soft` (fundo
    do ícone) e `-ink` (texto/ícone sobre fundo claro); por categoria `category-<key>` e
    `category-<key>-soft`; e o par "seção ativa" `section`/`section-foreground`/`section-soft`
    (R4).
  - Fonte: `--font-sans` = DM Sans (R2). Raio base `--radius: 0.75rem` (cards 12–16 px).
  - Espaçamento: escala padrão do Tailwind (conta como token pela constituição).
- **Rationale**: um único arquivo de tokens cumpre o Princípio VI e permite trocar valores sem
  tocar nos componentes; manter os nomes do shadcn faz os componentes de `src/components/ui`
  herdarem o visual novo sem reescrita.
- **Alternatives considered**: tokens em TypeScript gerando CSS — mais uma etapa de build sem
  ganho; manter `oklch` — o teste de contraste precisaria converter cores.

## R2. Fonte DM Sans

- **Decision**: `DM_Sans` de `next/font/google` em `src/app/layout.tsx`, pesos 400/500/600/700,
  `variable: "--font-sans"`, substituindo Geist; `Geist_Mono` sai (não é usada).
- **Rationale**: `next/font` hospeda a fonte junto da aplicação (sem requisição ao Google no
  navegador) e evita mudança de layout no carregamento.

## R3. Tema claro/escuro seguindo o dispositivo (FR-002)

- **Decision**: trocar `@custom-variant dark (&:is(.dark *))` por
  `@custom-variant dark (@media (prefers-color-scheme: dark))` e definir os tokens escuros na
  mesma media query. Sem botão de troca, sem script e sem cookie.
- **Rationale**: a spec define que o tema segue a preferência do dispositivo; a media query é
  aplicada pelo navegador já na primeira pintura (sem "piscar" claro → escuro) e reage à troca
  com a página aberta (caso de borda).
- **Alternatives considered**: classe `.dark` + `next-themes` — necessária só com botão de troca,
  fora do escopo; hoje a classe `.dark` nunca é aplicada, então o tema escuro não existe.

## R4. Cor da parte ativa do Planejamento (FR-019, FR-020)

- **Decision**: o container das abas recebe `data-section="income|present|future"`; no CSS,
  `[data-section="present"] { --section: var(--present); --section-foreground: …; }` (e o mesmo
  para as outras). Componentes dentro da aba usam utilitários `bg-section`,
  `text-section-foreground`, `accent-section` (slider) e a variante `section` do `Button`.
- **Rationale**: o mesmo botão/slider pega a cor certa pela aba em que está, sem prop de cor em
  cada componente e sem cor escrita à mão.

## R5. Breakpoint de 720 px (FR-012, FR-013, FR-015a)

- **Decision**: breakpoint `--breakpoint-tablet: 45rem` (720 px) em `@theme`, usado como
  `tablet:` nas classes. A troca visual (card à direita × botão fixo) é **só CSS**; o hook
  cliente `useIsNarrow()` (`matchMedia("(max-width: 44.99rem)")`) decide apenas o
  comportamento: abrir a edição no painel e fechar o painel quando a tela passa de 720 px.
- **Rationale**: o HTML do servidor já sai com o layout certo para qualquer largura (sem
  "pular"); o JavaScript só entra onde há interação.

## R6. Painel de registro e edição no celular (FR-013, FR-014, FR-015a)

- **Decision**: componente `sheet` do shadcn/ui (Radix Dialog, `side="bottom"`), adicionado com
  `npx shadcn@4.23.0 add sheet`. Um Client Component `ActualExpenseSheetProvider` envolve o
  dashboard e guarda `{ open, mode: "create" | "edit", actualExpense? }`; o botão fixo chama
  `openCreate()` e, em tela estreita, o "Editar" da lista chama `openEdit(item)`. O conteúdo do
  painel é o `ActualExpenseForm` existente (mesmo schema e actions), com `onSuccess` fechando o
  painel.
- **Rationale**: o Radix Dialog já faz foco inicial, retorno do foco ao gatilho, Esc, clique
  fora e `aria-modal` (FR-014); reaproveitar o formulário mantém React Hook Form e a validação
  no servidor (Princípio IV).
- **Alternatives considered**: painel próprio — reimplementaria foco e acessibilidade;
  `vaul`/drawer — dependência nova sem necessidade.

## R7. Ícones de categoria (FR-011)

- **Decision**: `src/lib/category-style.ts` mapeia o **nome** da categoria (a tabela só tem
  `name`) para `{ key, Icon }` com ícones do `lucide-react` (já instalado): Alimentação →
  `Utensils`, Moradia → `House`, Transporte → `Car`, Saúde → `Heart`, Lazer → `Star`, Reserva de
  Emergência → `ShieldCheck`, Viagem → `Plane`, Educação → `BookOpen`, Contas e Serviços →
  `Zap`, Investimentos → `TrendingUp`, Outros → `CircleEllipsis`; desconhecida → `neutral`
  (`CircleEllipsis` em cinza); meta sem categoria → `Target` em cinza. As cores vêm dos tokens
  `category-<key>`/`category-<key>-soft`. Componente `CategoryIcon` (Server Component).
- **Rationale**: mapa puro e testável; cores em tokens (Princípio VI); sem mudança no banco.
- **Alternatives considered**: coluna `icon` em `categories` — exigiria migração e seed para um
  detalhe de apresentação.

## R8. Gráfico com área (FR-010)

- **Decision**: no `SpendingChart`, `LineChart`/`Line` → `AreaChart`/`Area` (`type="stepAfter"`,
  traço `var(--primary)`, preenchimento `var(--brand-soft)`), `ReferenceLine` com
  `var(--chart-limit)`. O resumo acessível (feature 003) continua igual.

## R9. Verificação automática do Princípio VI (SC-001, SC-007)

- **Decision**: dois testes unitários em `tests/unit/design/`:
  - `contrast.test.ts`: lê `src/app/globals.css`, extrai os tokens hex de `:root` e da media
    query escura e verifica, nos dois temas, os pares de uso (texto/fundo, texto
    secundário/superfície, `primary-foreground`/`primary`, `income|present|future-foreground`
    sobre a cor, `-ink` sobre superfície, `destructive` sobre `danger-soft`) com ≥ 4,5:1, e
    marca/linha de limite/cores das partes sobre o fundo com ≥ 3:1. Função pura
    `contrastRatio(hexA, hexB)` em `src/lib/contrast.ts` (WCAG 2.1).
  - `tokens.test.ts`: varre `src/app/**/*.tsx`, `src/features/**/*.tsx` e
    `src/components/**/*.tsx` e falha se encontrar cor literal (`#rgb`/`#rrggbb`, `rgb(`,
    `hsl(`, `oklch(`), classe arbitrária de cor/tamanho (`-[#`, `text-[NNpx]`) ou cor da paleta
    bruta do Tailwind (`(bg|text|border|fill|stroke|from|to)-(red|pink|…)-NNN`).
- **Rationale**: transforma regras visuais da constituição em gates que rodam no
  `npm run test:unit`; a inspeção visual fica no quickstart.

## R10. Valores derivados novos (FR-008, FR-017)

- **Decision**: `getUsedPercentage(spentCents, plannedCents): number | null` em
  `src/lib/spending.ts` (planejado 0 → `null` se houver gasto, `0` se não; senão
  `Math.round(spent / planned × 100)`), usado no Controle e nos cards do Planejamento;
  `getUsageBarPercentage` limita a 100. `incomeCountLabel(n)` em `src/lib/planning-labels.ts`
  ("Nenhum ganho cadastrado", "1 ganho cadastrado", "N ganhos cadastrados"). A contagem de
  ganhos vem de `getPlanningData` (`incomes.length`, sem consulta nova).

## R11. Abas como cards sem mudar o nome acessível (FR-018)

- **Decision**: os cards continuam sendo `TabsTrigger` do Radix (papel `tab`, setas, endereço).
  Dentro de cada um, o rótulo tem `id` e o gatilho usa `aria-labelledby` = rótulo + texto
  ", com alerta" (quando houver) e `aria-describedby` = valores do card. Assim o nome acessível
  continua "Momento Presente" / "Momento Presente, com alerta", e os testes das features 002 e
  003 que localizam as abas por nome seguem válidos.
