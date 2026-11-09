# Feature Specification: Planejamento e Controle de gastos

**Feature Branch**: `003-spending-control`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Vamos ter duas partes principais na plataforma: Planejamento e
Controle. No topo da página, temos que ter 2 botões, que redirecionam para cada parte. Cada parte é
uma página no app. Na página 'Planejamento', devemos ter as tabs de Receita, Momento Presente e
Momento Futuro, como já temos na página raiz. A página raiz deve redirecionar para a página
'Controle'. Na página 'Controle' teremos um form para criar um novo gasto (não é o mesmo gasto do
planejamento), com Nome, Valor, Categoria e Data, com o dia atual como data padrão. Na página
'Controle' teremos um pequeno dashboard: o usuário seleciona em um Select a categoria que quer
observar, com padrão 'Todos' (todas as categorias juntas). Ao selecionar uma categoria, aparecem:
o total em reais planejado para a categoria; a lista dos gastos criados no Controle para a
categoria; o valor disponível (total planejado menos a soma dos gastos); e um gráfico do gasto ao
longo do tempo que também mostra o limite da categoria (valor planejado)."

**Depends on**: `specs/001-financial-planning` (categorias, gastos planejados, login e
privacidade) e `specs/002-planning-tabs` (abas do planejamento, que passam para a página
Planejamento)

## Clarifications

### Session 2026-11-09

- Q: De onde vem o "total planejado" de uma categoria, e o de "Todos"? → A: Da soma dos gastos do
  Momento Presente da categoria; em "Todos", da soma de todos os gastos do Momento Presente. Metas
  do Momento Futuro não entram.
- Q: Que período o dashboard considera? → A: Apenas o mês atual; o planejamento vale como
  orçamento mensal e o disponível recomeça a cada mês.
- Q: Gastos do Controle podem ser editados e apagados? → A: Sim; criar, editar e apagar, como no
  planejamento.
- Q: Como corrigir um gasto com data fora do mês atual, se o dashboard só lista o mês corrente? →
  A: Não é possível ter esse caso: a data do gasto (na criação e na edição) MUST estar dentro do
  mês atual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar entre Planejamento e Controle (Priority: P1)

A plataforma passa a ter duas partes, cada uma em sua própria página: **Planejamento** (as abas
Receita, Momento Presente e Momento Futuro que hoje ficam na página inicial) e **Controle** (onde o
usuário registra o que gastou de fato). No topo de todas as páginas logadas há dois botões,
"Planejamento" e "Controle", que levam a cada parte. Ao abrir a plataforma, o usuário cai no
Controle.

**Why this priority**: é a estrutura que recebe o restante da feature; sem ela não há onde colocar
o Controle.

**Independent Test**: logado, abrir a página inicial e confirmar que vai para Controle; clicar em
"Planejamento" e confirmar que as três abas funcionam como antes; clicar em "Controle" e voltar.

**Acceptance Scenarios**:

1. **Given** um usuário logado, **When** ele abre a página inicial da plataforma, **Then** é levado
   à página Controle.
2. **Given** um usuário logado em qualquer página, **When** ele olha o topo da página, **Then** vê
   os botões "Planejamento" e "Controle", com o da página atual destacado, e o botão "Sair".
3. **Given** a página Controle, **When** o usuário clica em "Planejamento", **Then** vai para a
   página Planejamento com a aba "Receita" selecionada.
4. **Given** a página Planejamento, **When** o usuário usa as abas, **Then** todo o comportamento
   da feature 002 continua igual (abas, aba no endereço, indicadores de alerta, cadastros e
   slider).
5. **Given** um usuário que acabou de fazer login, **When** o login termina, **Then** ele vai para
   a página Controle.
6. **Given** um usuário deslogado, **When** ele tenta abrir Planejamento ou Controle, **Then** vai
   para o login.

---

### User Story 2 - Registrar um gasto realizado (Priority: P1)

Na página Controle, o usuário registra um gasto que de fato aconteceu, informando nome, valor,
categoria e data. A data já vem preenchida com o dia de hoje. Esse gasto é diferente do gasto do
Momento Presente: o do planejamento é quanto o usuário pretende gastar; o do Controle é quanto ele
gastou.

**Why this priority**: sem registrar gastos realizados não há o que controlar; o dashboard depende
desses dados.

