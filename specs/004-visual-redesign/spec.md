# Feature Specification: Redesign visual da plataforma

**Feature Branch**: `004-visual-redesign`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Redesign visual da plataforma conforme o design aprovado em
docs/design/redesign (README e telas). Identidade com tons neutros, rosa como cor da marca e do
Controle, fonte DM Sans, temas claro e escuro. Cores por parte do Planejamento: Receita verde,
Momento Presente laranja, Momento Futuro azul. Controle: 'Disponível' em destaque, barra e
percentual de uso, gráfico com área e linha de limite, lista com ícone por categoria, formulário
em coluna à direita no desktop e, no celular, botão fixo '+ Registrar gasto' no rodapé que abre o
formulário num painel. Planejamento: título grande, abas como três cards de resumo clicáveis,
conteúdo em uma coluna com formulário em linha acima da lista. Login no mesmo visual. Todas as
telas responsivas. Sem mudanças em regras de cálculo, dados ou validações."

**Depends on**: `specs/001-financial-planning`, `specs/002-planning-tabs` e
`specs/003-spending-control` (comportamento, regras e textos que esta feature preserva).

**Design reference**: [`docs/design/redesign/README.md`](../../docs/design/redesign/README.md)
(cores, fonte, ícones e layout aprovados) e as telas em `docs/design/redesign/screens/`.
Divergências intencionais em relação a essa referência são registradas nesta spec (Princípio VI
da constituição).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidade visual em todas as telas (Priority: P1)

O usuário encontra a mesma identidade visual em toda a plataforma: fundo em tons neutros, fonte
DM Sans, rosa como cor da marca no logo e na navegação, cards e formulários como superfícies
com borda fina. O tema claro ou escuro acompanha a preferência do dispositivo, e os textos são
legíveis nos dois.

**Why this priority**: é a base de todas as outras histórias; sem ela, as telas novas ficariam
com o visual antigo misturado.

**Independent Test**: abrir Login, Controle e Planejamento com o dispositivo em modo claro e
depois em modo escuro e conferir fonte, cores, cabeçalho e contraste contra a referência.

**Acceptance Scenarios**:

1. **Given** o dispositivo em modo claro, **When** o usuário abre qualquer tela, **Then** a tela
   usa o tema claro da referência (fundo quase branco, texto quase preto, marca rosa).
2. **Given** o dispositivo em modo escuro, **When** o usuário abre qualquer tela, **Then** a tela
   usa o tema escuro da referência, sem trechos ilegíveis ou cores do tema claro.
3. **Given** uma página logada, **When** ela é exibida, **Then** o cabeçalho mostra o logo rosa
   com "Finanças Pessoais", o menu "Planejamento" / "Controle" com a página atual sublinhada em
   rosa (e identificada para tecnologias assistivas) e o botão "Sair".
4. **Given** qualquer tela, em qualquer tema, **When** o contraste é medido, **Then** textos
   atingem ao menos 4,5:1 (3:1 para texto grande) e componentes e gráficos ao menos 3:1.
5. **Given** a tela de login, **When** ela é exibida, **Then** mostra o card central com o logo,
   "Finanças Pessoais", a frase de apoio, Email, Senha e "Entrar"; credenciais inválidas mostram
   "Email ou senha inválidos." em destaque de erro.

---

### User Story 2 - Controle redesenhado (Priority: P1)

Na página Controle, o usuário vê primeiro quanto ainda tem disponível no mês, em número grande,
seguido de uma barra de uso com "Gasto", "Planejado" e "Usado %", do gráfico do gasto acumulado
(com área preenchida e linha de limite) e da lista de gastos com um ícone por categoria. No
computador, o formulário "Registrar gasto" fica numa coluna à direita.

**Why this priority**: o Controle é a página inicial e a mais usada no dia a dia.

**Independent Test**: com gastos planejados e realizados em algumas categorias, abrir o Controle
no computador, alternar entre "Todos" e uma categoria e conferir número em destaque, barra,
percentual, gráfico, ícones e posição do formulário.

**Acceptance Scenarios**:

