# Research: Divisão do Momento Presente em partes

**Feature**: `006-present-moment-parts` | **Date**: 2026-11-11

Todas as incógnitas do Technical Context estão resolvidas; não restam itens "NEEDS CLARIFICATION".

## R1. Como guardar a divisão

- **Decision**: duas colunas novas em `allocations`: `education_percentage` e `free_percentage`,
  ambas `SMALLINT NOT NULL DEFAULT 0`. A parte Gastos Essenciais **não** é guardada: ela vale
  `essential_percentage − education_percentage − free_percentage`. A coluna `essential_percentage`
  continua sendo a porcentagem do Momento Presente; o nome é legado e não muda. Um
  `CHECK (education_percentage >= 0 AND free_percentage >= 0 AND education_percentage +
  free_percentage <= essential_percentage)` garante a consistência no banco.
- **Rationale**: a soma das partes é igual ao Momento Presente por construção (SC-001, FR-003).
  Com o padrão 0/0, as linhas existentes ficam com tudo em Gastos Essenciais (FR-007), sem
  migração de dados. Usuários sem linha em `allocations` usam o padrão atual: 50% de Momento
  Presente, tudo em Gastos Essenciais.
- **Alternatives considered**: guardar as três porcentagens (exige um `CHECK` de soma e permite
  estados inconsistentes durante atualizações parciais); tabela própria `present_splits` (mais
  um join e mais uma tabela com RLS, sem ganho); guardar frações relativas ao Momento Presente
  (contradiz o FR-003, que pede porcentagens inteiras da Receita).

## R2. Reajuste quando o Momento Presente muda (FR-008)

- **Decision**: a função pura `rescaleParts(parts, newPresentPercentage)` em
  `src/lib/present-parts.ts` usa o método do maior resto. Cada parte fica com
  `floor(parte × novo / antigo)`, e os pontos que sobram vão, um a um, para as maiores frações.
  Em empate, a ordem é Gastos Essenciais, Educação, Livre. Com o total antigo em 0, o novo total
  vai inteiro para Gastos Essenciais. O cliente usa a função para mostrar o resultado enquanto
  arrasta o slider da aba Receita, e `saveAllocation` **recalcula no servidor**, a partir das
  partes gravadas, e grava as três colunas na mesma operação.
- **Rationale**: a regra fica num lugar só e é testável. O servidor não confia em partes vindas
  do cliente, e o resultado na tela é idêntico ao gravado. Exemplo da spec: 60/5/5 em 70% → 35%
  → 30/3/2.
- **Alternatives considered**: o cliente enviar as partes reajustadas (o servidor teria de
  validar uma regra que ele mesmo sabe calcular); manter Educação e Livre fixos e ajustar só
  Gastos Essenciais (não respeita a proporção pedida no FR-008 e falha quando o novo total fica
  menor que Educação + Livre).

## R3. Salvar a divisão das partes

- **Decision**: nova Server Action `savePresentSplit({ educationPercentage, freePercentage })`.
  Valida inteiros ≥ 0 com Zod e lê a porcentagem do Momento Presente gravada (ou o padrão).
  Quando `education + free > presente`, devolve `VALIDATION`. Faz `upsert` em `allocations`
  (criando a linha com `essential_percentage = 50` quando ela não existe) e devolve as três
  partes. Como `saveAllocation`, não chama `revalidatePath`: o slider é a fonte de verdade no
  cliente, e as respostas antigas são ignoradas pelo id da requisição mais recente.
- **Rationale**: segue o padrão de `saveAllocation` (FR-005, FR-006). Gastos Essenciais nunca é
  enviado, porque é derivado.
- **Alternatives considered**: uma action única para Momento Presente e partes (as duas são
  salvas por sliders diferentes e em momentos diferentes).

## R4. Slider com duas divisões (FR-002, FR-009)

- **Decision**: `PresentSplitSlider` usa o `Slider` existente (Radix) com
  `value=[essentials, essentials + education]`, `min=0`, `max=presente`, `step=1` e
  `minStepsBetweenThumbs=0`. As três faixas coloridas são desenhadas sob o trilho com larguras
  proporcionais. O `Slider` de `ui/slider.tsx` ganha a prop opcional `thumbLabels`, para dar um
  nome acessível próprio a cada thumb: "Divisão entre Gastos Essenciais e Educação" e "Divisão
  entre Educação e Livre", com `aria-valuetext` informando as duas partes (ex.: "Gastos
  Essenciais 60%, Educação 5%"). O salvamento acontece no `onValueCommit`. Com o Momento Presente
  em 0%, o slider fica `disabled` e mostra a mensagem do FR-010.
