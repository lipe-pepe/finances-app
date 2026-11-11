# Feature Specification: Divisão do Momento Presente em partes

**Feature Branch**: `006-present-moment-parts`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Divisão do momento presente. Problema: o Momento Presente deve
poder ser dividido em partes menores para ajudar o usuário a se organizar. Objetivo: permitir que
o usuário defina uma porcentagem do Momento Presente para cada parte: Gastos Essenciais, Educação
e Livre (se dê um presente). Na aba Momento Presente do Planejamento, dividir a porcentagem do
Momento Presente nas 3 partes arrastando um slider; as 3 partes somam a porcentagem do Momento
Presente em relação à Receita (ex.: Momento Presente 70% = Essenciais 60% + Educação 5% + Livre
5%); cada parte vai de 0 até o total, desde que somem o total; o valor de cada parte aparece
enquanto as porcentagens mudam. Nos formulários de gasto do Planejamento e do Controle, escolher
a parte do gasto. No Controle, o gráfico mostra as 3 partes num mesmo gráfico (gasto acumulado por
dia de cada parte, com o limite). Na lista de gastos do mês, cada gasto mostra a sua parte."

**Depends on**: `specs/001-financial-planning` (divisão Presente/Futuro, gastos planejados e
alertas), `specs/002-planning-tabs` (abas e nomes), `specs/003-spending-control` (Controle,
dashboard e gráfico) e `specs/004-visual-redesign` (visual, cores e responsividade).

## Clarifications

### Session 2026-11-11

- Q: O limite de cada parte no gráfico do Controle é o valor da parte (Receita × porcentagem) ou a
  soma dos gastos planejados da parte? → A: O valor da parte; com categoria selecionada, as curvas
  mostram o gasto da categoria contra o valor inteiro da parte.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dividir o Momento Presente em três partes (Priority: P1)

Na aba "Momento Presente" do Planejamento, o usuário vê a porcentagem da Receita destinada ao
Momento Presente (definida na aba Receita) e um slider que a divide em três partes: **Gastos
Essenciais**, **Educação** e **Livre**. Ao arrastar o slider, a porcentagem e o valor em reais de
cada parte mudam na hora, e as três sempre somam a porcentagem do Momento Presente. Ao soltar, a
divisão é salva.

**Why this priority**: é o núcleo da feature; sem a divisão, as partes não têm porcentagem nem
valor para orientar o planejamento e o Controle.

**Independent Test**: com Receita de R$ 10.000,00 e Momento Presente em 70%, abrir a aba Momento
Presente, arrastar o slider até Gastos Essenciais 60%, Educação 5% e Livre 5%, conferir os valores
R$ 6.000,00, R$ 500,00 e R$ 500,00, recarregar a página e conferir que a divisão foi mantida.

**Acceptance Scenarios**:

1. **Given** Receita de R$ 10.000,00 e Momento Presente em 70%, **When** o usuário abre a aba
   Momento Presente, **Then** vê o total "70% da Receita" e as três partes com porcentagem e valor,
   somando 70%.
2. **Given** a aba aberta, **When** o usuário arrasta o slider até Essenciais 60%, Educação 5% e
   Livre 5%, **Then** os valores mostrados mudam enquanto arrasta, terminando em R$ 6.000,00,
   R$ 500,00 e R$ 500,00.
3. **Given** a divisão ajustada, **When** o usuário solta o slider, **Then** a divisão é salva sem
   botão de salvar e aparece igual numa próxima visita.
4. **Given** o slider, **When** o usuário tenta passar uma parte do total disponível, **Then** o
   slider não deixa: cada parte fica entre 0% e a porcentagem do Momento Presente, e a soma nunca
   muda.
5. **Given** o slider em foco, **When** o usuário usa as setas do teclado, **Then** consegue ajustar
   cada divisão de 1 em 1 ponto percentual, com o mesmo efeito de arrastar.
6. **Given** um usuário que nunca dividiu o Momento Presente, **When** ele abre a aba, **Then** todo
   o Momento Presente aparece em Gastos Essenciais, e Educação e Livre em 0%.
7. **Given** uma falha ao salvar, **When** o usuário solta o slider, **Then** vê um aviso de que a
   divisão não foi salva, e a divisão exibida continua indicando que não está salva.

---

### User Story 2 - Classificar gastos planejados por parte (Priority: P1)

Ao adicionar ou editar um gasto no Momento Presente do Planejamento, o usuário escolhe a parte do
gasto (Gastos Essenciais, Educação ou Livre). A lista mostra a parte de cada gasto, e cada parte
mostra quanto já foi planejado em relação ao seu valor, com alerta quando passa do valor da parte.

**Why this priority**: sem a parte nos gastos planejados, a divisão não se conecta com o
planejamento real nem com o Controle.