1. **Given** planejado de R$ 1.500,00 e gastos de R$ 750,00 na seleção, **When** o Controle é
   exibido, **Then** o "Disponível" aparece em destaque como R$ 750,00, a barra fica preenchida
   pela metade e o resumo mostra "Gasto R$ 750,00", "Planejado R$ 1.500,00" e "Usado 50%".
2. **Given** gastos acima do planejado, **When** o Controle é exibido, **Then** o "Disponível"
   negativo aparece em vermelho com ícone de alerta e "Acima do limite em R$ X", a barra fica
   cheia em vermelho e o percentual passa de 100% (ex.: "Usado 107%").
3. **Given** a lista de gastos do mês, **When** ela é exibida, **Then** cada gasto mostra o ícone
   da sua categoria, nome, data, categoria (somente em "Todos"), valor e as ações Editar e
   Apagar.
4. **Given** o gráfico, **When** ele é exibido, **Then** mostra o gasto acumulado como linha com
   área preenchida em rosa e a linha "Limite" tracejada em cor contrastante, com o valor do
   limite na legenda e o resumo textual para leitores de tela.
5. **Given** uma tela de computador, **When** o Controle é exibido, **Then** o formulário
   "Registrar gasto" fica num card na coluna à direita, com a dica "Somente dias de <mês>"
   abaixo do campo de data.

---

### User Story 3 - Planejamento redesenhado com cor por parte (Priority: P1)

Na página Planejamento, o usuário vê o título "Planejamento" em destaque e três cards de resumo
clicáveis — Receita (verde), Momento Presente (laranja) e Momento Futuro (azul) — que funcionam
como as abas. Cada card mostra o valor principal e, nos momentos, a barra de uso e o alerta
quando excede. A aba aberta usa a sua cor nos botões e no slider; o conteúdo fica em uma coluna,
com o formulário em linha acima da lista.

**Why this priority**: a cor por parte e os cards de resumo tornam o Planejamento fácil de
diferenciar do Controle e mostram o estado das três partes de uma vez.

**Independent Test**: abrir o Planejamento, conferir os três cards e suas cores, clicar em cada
um e conferir o conteúdo, as cores da aba aberta e o endereço; mover o slider até o Momento
Presente exceder e conferir o alerta no card.

**Acceptance Scenarios**:

1. **Given** a página Planejamento, **When** ela é aberta, **Then** mostra o título
   "Planejamento", uma frase de apoio e três cards na ordem Receita, Momento Presente e Momento
   Futuro, com a Receita selecionada.
2. **Given** receita de R$ 6.250,50 com 2 ganhos, **When** o card Receita é exibido, **Then**
   mostra o ícone verde, "R$ 6.250,50" e "2 ganhos cadastrados".
3. **Given** divisão de 50% e gastos planejados de R$ 2.750,00, **When** o card Momento Presente
   é exibido, **Then** mostra o ícone laranja, o planejado "R$ 3.125,25", a barra de uso e
   "50% da receita · gastos R$ 2.750,00 (88%)".
4. **Given** o Momento Presente acima do planejado, **When** os cards são exibidos, **Then** o
   card mostra o ícone de alerta, a barra em vermelho e a linha de resumo em vermelho, e
   tecnologias assistivas anunciam o card como "Momento Presente, com alerta".
5. **Given** um card selecionado, **When** a página é exibida, **Then** ele tem a borda e o ícone
   preenchidos na cor da sua parte e é identificado como aba selecionada; os demais têm borda
   neutra.
6. **Given** a aba Receita, **When** o conteúdo é exibido, **Then** mostra primeiro "Divisão da
   receita" (rótulos com marcador laranja e azul, barra laranja/azul na proporção do slider e o
   slider) e depois "Ganhos" com o formulário em linha, a lista e a "Receita total".
7. **Given** a aba Momento Presente ou Momento Futuro, **When** o conteúdo é exibido, **Then**
   mostra o título e o planejado do momento, o alerta "Planejamento incorreto" quando excede, o
   formulário em linha, a lista com ícone por categoria e o total no fim.
8. **Given** a aba Momento Futuro aberta, **When** o usuário olha os botões e o slider, **Then**
   eles usam o azul; na Receita, o verde; no Momento Presente, o laranja.