- **Rationale**: o Radix já trata arraste, teclado (setas de 1 em 1), dois thumbs no mesmo ponto
  e área de toque. O thumb tem `after:-inset-3`, o que dá cerca de 44 px de alvo (FR-023).
- **Alternatives considered**: três sliders independentes (a soma deixaria de ser automática);
  um componente feito do zero (repetiria a acessibilidade do Radix).

## R5. Parte nos gastos

- **Decision**: enum Prisma `PresentPart { essentials education free }` (`@@map("present_part")`)
  e coluna `part present_part NOT NULL DEFAULT 'essentials'` em `expenses` e `actual_expenses`.
  O `DEFAULT` preenche as linhas existentes (FR-021, SC-004). Os schemas `expenseSchema` e
  `createActualExpenseSchema` ganham `part: presentPartSchema`
  (`z.enum(["essentials","education","free"])`, mensagem "Selecione a parte."). As actions
  existentes gravam `part` em create e update.
- **Rationale**: um enum no banco recusa valores fora da lista, como última defesa (FR-022). O
  padrão `essentials` atende ao FR-011 e ao FR-015 (pré-seleção) e ao SC-005 (nenhum passo a mais
  para Gastos Essenciais).
- **Alternatives considered**: `VARCHAR` com `CHECK` (o enum dá tipagem forte no Prisma Client);
  tabela de partes (as partes são fixas, então seria uma tabela sem uso).

## R6. Campo "Parte" nos formulários

- **Decision**: o `PartPicker` é um grupo de rádio segmentado (`role="radiogroup"` nativo com
  `<input type="radio">` estilizado), com as três opções lado a lado, cada uma com `min-h-11` e o
  ponto de cor da parte. É registrado no RHF com `register("part")`. Abaixo de 360 px os rótulos
  quebram linha; a ordem é fixa.
- **Rationale**: três opções fixas cabem em um toque; um `select` exigiria dois. O rádio nativo
  dá teclado e leitor de tela sem código extra e funciona direto com `register`.
- **Alternatives considered**: `Select` do shadcn (um toque a mais); `ToggleGroup` (exigiria
  `Controller` e um componente novo do shadcn).

## R7. Valores em centavos de cada parte

- **Decision**: `getPartCents(revenueCents, parts)` calcula Gastos Essenciais e Educação com
  `calculatePlannedCents` (Receita × %, arredondado ao centavo) e Livre como
  `valor do Momento Presente − essenciais − educação`. Assim a soma em centavos sempre fecha com
  o valor do Momento Presente, e a diferença de arredondamento fica em Livre, como diz a spec
  (Edge Cases).
- **Rationale**: uma regra só, testável, igual no Planejamento (valores das partes) e no Controle
  (limites).
- **Alternatives considered**: arredondar as três partes de forma independente (a soma poderia
  diferir do Momento Presente em 1 centavo); deixar o resto em Gastos Essenciais (contraria a
  spec).

## R8. Limite do Controle (FR-018, FR-028, FR-029)

- **Decision**: `getControlData` passa a devolver `partLimitCents: Record<PresentPart, number>`
  (R7) e `presentLimitCents` (Receita × Momento Presente), calculados no servidor a partir de
  `incomes` e `allocations`. O `plannedCentsByCategory` e o `getPlannedCents` saem do Controle.
  O resumo usa `limitCents = parteAtiva ? partLimitCents[parteAtiva] : presentLimitCents`. O
  rótulo "Planejado" vira "Limite" (`SUMMARY_LABELS.limit`). A categoria selecionada filtra só os
  gastos, nunca o limite (Clarifications).
- **Rationale**: aplica as respostas A e B do clarify sem duplicar regra no cliente.
- **Alternatives considered**: calcular o limite no cliente a partir da receita (exigiria enviar
  ganhos e alocação ao dashboard sem necessidade).

## R9. Parte ativa e filtros (FR-026–FR-028, FR-031)

- **Decision**: o `ControlDashboard` guarda `activePart: PresentPart | null` em `useState`
  (começa `null` e não fica no endereço, FR-031). `filterActualExpenses` ganha o filtro de parte,
  combinado com o de categoria. Com parte ativa, o resumo, o gráfico (uma série e um limite) e a
  lista usam só a parte; sem parte ativa, usam as três somadas e o gráfico mostra três séries.
- **Rationale**: o estado é local e efêmero, como a categoria selecionada, e não exige ida ao
  servidor.

## R10. Barra de uso por parte (FR-024, FR-025, FR-027, FR-030)

