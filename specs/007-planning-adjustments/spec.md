# Feature Specification: Ajustes do Planejamento e cores das partes

**Feature Branch**: `007-planning-adjustments`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Ajustes gerais. (1) Na aba Receita do Planejamento, não são necessários
dois componentes no slider: hoje há uma barra em duas cores (Momento Presente e Momento Futuro) e um
slider abaixo; o próprio slider deve ser dividido em duas cores, como o slider das partes do
Momento Presente. (2) Na aba Receita, os dois balões com o valor do Momento Presente e do Momento
Futuro abaixo do slider são redundantes; o valor deve ficar abaixo dos rótulos de cada lado do
slider. (3) Os tons de laranja das três partes não ficaram bons: manter o laranja do Momento
Presente para Gastos Essenciais, roxo para Livre e ciano para Educação, em todas as telas. (4) Na
aba Momento Presente, em vez de mostrar as barras e os dados das três partes juntos, um select
escolhe a parte a ver e só os dados dela aparecem (padrão: Gastos Essenciais); o formulário adiciona
o gasto planejado na parte selecionada, e o campo de parte sai do formulário de adição."

**Depends on**: `specs/004-visual-redesign` (visual e cores) e `specs/006-present-moment-parts`
(partes, slider das partes, barra e gráfico por parte), cujo comportamento esta feature ajusta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Slider da Receita em uma peça só (Priority: P1)

Na aba Receita, a divisão entre Momento Presente e Momento Futuro é feita por um único slider cujo
trilho já mostra as duas cores: laranja à esquerda da divisão (Momento Presente) e azul à direita
(Momento Futuro). Acima do slider, cada lado tem o rótulo com a porcentagem e, logo abaixo do
rótulo, o valor em reais. A barra colorida separada e os dois cartões com os valores abaixo do
slider deixam de existir.

**Why this priority**: é a tela mais usada para começar o planejamento; tirar a duplicação deixa a
divisão mais clara e consistente com o slider das partes.

**Independent Test**: com Receita de R$ 6.000,00 e 70%, abrir a aba Receita e conferir um único
slider em duas cores, "Momento Presente 70%" com "R$ 4.200,00" abaixo e "Momento Futuro 30%" com
"R$ 1.800,00" abaixo; arrastar até 60% e ver as cores e os valores mudarem juntos.

**Acceptance Scenarios**:

1. **Given** a aba Receita, **When** ela é exibida, **Then** há um único controle de divisão: o
   trilho do slider em laranja até a divisão e em azul depois dela, sem barra colorida separada.
2. **Given** Receita de R$ 6.000,00 e Momento Presente em 70%, **When** a aba é exibida, **Then** o
   lado esquerdo mostra "Momento Presente 70%" e, abaixo, "R$ 4.200,00"; o lado direito mostra
   "Momento Futuro 30%" e, abaixo, "R$ 1.800,00".
3. **Given** a aba Receita, **When** ela é exibida, **Then** os dois cartões com os valores do
   Momento Presente e do Momento Futuro abaixo do slider não existem mais.
4. **Given** o slider, **When** o usuário arrasta ou usa as setas do teclado, **Then** as cores do
   trilho, as porcentagens e os valores mudam juntos, em tempo real, e a divisão é salva ao soltar,
   como hoje.

---

### User Story 2 - Novas cores das partes (Priority: P1)

As três partes do Momento Presente passam a ter cores bem distintas: Gastos Essenciais no laranja do
Momento Presente, Educação em ciano e Livre em roxo. As novas cores aparecem em todas as telas onde
as partes aparecem.

**Why this priority**: os três tons de laranja ficaram difíceis de distinguir; isso afeta o slider,
as listas, a barra de uso e o gráfico do Controle.

**Independent Test**: abrir a aba Momento Presente e o Controle nos temas claro e escuro e conferir
que, em todos os lugares onde as partes aparecem, Gastos Essenciais está em laranja, Educação em
ciano e Livre em roxo.

**Acceptance Scenarios**:

1. **Given** qualquer tela com partes (slider das partes, seletor de parte, selos nas listas, barra
   de uso, legenda e gráfico do Controle), **When** ela é exibida, **Then** Gastos Essenciais usa o
   laranja do Momento Presente, Educação usa ciano e Livre usa roxo.
2. **Given** os temas claro e escuro, **When** as partes são exibidas, **Then** as três cores são
   distinguíveis entre si e legíveis contra o fundo.