9. **Given** qualquer aba, **When** o usuário usa Tab e as setas do teclado, **Then** consegue
   focar os cards e trocar de aba, e o endereço da página segue as regras da feature 002.

---

### User Story 4 - Telas no celular, com registro rápido de gasto (Priority: P2)

No celular, todas as telas se reorganizam em uma coluna sem rolagem horizontal. No Controle, um
botão fixo "+ Registrar gasto" no rodapé fica sempre ao alcance e abre o formulário num painel
que sobe de baixo.

**Why this priority**: o uso no celular é frequente, mas depende das Histórias 1–3 já
estilizadas.

**Independent Test**: com a tela do navegador em 360 px, percorrer Login, Controle e as três
abas do Planejamento sem rolagem horizontal; no Controle, rolar até o fim, tocar em
"+ Registrar gasto", registrar um gasto e conferir que ele aparece na lista.

**Acceptance Scenarios**:

1. **Given** uma tela de 360 px de largura, **When** qualquer página é exibida, **Then** nada
   exige rolagem horizontal, o cabeçalho quebra em linhas e o número em destaque cabe na tela.
2. **Given** o Controle numa tela abaixo de 720 px, **When** ele é exibido, **Then** o card de
   registro não aparece na página e o botão "+ Registrar gasto" fica fixo no rodapé, visível em
   qualquer posição da rolagem, sem cobrir o último item da lista.
3. **Given** o botão "+ Registrar gasto", **When** o usuário toca nele, **Then** um painel sobe
   de baixo com o título "Registrar gasto", os campos do formulário (data padrão hoje) e o botão
   "Adicionar gasto", e o foco vai para o painel.
4. **Given** o painel aberto, **When** o usuário toca no X, toca fora do painel ou pressiona
   Esc, **Then** o painel fecha e o foco volta ao botão "+ Registrar gasto".
5. **Given** o painel aberto com dados válidos, **When** o usuário toca em "Adicionar gasto",
   **Then** o gasto é registrado, o painel fecha e o dashboard mostra o novo gasto; com erro de
   validação, o painel continua aberto mostrando os erros por campo.
6. **Given** o Planejamento no celular, **When** ele é exibido, **Then** os três cards ficam
   empilhados, com os alertas visíveis, e os formulários se ajustam em uma ou duas colunas.
7. **Given** qualquer tela no celular, **When** o usuário toca em botões, campos e cards,
   **Then** todos têm área de toque de pelo menos 44 × 44 px.

---

### Edge Cases

- **Planejado zero**: com planejado R$ 0,00 e nenhum gasto, a barra fica vazia e "Usado" mostra
  0%; com planejado zero e algum gasto, a barra fica cheia em vermelho e "Usado" mostra "—"
  (percentual indefinido), junto do aviso de acima do limite.
- **Uso acima de 100%**: o percentual mostra o valor real arredondado (ex.: 107%) e a barra para
  em 100%.
- **Receita zero**: o card Receita mostra R$ 0,00 e "Nenhum ganho cadastrado"; os cards dos
  momentos mostram planejado R$ 0,00.
- **Contagem de ganhos**: "1 ganho cadastrado" no singular, "N ganhos cadastrados" no plural.
- **Categoria sem ícone definido** (ex.: categoria nova cadastrada pelo administrador): usa um
  ícone neutro em cinza; metas sem categoria usam o ícone de alvo em cinza.
- **Valores longos** (ex.: R$ 999.999.999,99): o número em destaque reduz de tamanho e quebra
  sem estourar a tela; os valores nos cards e listas não se sobrepõem a outros elementos.