- **Decision**: o componente `PartUsageBar` desenha um trilho `bg-muted` com três `<button>`
  lado a lado, na ordem das partes. A largura de cada um vem de
  `getPartBarWidths(spentByPart, presentLimitCents)`: a porcentagem do gasto sobre o limite;
  quando a soma passa de 100%, as larguras são normalizadas para somar 100% mantendo a proporção;
  com limite 0 e algum gasto, a proporção é entre os gastos. Cada trecho tem `aria-pressed`, um
  nome acessível ("Educação, 5% da Receita, gasto R$ 100,00") e um `Tooltip` do shadcn/ui, que
  abre no hover e no foco, com "Educação · 5% da Receita". A parte ativa ganha `ring-2 ring-ring`
  e as outras ficam com `opacity-40`. Abaixo do trilho, uma **legenda** com três botões (ponto de
  cor + nome + %, `min-h-11`) espelha os trechos, com o mesmo `aria-pressed`, e é por ela que se
  ativam as partes sem gasto. Os trechos da barra ficam com `tabIndex={-1}` e só o mouse os usa;
  o teclado navega pela legenda, para não haver dois botões iguais em sequência no Tab.
- **Rationale**: a barra continua fina (`h-3`, como pede o visual) e a legenda garante os alvos
  de 44 px e o acesso por teclado e leitor de tela. O tooltip do shadcn usa o Radix, que já trata
  hover, foco e Esc.
- **Alternatives considered**: deixar a barra com 44 px de altura (fugiria do visual da feature
  004); tooltip nativo `title` (não abre no foco e não segue o tema).

## R11. Gráfico com três partes (FR-017–FR-020)

- **Decision**: `buildPartSeries(items, today)` devolve pontos
  `{ day, essentials, education, free }`, cada um acumulado (ou `null` depois do último dia),
  reaproveitando `buildCumulativeSeries` por parte. O `SpendingChart` recebe
  `parts: PresentPart[]` (as três, ou só a ativa) e `limits: Record<PresentPart, number>`, e
  desenha uma `Line` `stepAfter` por parte (`stroke var(--part-*)`, `strokeWidth 2.5`) e uma
  `ReferenceLine` tracejada por parte na mesma cor. Com uma parte só, mantém a `Area` preenchida
  de hoje, na cor da parte. A legenda abaixo do gráfico lista cada parte com o traço sólido e o
  tracejado e o "Limite R$ X". O resumo textual (`figcaption`) traz uma frase por parte, com
  "acima do limite" quando for o caso (FR-020).
- **Rationale**: três áreas sobrepostas ficariam ilegíveis, e linhas mantêm as três curvas
  visíveis. Cor da linha e do limite iguais por parte, com estilos diferentes (sólido ×
  tracejado), atendem ao FR-019.
- **Alternatives considered**: áreas empilhadas (mostrariam o total, mas o limite é por parte);
  três gráficos separados (o pedido é "num mesmo gráfico").

## R12. Cores das partes (FR-019, Clarifications)

- **Decision**: tokens novos, com valores iniciais verificados por contraste ≥ 3:1 contra
  `--background` e `--card`:

  | Token | Claro | Escuro |
  |---|---|---|
  | `--part-essentials` (escuro) | `#7c2d12` | `#c2560f` |
  | `--part-education` (médio) | `#c2410c` | `#f97316` |
  | `--part-free` (claro) | `#ea580c` | `#fdba74` |

  Expostos como `--color-part-essentials` etc. no `@theme inline`. No tema claro, um laranja
  "claro" de fato não passa de 3:1, por isso o mais claro é o próprio `--present`. Para separar os
  trechos da barra quando as cores ficam próximas, cada trecho tem uma borda de 2 px na cor do
  fundo (`border-background`). Os pares entram em `tests/unit/design/contrast.test.ts`.
- **Rationale**: atende ao Princípio VI (matiz do Momento Presente, sem reatribuir outras cores
  com significado) e ao FR-019. O nome da parte sempre acompanha a cor.

## R13. Planejamento por parte (FR-012–FR-014)

- **Decision**: `getPlanningData` passa a devolver `part` em cada `ExpenseItem`, além de
  `educationPercentage`, `freePercentage` e `expensesTotalCentsByPart`. A seção Momento Presente
  mostra, nesta ordem: o cabeçalho com o total; o `PresentSplitSlider`; a `PartBudgetList` (três
  linhas com nome, %, valor, "Planejado R$ X de R$ Y" e um alerta próprio quando planejado > valor,
  com a mensagem "Educação excede o valor da parte em R$ 100,00"); o alerta atual do Momento
  Presente; o formulário; e a lista (com a parte ao lado da categoria). Valores e alertas usam as
  porcentagens em tempo real do provider.
- **Rationale**: atende à US2 e reaproveita `isOverBudget` e `getExcessCents`.