**Independent Test**: registrar um gasto mantendo a data padrão e outro com uma data anterior do
mesmo mês,
recarregar a página e confirmar que os dois continuam lá, sem alterar nenhum gasto do
planejamento.

**Acceptance Scenarios**:

1. **Given** a página Controle, **When** o formulário é exibido, **Then** o campo de data já
   mostra o dia de hoje.
2. **Given** o formulário preenchido com nome "Mercado", valor R$ 230,50, categoria
   "Alimentação" e a data de hoje, **When** o usuário salva, **Then** o gasto é registrado, aparece
   no dashboard e o formulário volta ao estado inicial (data de hoje).
3. **Given** o formulário, **When** o usuário tenta salvar sem nome, valor, categoria ou data, com
   valor zero ou negativo, ou com uma data fora do mês atual, **Then** vê qual campo está com problema e nada é salvo.
4. **Given** gastos registrados no Controle, **When** o usuário abre o Momento Presente no
   Planejamento, **Then** a lista, a soma e o alerta do planejamento não mudam.
5. **Given** um gasto registrado, **When** o usuário recarrega a página ou sai e entra de novo,
   **Then** o gasto continua registrado.
6. **Given** a seleção de categoria do formulário, **When** o usuário a abre, **Then** vê as
   mesmas categorias usadas no planejamento.
7. **Given** um gasto registrado, **When** o usuário o edita (nome, valor, categoria ou data),
   **Then** as alterações são salvas com as mesmas validações da criação e o dashboard é
   atualizado.
8. **Given** um gasto registrado, **When** o usuário o apaga e confirma, **Then** o gasto some da
   lista e o dashboard é atualizado.

---

### User Story 3 - Acompanhar planejado × gasto por categoria (Priority: P2)

Na página Controle há um pequeno dashboard do mês atual. O usuário escolhe em uma seleção a
categoria que quer
acompanhar; a opção padrão é "Todos", que considera todas as categorias juntas. Para a seleção
atual, o dashboard mostra: o total planejado, a lista dos gastos realizados, o valor disponível
(planejado menos gasto) e um gráfico do gasto ao longo do tempo com uma linha de limite no valor
planejado.

**Why this priority**: é o que dá sentido ao Controle, mas depende da História 2 para ter dados.

**Independent Test**: com gastos planejados e gastos realizados em duas categorias, alternar entre
"Todos" e cada categoria e conferir os quatro blocos de informação contra as contas feitas à mão.

**Acceptance Scenarios**:

1. **Given** a página Controle, **When** ela é aberta, **Then** a seleção de categoria mostra
   "Todos" e o dashboard considera todas as categorias.
2. **Given** gastos planejados de R$ 1.500,00 na categoria "Moradia", **When** o usuário seleciona
   "Moradia", **Then** o total planejado mostrado é R$ 1.500,00.
2a. **Given** gastos planejados de R$ 1.500,00 em "Moradia" e R$ 800,00 em "Alimentação" e uma
   meta de R$ 300,00 com categoria "Moradia", **When** a seleção é "Todos", **Then** o total
   planejado é R$ 2.300,00 (a meta não entra).
3. **Given** a categoria "Moradia" selecionada, **When** o dashboard é atualizado, **Then** a
   lista mostra apenas os gastos realizados de "Moradia" no mês atual, do mais recente para o mais
   antigo, com nome, valor e data, e nenhum gasto do planejamento.
4. **Given** planejado de R$ 1.500,00 e gastos realizados de R$ 400,00 e R$ 350,00 na categoria,
   **When** o dashboard é exibido, **Then** o disponível mostrado é R$ 750,00.
5. **Given** gastos realizados que somam mais que o planejado, **When** o dashboard é exibido,
   **Then** o disponível aparece negativo e destacado como acima do limite.
6. **Given** gastos realizados em datas diferentes do mês atual, **When** o gráfico é exibido,
   **Then** mostra o total acumulado gasto dia a dia, do dia 1 ao último dia do mês, e uma linha
   horizontal no valor planejado, de modo que o usuário veja quando o gasto ultrapassou ou se
   aproxima do limite.
6a. **Given** gastos registrados no mês anterior, **When** o dashboard do mês atual é exibido,
   **Then** eles não entram na lista, na soma, no disponível nem no gráfico.
7. **Given** uma categoria sem gastos realizados, **When** ela é selecionada, **Then** o
   dashboard mostra o planejado, disponível igual ao planejado, a lista vazia com a mensagem
   "Nenhum gasto registrado" e o gráfico apenas com a linha de limite.