- **Troca de tema com a página aberta**: a página passa ao novo tema sem recarregar.
- **Listas vazias**: mantêm os textos atuais ("Nenhum gasto registrado", "Nenhum gasto
  cadastrado", "Nenhuma meta cadastrada", "Nenhum ganho cadastrado") no novo visual.
- **Painel de registro e mudança de largura**: se a tela passar de 720 px com o painel aberto,
  o painel fecha e o formulário volta para a coluna à direita, sem perder o que já foi salvo.
- **Sessão expirada durante o registro pelo painel**: segue o comportamento atual (vai para o
  login).

## Requirements *(mandatory)*

### Functional Requirements

**Identidade e temas**

- **FR-001**: Todas as telas MUST usar a identidade da referência: fundo em tons neutros, fonte
  DM Sans, cards e formulários como superfícies com borda fina, sem fundos coloridos nas páginas.
- **FR-002**: Todas as telas MUST ter tema claro e escuro, aplicados conforme a preferência de
  aparência do dispositivo, com os valores de cor da referência.
- **FR-003**: Todas as telas MUST atender ao contraste WCAG 2.1 AA nos dois temas (texto 4,5:1;
  texto grande 3:1; componentes e gráficos 3:1), e nenhuma informação MUST depender só de cor.
- **FR-004**: As cores com significado MUST seguir a constituição: rosa para a marca e o
  Controle, verde para Receita, laranja para Momento Presente, azul para Momento Futuro e
  vermelho para alertas e erros.
- **FR-005**: O cabeçalho das páginas logadas MUST mostrar o logo rosa, o nome da plataforma, o
  menu Planejamento/Controle com a página atual sublinhada em rosa e identificada para
  tecnologias assistivas, e o botão "Sair".
- **FR-006**: A tela de login MUST seguir a referência (card central com logo, título, frase de
  apoio, Email, Senha, "Entrar" e mensagem de erro em destaque).

**Controle**

- **FR-007**: O Controle MUST mostrar o "Disponível" da seleção como número em destaque no topo,
  com tamanho que se ajusta à largura da tela.
- **FR-008**: O Controle MUST mostrar uma barra de uso e os valores "Gasto", "Planejado" e
  "Usado", em que Usado = gasto ÷ planejado em percentual inteiro arredondado; a barra para em
  100% e, acima do limite, fica em vermelho.
- **FR-009**: O disponível negativo MUST aparecer em vermelho, com ícone de alerta e o texto
  "Acima do limite em R$ X".
- **FR-010**: O gráfico MUST mostrar o gasto acumulado como linha com área preenchida na cor da
  marca e a linha "Limite" tracejada em cor contrastante, mantendo a legenda com o valor do
  limite e o resumo textual da feature 003.
- **FR-011**: Cada item das listas de gastos (Controle e Momento Presente) e de metas MUST
  mostrar o ícone da sua categoria, conforme o mapa de ícones da referência.
- **FR-012**: Em telas de 720 px ou mais, o formulário "Registrar gasto" MUST ficar num card na
  coluna à direita do dashboard, com a dica "Somente dias de <mês>" no campo de data.
- **FR-013**: Em telas abaixo de 720 px, o Controle MUST trocar o card de registro por um botão
  "+ Registrar gasto" fixo no rodapé, que abre o formulário num painel que sobe de baixo.
- **FR-014**: O painel de registro MUST se comportar como diálogo: recebe o foco ao abrir,
  fecha pelo X, tocando fora ou com Esc, devolve o foco ao botão ao fechar, fecha após um
  registro bem-sucedido e permanece aberto com erros de validação.
- **FR-015**: O conteúdo do Controle MUST deixar espaço no fim para que o botão fixo não cubra o
  último item da lista.

**Planejamento**

- **FR-016**: O Planejamento MUST mostrar o título "Planejamento" em destaque e uma frase de
  apoio acima dos cards.
- **FR-017**: As abas MUST ser três cards de resumo, na ordem Receita, Momento Presente e
  Momento Futuro, cada um com ícone na cor da sua parte e:
  - Receita: receita total e a quantidade de ganhos cadastrados;
  - Momento Presente e Momento Futuro: valor planejado, percentual da receita, total dos itens,
    percentual usado e barra de uso.
- **FR-018**: Os cards MUST manter o comportamento de abas das features 002 e 003 (endereço da
  aba, troca por teclado, papel de aba para tecnologias assistivas, permanência na aba após
  mutações) e o indicador de alerta (ícone, barra e resumo em vermelho, e o texto alternativo
  ", com alerta") quando o momento excede o planejado.
- **FR-019**: O card selecionado MUST ter borda e ícone preenchidos na cor da sua parte; os
  demais, borda neutra.
- **FR-020**: Os botões e o slider da aba aberta MUST usar a cor da sua parte; botões laranja
  MUST usar texto escuro para manter o contraste.
- **FR-021**: O conteúdo das abas MUST ficar em uma coluna, com o formulário em linha acima da
  lista e o total no fim; na aba Receita, "Divisão da receita" vem antes de "Ganhos".
- **FR-022**: A "Divisão da receita" MUST mostrar os rótulos de cada momento com um marcador na
  cor do momento e uma barra laranja/azul na proporção atual do slider, atualizada em tempo real.

**Responsividade**

- **FR-023**: Todas as telas MUST funcionar a partir de 360 px de largura sem rolagem horizontal
  da página, com alvos de toque de no mínimo 44 × 44 px.
- **FR-024**: No celular, o cabeçalho MUST quebrar em linhas, os cards de resumo MUST ficar
  empilhados e os formulários MUST se ajustar à largura.

**Comportamento preservado**

- **FR-025**: Regras de cálculo, dados, validações, textos de mensagens, rotas, autenticação e
  privacidade das features 001, 002 e 003 MUST permanecer inalterados; esta feature muda apenas
  apresentação e as informações derivadas listadas em FR-008 e FR-017.

### Key Entities

Nenhuma entidade nova ou alterada. Valores derivados exibidos (sem persistência):

- **Usado (%)**: gasto ÷ planejado da seleção (Controle) ou total dos itens ÷ planejado do
  momento (Planejamento), arredondado para inteiro; indefinido quando o planejado é zero.
- **Quantidade de ganhos**: número de ganhos cadastrados pelo usuário.
- **Ícone de categoria**: associação fixa entre cada categoria e um ícone com cor, definida na
  referência de design.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas (Login, Controle e as três abas do Planejamento) atingem contraste
  AA nos temas claro e escuro.
- **SC-002**: Em 360 px de largura, 0 telas exigem rolagem horizontal da página.
- **SC-003**: Em 100% das verificações, a cor da aba aberta no Planejamento corresponde à parte
  (verde, laranja ou azul) e o Controle usa o rosa.
- **SC-004**: No celular, o usuário abre o formulário de registro com 1 toque a partir de
  qualquer posição da página Controle e registra um gasto do dia em menos de 30 segundos.
- **SC-005**: O usuário identifica em que página está (Planejamento ou Controle) e qual parte do
  planejamento está aberta em até 2 segundos ao abrir a tela.
- **SC-006**: Todos os cenários de aceitação das features 001, 002 e 003 continuam passando,
  exceto os que descrevem posição ou aparência substituídas por esta feature.
- **SC-007**: Nenhuma cor, fonte ou espaçamento fica escrito à mão nos componentes de tela
  (verificável por inspeção), conforme o Princípio VI da constituição.

## Assumptions

- O tema segue a preferência de aparência do dispositivo; não há botão para trocar de tema nesta
  versão (o usuário escolheu "claro e escuro, seguindo o sistema" durante o design).
- As três categorias sem ícone na referência ganham ícones na mesma linha visual: Contas e
  Serviços (raio/conta), Investimentos (gráfico em alta) e Outros (círculo com reticências);
  qualquer categoria futura sem ícone usa o ícone neutro.
- Os ícones de categoria podem repetir os matizes das partes do planejamento (ex.: Transporte em
  azul no Momento Presente); o usuário aceitou essa sobreposição.
- O Controle mantém o rosa em toda a página; usar o laranja do Momento Presente no Controle fica
  para uma decisão futura.
- O limite de 720 px para o botão fixo vem da referência; acima dele, o formulário fica na
  coluna à direita.
- Os dados de exemplo das telas de referência são fictícios; os valores reais vêm dos dados do
  usuário.
- Os demais textos de interface (rótulos, botões, mensagens de erro e estados vazios) permanecem
  os das features 001–003, salvo os textos novos citados nesta spec ("Usado", "N ganhos
  cadastrados", "Somente dias de <mês>", "+ Registrar gasto" e a frase de apoio do
  Planejamento).