3. **Given** qualquer lugar com a cor de uma parte, **When** ele é exibido, **Then** o nome da parte
   continua visível junto (a cor nunca é a única identificação).

---

### User Story 3 - Ver o Momento Presente uma parte por vez (Priority: P1)

Na aba Momento Presente, abaixo da divisão em partes, o usuário escolhe num seletor a parte que
quer ver (Gastos Essenciais, Educação ou Livre; começa em Gastos Essenciais). Só os dados dessa
parte aparecem: o planejado em relação ao valor da parte, a barra de uso, o alerta da parte e a
lista dos gastos dela. O formulário de adicionar gasto cria o gasto direto na parte selecionada e
não tem mais o campo "Parte".

**Why this priority**: mostrar as três partes juntas deixa a aba longa e confusa; focar numa parte
por vez simplifica o cadastro e a leitura.

**Independent Test**: com gastos nas três partes, abrir a aba (vê só Gastos Essenciais), trocar
para Educação (vê só os dados e os gastos de Educação), adicionar "Curso" e conferir que ele entra
em Educação sem escolher a parte no formulário.

**Acceptance Scenarios**:

1. **Given** a aba Momento Presente, **When** ela é aberta, **Then** o seletor de parte mostra
   "Gastos Essenciais" e só os dados dessa parte aparecem: "Planejado R$ X de R$ Y", a barra de uso
   e a lista dos gastos de Gastos Essenciais.
2. **Given** o seletor, **When** o usuário escolhe "Educação", **Then** o planejado, a barra, o
   alerta (se houver) e a lista passam a ser só de Educação, sem recarregar a página.
3. **Given** Educação selecionada, **When** o usuário adiciona um gasto pelo formulário, **Then** o
   gasto é criado na parte Educação e aparece na lista exibida; o formulário não tem o campo "Parte".
4. **Given** uma parte selecionada sem gastos, **When** a lista é exibida, **Then** aparece uma
   mensagem de vazio que cita a parte (ex.: "Nenhum gasto em Educação.").
5. **Given** a parte selecionada excedida (planejado > valor da parte), **When** a aba é exibida,
   **Then** o alerta dessa parte aparece; alertas de partes não selecionadas não aparecem, mas o
   seletor indica, em texto, quais partes estão excedidas.
6. **Given** um gasto existente na lista, **When** o usuário o edita, **Then** ainda pode trocar a
   parte dele; ao salvar numa parte diferente, o gasto sai da lista da parte selecionada.
7. **Given** o alerta do Momento Presente como um todo (soma de todos os gastos maior que o valor do
   Momento Presente), **When** ele se aplica, **Then** continua aparecendo, independentemente da
   parte selecionada.

---

### Edge Cases

- **Troca de parte com o formulário preenchido**: trocar a parte selecionada não apaga o que já foi
  digitado no formulário; o gasto é criado na parte selecionada no momento de salvar.
- **Parte com 0% da Receita**: pode ser selecionada; o valor da parte aparece como R$ 0,00 e
  qualquer gasto nela gera o alerta da parte.
- **Recarregar a página**: a parte selecionada volta para Gastos Essenciais (a seleção não é
  guardada).
- **Total da aba**: o total exibido no fim da lista é o da parte selecionada, rotulado com o nome
  dela; o total do Momento Presente inteiro continua no cabeçalho da aba e no cartão da aba.
- **Momento Presente em 0% ou 100% na Receita**: o trilho do slider fica todo azul ou todo laranja,
  e os valores mostram R$ 0,00 no lado correspondente.
- **Celular (360 px)**: os rótulos e valores dos dois lados do slider da Receita cabem sem rolagem
  horizontal; o seletor de parte ocupa a largura disponível.

## Requirements *(mandatory)*

### Functional Requirements

**Slider da Receita**

- **FR-001**: A divisão Momento Presente × Momento Futuro na aba Receita MUST ser um único slider
  cujo trilho mostra o Momento Presente em laranja à esquerda da divisão e o Momento Futuro em azul à
  direita; a barra colorida separada MUST ser removida.
- **FR-002**: Acima do slider, MUST haver um rótulo de cada lado — à esquerda "Momento Presente X%",
  à direita "Momento Futuro Y%" — e, abaixo de cada rótulo, o valor em reais correspondente
  (Receita × porcentagem).
- **FR-003**: Os dois cartões com o valor do Momento Presente e do Momento Futuro abaixo do slider
  MUST ser removidos da aba Receita.