8. **Given** a categoria selecionada, **When** o usuário registra um novo gasto, **Then** o
   dashboard reflete o novo gasto sem recarregar a página.

---

### Edge Cases

- Categoria sem nenhum gasto planejado: planejado R$ 0,00; qualquer gasto realizado deixa o
  disponível negativo e acima do limite.
- Nenhum gasto realizado em nenhuma categoria: "Todos" mostra o planejado total, disponível igual
  ao planejado, lista vazia e gráfico apenas com a linha de limite.
- Data fora do mês atual (anterior ou posterior), na criação ou na edição: é recusada com a
  mensagem "A data deve estar dentro do mês atual" e nada é salvo.
- Data futura dentro do mês atual (ex.: dia 28 quando hoje é dia 10): é aceita e entra no
  dashboard.
- Gasto do mês anterior aberto para edição após a virada do mês: não acontece nesta versão, pois o
  dashboard só lista o mês atual.
- Formulário aberto antes da meia-noite do último dia do mês e salvo depois: a data é validada
  contra o mês atual no momento de salvar; se ficou fora, o usuário vê o erro e ajusta a data.
- Virada do mês: no dia 1, o dashboard começa vazio (disponível igual ao planejado); os gastos dos
  meses anteriores continuam guardados.
- Gasto registrado em uma categoria diferente da selecionada no dashboard: é salvo normalmente e
  aparece em "Todos" e na sua categoria, mas não na categoria selecionada.
- Muitos gastos no período: a lista continua legível (rolagem dentro do bloco ou paginação simples,
  definido no plano).
- O dia "de hoje" usado como data padrão é o do fuso horário do usuário, não o do servidor.
- Mudanças no planejamento (gastos planejados ou slider) refletem no planejado e no disponível do
  Controle na próxima vez em que a página Controle for exibida.
- Telas estreitas (celular): botões do topo, formulário, seleção, lista e gráfico ficam usáveis sem
  rolagem horizontal da página.
- Sessão expirada: a próxima ação leva ao login sem perder o que já foi salvo.

## Requirements *(mandatory)*

### Functional Requirements

**Páginas e navegação**

- **FR-001**: A plataforma MUST ter duas páginas principais para usuários logados: Planejamento e
  Controle, cada uma com seu próprio endereço (definido no plano, em inglês conforme o Princípio I
  da constituição).
- **FR-002**: O topo de todas as páginas logadas MUST exibir dois botões, "Planejamento" e
  "Controle", que levam às respectivas páginas, com o botão da página atual identificado
  visualmente e para tecnologias assistivas; o botão "Sair" continua no topo.
- **FR-003**: A página inicial da plataforma MUST redirecionar o usuário logado para a página
  Controle; após o login, o usuário MUST ir para a página Controle.
- **FR-004**: A página Planejamento MUST conter as abas "Receita", "Momento Presente" e "Momento
  Futuro" com todo o comportamento definido em `specs/002-planning-tabs`, incluindo a aba no
  endereço, agora no endereço da página Planejamento.
- **FR-005**: As páginas Planejamento e Controle MUST exigir login, como as demais páginas da
  plataforma.

**Gastos realizados (Controle)**

- **FR-006**: O usuário MUST poder registrar gastos realizados com nome, valor em reais, categoria
  e data, todos obrigatórios.
- **FR-007**: O valor MUST ser maior que zero, com até duas casas decimais, seguindo as mesmas
  regras de valor dos gastos do planejamento.
- **FR-008**: A categoria MUST ser escolhida da mesma lista de categorias do planejamento.
- **FR-009**: A data MUST vir preenchida com o dia atual (no fuso do usuário) e MUST poder ser
  alterada apenas para outro dia do mês atual; datas fora do mês atual MUST ser recusadas na
  criação e na edição, com validação também no servidor. A seleção de data SHOULD oferecer apenas
  os dias do mês atual.
- **FR-010**: Gastos realizados MUST ser independentes dos gastos do Momento Presente: registrá-los
  MUST NOT alterar listas, somas ou alertas do Planejamento.
- **FR-011**: Gastos realizados MUST persistir e MUST ser visíveis apenas para o usuário que os
  registrou.