**Independent Test**: criar um gasto "Curso de inglês" de R$ 400,00 em Educação, conferir que ele
aparece com a parte "Educação" e que o total planejado de Educação passa a R$ 400,00 de R$ 500,00;
criar outro de R$ 200,00 em Educação e conferir o alerta de Educação.

**Acceptance Scenarios**:

1. **Given** o formulário de gasto do Momento Presente, **When** o usuário o abre, **Then** há um
   campo obrigatório "Parte" com as opções Gastos Essenciais, Educação e Livre, já com Gastos
   Essenciais selecionado.
2. **Given** um gasto salvo com a parte Educação, **When** a lista é exibida, **Then** o gasto
   mostra a parte "Educação" ao lado da categoria.
3. **Given** um gasto existente, **When** o usuário edita a parte e salva, **Then** o gasto passa a
   contar na nova parte.
4. **Given** Educação com valor de R$ 500,00 e gastos planejados de R$ 600,00 em Educação, **When**
   a aba é exibida, **Then** aparece um alerta informando que Educação excede o valor da parte em
   R$ 100,00, sem esconder os demais alertas.
5. **Given** os gastos planejados que já existiam antes desta feature, **When** a lista é exibida
   pela primeira vez, **Then** todos aparecem na parte Gastos Essenciais.

---

### User Story 3 - Classificar gastos realizados por parte no Controle (Priority: P2)

Ao registrar ou editar um gasto no Controle, o usuário escolhe a parte do gasto. Na lista "gastos
do mês", cada gasto mostra a sua parte.

**Why this priority**: permite acompanhar o realizado por parte; depende das partes existirem
(US1) e dá base para o gráfico (US4).

**Independent Test**: registrar "Livro" de R$ 80,00 em Educação, conferir que a lista mostra
"Educação" no gasto; editar para Livre e conferir a troca.

**Acceptance Scenarios**:

1. **Given** o formulário de registrar gasto (no card lateral ou no painel do celular), **When** o
   usuário o abre, **Then** há um campo obrigatório "Parte", já com Gastos Essenciais selecionado.
2. **Given** um gasto registrado em Educação, **When** a lista de gastos do mês é exibida, **Then**
   o gasto mostra a parte "Educação" junto com categoria, data e valor.
3. **Given** um gasto registrado, **When** o usuário edita a parte, **Then** a lista e o dashboard
   passam a contá-lo na nova parte.
4. **Given** os gastos realizados que já existiam antes desta feature, **When** a lista é exibida,
   **Then** todos aparecem na parte Gastos Essenciais.

---

### User Story 4 - Gráfico do Controle com as três partes (Priority: P2)

No dashboard do Controle, o gráfico mostra, num mesmo quadro, o gasto acumulado por dia do mês de
cada parte (três linhas, uma por parte), cada uma com a sua linha de limite. O usuário vê de
relance qual parte está perto ou acima do limite.

**Why this priority**: é a visão de acompanhamento pedida; depende das partes nos gastos
realizados (US3).

**Independent Test**: com limites de Essenciais R$ 6.000,00, Educação R$ 500,00 e Livre
R$ 500,00, registrar gastos nas três partes em dias diferentes e conferir as três curvas
acumuladas e os três limites no gráfico, além da alternativa em texto.

**Acceptance Scenarios**:

1. **Given** gastos do mês nas três partes, **When** o dashboard é exibido, **Then** o gráfico
   mostra três curvas de gasto acumulado por dia, até hoje, e três linhas de limite, uma por parte.
2. **Given** o gráfico, **When** é exibido, **Then** cada parte tem cor própria e é identificada
   também por legenda com nome (não só pela cor), e a linha de limite de cada parte é distinguível
   da curva (ex.: tracejada).
3. **Given** uma parte sem gastos no mês, **When** o gráfico é exibido, **Then** a curva dela fica
   em zero e o seu limite continua visível.
4. **Given** uma parte cujo gasto acumulado passou do limite, **When** o gráfico é exibido, **Then**
   a parte é destacada como acima do limite também em texto (ex.: na legenda ou no resumo).
5. **Given** uma categoria selecionada no dashboard, **When** o gráfico é exibido, **Then** as três
   curvas consideram só os gastos daquela categoria, e os limites continuam sendo os valores
   inteiros das partes (ex.: Educação R$ 500,00).
6. **Given** um leitor de tela, **When** o gráfico é lido, **Then** uma alternativa em texto
   informa, para cada parte, o gasto acumulado e o limite do mês.

---

### Edge Cases

- **Receita zero**: as partes mostram porcentagem e valor R$ 0,00; o slider continua utilizável e
  a divisão é salva.