- **FR-004**: Cores, porcentagens e valores MUST se atualizar em tempo real ao arrastar ou usar o
  teclado; o salvamento automático ao soltar, o aviso de falha e o "Tentar novamente" MUST continuar
  como estão.

**Cores das partes**

- **FR-005**: As cores das partes MUST ser: Gastos Essenciais = laranja do Momento Presente;
  Educação = ciano; Livre = roxo, nos temas claro e escuro.
- **FR-006**: As novas cores MUST ser usadas em todos os lugares onde as partes aparecem: slider das
  partes, seletor de parte dos formulários, selos das listas (Planejamento e Controle), barra de uso
  e legenda do Controle, e curvas e limites do gráfico do Controle.
- **FR-007**: Cada cor de parte MUST ter contraste mínimo de 3:1 contra o fundo e as superfícies nos
  dois temas, e a parte MUST continuar identificada também pelo nome.

**Momento Presente uma parte por vez**

- **FR-008**: A aba Momento Presente MUST ter um seletor de parte com as opções Gastos Essenciais,
  Educação e Livre, nesta ordem, com Gastos Essenciais selecionado ao abrir a aba.
- **FR-009**: Para a parte selecionada, a aba MUST mostrar somente os dados dela: planejado × valor
  da parte, barra de uso, alerta da parte (quando excedida), lista dos gastos da parte e total da
  parte.
- **FR-010**: Trocar a parte selecionada MUST atualizar os dados exibidos sem recarregar a página.
- **FR-011**: O formulário de adicionar gasto do Momento Presente MUST NOT ter o campo "Parte"; o
  gasto MUST ser criado na parte selecionada no seletor no momento de salvar.
- **FR-012**: O formulário de editar gasto MUST continuar permitindo trocar a parte do gasto.
- **FR-013**: O seletor MUST indicar em texto, ao lado do nome de cada opção, as partes cujo
  planejado passa do valor (ex.: "Educação — excedida").
- **FR-014**: A divisão das partes (slider das três partes) e o alerta do Momento Presente inteiro
  MUST continuar visíveis independentemente da parte selecionada.
- **FR-015**: A lista vazia da parte selecionada MUST mostrar uma mensagem que cita a parte.

**Geral**

- **FR-016**: Regras de cálculo, dados, validações e o Controle (exceto as cores) MUST permanecer
  como na feature 006; o formulário do Controle continua com o campo "Parte".
- **FR-017**: As telas alteradas MUST funcionar nos temas claro e escuro com contraste AA e a partir
  de 360 px, com alvos de toque de no mínimo 44 × 44 px.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A aba Receita tem exatamente um controle de divisão Presente/Futuro (nenhuma barra
  separada e nenhum cartão de valor abaixo dele).
- **SC-002**: Em 100% das telas com partes, as três cores são Gastos Essenciais laranja, Educação
  ciano e Livre roxo, com contraste ≥ 3:1 nos dois temas.
- **SC-003**: Adicionar um gasto planejado numa parte leva um passo a menos do que hoje (não é mais
  preciso escolher a parte no formulário).
- **SC-004**: Ao trocar a parte selecionada, 100% dos dados exibidos (planejado, barra, alerta,
  lista e total) passam a ser da nova parte, sem recarregar a página.
- **SC-005**: As telas alteradas funcionam sem rolagem horizontal em 360, 768 e 1280 px.

## Assumptions

- **Cores e constituição**: ciano e roxo não estão entre as cores com significado fixo do Princípio
  VI (rosa, verde, laranja, azul e vermelho), então usá-los nas partes não exige emenda. O laranja de
  Gastos Essenciais é o próprio laranja do Momento Presente, ao qual a parte pertence. O ciano deve
  ser escolhido de forma a não ser confundido com o azul do Momento Futuro.
- **Valores no slider da Receita**: o texto "Planejado (X% da receita)" e os cartões somem; os
  valores passam a ficar só abaixo dos rótulos do slider. Os outros lugares que mostram o valor do
  Momento Presente (cabeçalho da aba Momento Presente, cartões das abas) continuam como estão.
- **Edição mantém a parte**: o pedido remove a parte só do formulário de **adição**; para não perder
  a possibilidade de mover um gasto de parte, o formulário de edição continua com o campo.
- **Parte selecionada**: fica só na tela (não vai para o endereço nem é guardada); ao recarregar,
  volta para Gastos Essenciais.
- **Controle**: só as cores mudam; a barra, a legenda, o gráfico e o formulário do Controle mantêm o
  comportamento da feature 006.