- **FR-012**: O usuário MUST poder editar (nome, valor, categoria e data, esta dentro do mês
  atual) e apagar seus gastos realizados, com as mesmas validações da criação; apagar MUST pedir
  confirmação.
- **FR-013**: Erros de validação MUST indicar o campo com problema, e nada MUST ser salvo enquanto
  houver erro.

**Dashboard**

- **FR-014**: A página Controle MUST ter uma seleção de categoria com a opção "Todos" (padrão) e
  cada categoria da plataforma.
- **FR-015**: Para a seleção atual, o dashboard MUST mostrar o total planejado: a soma dos gastos
  do Momento Presente da categoria selecionada; em "Todos", a soma de todos os gastos do Momento
  Presente. Metas do Momento Futuro MUST NOT entrar nesse total.
- **FR-016**: O dashboard MUST listar os gastos realizados da seleção, com nome, valor, categoria
  (em "Todos") e data, do mais recente para o mais antigo, e MUST NOT listar gastos do
  planejamento.
- **FR-017**: O dashboard MUST mostrar o disponível, igual ao total planejado menos a soma dos
  gastos realizados listados; quando negativo, MUST ser destacado como acima do limite.
- **FR-018**: O dashboard MUST mostrar um gráfico do total acumulado gasto ao longo do tempo (por
  dia) e uma linha de limite no valor do total planejado.
- **FR-019**: O gráfico MUST ter uma alternativa acessível que informe os mesmos dados (por
  exemplo, um resumo textual com o total gasto e o limite).
- **FR-020**: Trocar a seleção ou registrar um gasto MUST atualizar todos os blocos do dashboard
  sem recarregar a página.
- **FR-021**: O dashboard MUST considerar apenas os gastos realizados com data no mês atual (no fuso
  do usuário): lista, soma, disponível e gráfico. O total planejado vale como orçamento mensal e é
  o mesmo em todos os meses. O dashboard MUST indicar o mês exibido (ex.: "Novembro de 2026").

**Comportamento preservado**

- **FR-022**: Regras de cálculo, validações, persistência, privacidade e login/logout das
  features 001 e 002 MUST permanecer inalteradas, exceto pelo endereço onde ficam as abas do
  planejamento e pela página de destino após o login.

### Key Entities *(include if feature involves data)*

- **Gasto realizado** (novo): gasto que de fato aconteceu, registrado no Controle; pertence a um
  usuário; tem nome, valor em reais, categoria obrigatória e data. Não tem ligação com os gastos
  do planejamento.
- **Categoria** (existente): a mesma lista global da feature 001, usada agora também pelos gastos
  realizados.
- **Gasto planejado** (existente, antes chamado só de "gasto"): item do Momento Presente; é a
  base do total planejado por categoria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário chega ao Planejamento ou ao Controle com 1 clique a partir de qualquer
  página logada.
- **SC-002**: O usuário registra um gasto do dia em menos de 30 segundos, sem precisar mexer na
  data.
- **SC-003**: Em 100% dos casos verificados, planejado, disponível e soma da lista do mês atual
  conferem com a conta feita à mão para "Todos" e para cada categoria.
- **SC-004**: Trocar a categoria selecionada atualiza o dashboard em menos de 1 segundo.
- **SC-005**: O usuário consegue dizer, olhando o gráfico, se o gasto da categoria está abaixo ou
  acima do limite, em 100% dos casos de teste.
- **SC-006**: Todos os cenários de aceitação das features 001 e 002 continuam passando, com a
  página Planejamento no lugar da página inicial.

## Assumptions

- "Gasto" no Controle significa gasto realizado; na interface ele é chamado apenas de "gasto",
  pois o contexto (página Controle) já o distingue do gasto planejado.
- Os nomes das páginas e botões são "Planejamento" e "Controle".
- O título da plataforma e o botão "Sair" continuam no topo, junto aos dois botões.
- Ganhos, a divisão do slider e as metas do Momento Futuro não entram no dashboard nesta versão.
- O planejamento continua sem mês: os mesmos gastos planejados valem como limite de todo mês.
- Não há seletor de meses anteriores nesta versão; o histórico fica guardado para uma feature
  futura.
- O gráfico mostra o gasto acumulado por dia; dias sem gasto mantêm o valor acumulado anterior.
- A seleção de categoria do dashboard não precisa ficar no endereço da página nesta versão.
- Não há importação de extratos, gastos recorrentes nem parcelamento nesta versão.