- **Momento Presente em 0%**: as três partes ficam em 0%, o slider fica desabilitado com uma
  explicação ("Defina a porcentagem do Momento Presente na aba Receita").
- **Momento Presente alterado na aba Receita depois da divisão**: as três partes são reajustadas
  mantendo a proporção entre elas e arredondando para inteiros sem mudar a soma: cada parte fica
  com a parte inteira da proporção, e os pontos que sobram vão para as maiores frações; em empate,
  na ordem Gastos Essenciais, Educação, Livre (ex.: 60/5/5 em 70% → Momento Presente 35% → 30/3/2).
  Se todas as partes estavam em 0% (Momento Presente era 0%), o novo total vai inteiro para Gastos
  Essenciais.
- **Arredondamento**: porcentagens são inteiras; os valores em reais são arredondados ao centavo e,
  se a soma arredondada das partes diferir do valor do Momento Presente, a diferença de centavos
  fica na parte Livre.
- **Duas partes no mesmo ponto**: o usuário pode deixar uma parte em 0% juntando as divisões do
  slider; elas continuam separáveis depois.
- **Gasto de categoria sem a parte correspondente**: a parte é independente da categoria;
  qualquer categoria pode ser usada com qualquer parte.
- **Mudança de parte de um gasto que já passou do limite**: alertas e gráfico se atualizam na hora
  para as duas partes envolvidas.
- **Muitos gastos no mesmo dia em partes diferentes**: o gráfico soma por dia dentro de cada parte,
  sem misturar as partes.

## Requirements *(mandatory)*

### Functional Requirements

**Divisão do Momento Presente (Planejamento)**

- **FR-001**: A aba "Momento Presente" MUST exibir a porcentagem da Receita destinada ao Momento
  Presente e a sua divisão em três partes, nesta ordem: **Gastos Essenciais**, **Educação** e
  **Livre**.
- **FR-002**: A divisão MUST ser feita por um único slider com duas divisões arrastáveis, que
  separam o total do Momento Presente em três faixas contíguas, uma por parte.
- **FR-003**: As porcentagens das partes MUST ser inteiras, cada uma de 0% até a porcentagem do
  Momento Presente, e MUST somar exatamente a porcentagem do Momento Presente em relação à Receita.
- **FR-004**: Para cada parte, a tela MUST mostrar a porcentagem (da Receita) e o valor em reais
  (Receita × porcentagem), atualizados em tempo real enquanto o slider é movido.
- **FR-005**: A divisão MUST ser salva automaticamente ao soltar o slider, sem botão de salvar, e
  restaurada nas próximas visitas.
- **FR-006**: Se o salvamento falhar, a plataforma MUST avisar o usuário e manter visível que a
  divisão exibida não foi salva.
- **FR-007**: Para quem nunca dividiu, o Momento Presente inteiro MUST ficar em Gastos Essenciais,
  com Educação e Livre em 0%.
- **FR-008**: Quando a porcentagem do Momento Presente muda (slider da aba Receita), as três partes
  MUST ser reajustadas proporcionalmente, com porcentagens inteiras que somem a nova porcentagem.
- **FR-009**: O slider MUST ser operável por teclado (setas ajustam a divisão em foco em 1 ponto
  percentual) e cada divisão MUST ter nome acessível que informe as partes que separa e os valores
  atuais.
- **FR-010**: Com o Momento Presente em 0%, o slider MUST ficar desabilitado, com uma mensagem
  indicando onde ajustar a porcentagem do Momento Presente.

**Parte dos gastos planejados**

- **FR-011**: O formulário de gasto do Momento Presente (criar e editar) MUST ter o campo
  obrigatório "Parte", com as opções Gastos Essenciais, Educação e Livre, e Gastos Essenciais
  pré-selecionado ao criar.
- **FR-012**: A lista de gastos do Momento Presente MUST mostrar a parte de cada gasto.
- **FR-013**: Cada parte MUST mostrar o total planejado nela (soma dos gastos da parte) em relação
  ao seu valor.
- **FR-014**: Quando o total planejado de uma parte passar do valor da parte, a aba MUST exibir um
  alerta para aquela parte, com o valor excedido; o alerta atual do Momento Presente como um todo
  MUST continuar existindo.

**Parte dos gastos realizados (Controle)**

- **FR-015**: O formulário de registrar e editar gasto do Controle MUST ter o campo obrigatório
  "Parte", com as mesmas três opções e Gastos Essenciais pré-selecionado ao registrar.
- **FR-016**: A lista de gastos do mês do Controle MUST mostrar a parte de cada gasto.

**Gráfico do Controle**

- **FR-017**: O gráfico do Controle MUST mostrar, num mesmo quadro, três curvas de gasto acumulado
  por dia do mês atual (até hoje), uma por parte, considerando a seleção de categoria.
- **FR-018**: Cada parte MUST ter no gráfico a sua linha de limite igual ao **valor da parte**
  (Receita × porcentagem da parte, US1). O limite não muda com a seleção de categoria: com uma
  categoria selecionada, as curvas mostram só o gasto daquela categoria, comparado ao valor
  inteiro de cada parte.
- **FR-019**: Cada parte MUST ter cor própria no gráfico e MUST ser identificada também por legenda
  com o nome da parte; a linha de limite MUST ser visualmente distinguível da curva de gasto.
- **FR-020**: A alternativa acessível do gráfico MUST informar, para cada parte, o gasto acumulado
  do mês e o limite, indicando em texto as partes acima do limite.

**Geral**

- **FR-021**: Gastos planejados e realizados que existiam antes desta feature MUST passar a
  pertencer à parte Gastos Essenciais, sem perda de dados.
- **FR-022**: Partes, divisão e a parte de cada gasto MUST ser visíveis e alteráveis apenas pelo
  próprio usuário; a validação MUST ser repetida ao salvar (parte inválida ou porcentagens que não
  somam o Momento Presente MUST ser recusadas).
- **FR-023**: Todas as telas alteradas MUST seguir o visual da plataforma (feature 004), funcionar
  nos temas claro e escuro com contraste AA e a partir de 360 px de largura, com alvos de toque de
  no mínimo 44 × 44 px (inclusive as divisões do slider).

### Key Entities *(include if feature involves data)*

- **Parte do Momento Presente**: lista fixa de três opções — Gastos Essenciais, Educação e Livre —
  usada para classificar gastos planejados e realizados.
- **Divisão do Momento Presente**: por usuário, a porcentagem (da Receita) de cada parte; as três
  somam a porcentagem do Momento Presente da divisão Presente/Futuro existente. Padrão: tudo em
  Gastos Essenciais.
- **Gasto planejado** (existente): ganha o atributo obrigatório "parte".
- **Gasto realizado** (existente): ganha o atributo obrigatório "parte".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das combinações salvas, a soma das porcentagens das três partes é igual à
  porcentagem do Momento Presente.
- **SC-002**: Ao arrastar o slider, os valores das partes acompanham o movimento sem atraso
  perceptível (atualizados a cada passo de 1%).
- **SC-003**: Um usuário consegue dividir o Momento Presente nas três partes em menos de 30
  segundos.
- **SC-004**: 100% dos gastos planejados e realizados existentes aparecem em Gastos Essenciais após
  a mudança, sem nenhum gasto perdido ou alterado em nome, valor, categoria ou data.
- **SC-005**: Registrar um gasto com a parte escolhida leva no máximo um passo a mais (escolher a
  parte) do que hoje, e nenhum passo a mais quando a parte é Gastos Essenciais.
- **SC-006**: No gráfico, as três partes são distinguíveis sem depender só de cor (legenda com
  nomes) e o gráfico passa em verificação de contraste nos dois temas.
- **SC-007**: A aba Momento Presente, os formulários de gasto e o dashboard do Controle funcionam
  sem rolagem horizontal em 360, 768 e 1280 px.

## Assumptions

- **Base das porcentagens**: as porcentagens das partes são da Receita, como no exemplo do
  pedido (Momento Presente 70% = 60% + 5% + 5%). O trecho "de 0 até o total dos Gastos
  Essenciais, desde que somem o total dos Gastos Essenciais" foi lido como "de 0 até o total do
  Momento Presente, desde que somem o total do Momento Presente", já que Gastos Essenciais passa a
  ser uma das partes.
- **Nome "Gastos Essenciais"**: antes desta feature, "gastos essenciais" era o nome antigo do
  Momento Presente inteiro (features 001/002). A partir desta feature, "Gastos Essenciais" é só a
  primeira parte; o todo continua se chamando "Momento Presente".
- **Slider único**: "arrastar um slider" foi interpretado como um slider com duas divisões
  (três faixas). Se a parte for 0%, as divisões se encontram.
- **Onde fica a divisão Presente/Futuro**: continua no slider da aba Receita; esta feature não muda
  aquele slider, apenas reage às mudanças dele (FR-008).
- **Momento Futuro**: não é dividido nesta feature.
- **Cores das partes**: as três partes ficam dentro do Momento Presente (laranja na constituição).
  As cores de cada parte no gráfico e no slider serão tons/variações compatíveis com o Princípio VI
  (definidas no plano), sempre acompanhadas do nome da parte.
- **Resumo do Controle**: os blocos atuais do dashboard (planejado, gasto, disponível) continuam
  como hoje para a seleção de categoria; esta feature acrescenta as partes ao gráfico e à lista, e
  não altera as regras desses blocos.
- **Partes fixas**: o usuário não cria, renomeia nem apaga partes.
