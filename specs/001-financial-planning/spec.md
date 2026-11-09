# Feature Specification: Planejamento Financeiro Pessoal

**Feature Branch**: `001-financial-planning`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "Uma plataforma de planejamento financeiro pessoal. O usuário deve poder
cadastrar seus ganhos e planejar a divisão deles em 2 categorias: gastos essenciais e metas futuras."
(descrição completa com os comportamentos esperados e o item fora de escopo fornecida em
`/speckit-specify`)

## Clarifications

### Session 2026-11-08

- Q: O planejamento deve ser separado por mês, ou deve existir um único planejamento contínuo
  que o usuário vai atualizando? → A: Um único planejamento contínuo por usuário, sem meses; o
  usuário edita os valores quando a situação muda.
- Q: Quando o usuário move o slider, a nova divisão deve ser salva sozinha ao soltar o slider,
  ou só quando ele clicar em um botão de salvar? → A: Valores e alertas se atualizam enquanto o
  slider se move; a divisão é salva automaticamente ao soltar, com aviso se falhar.
- Q: Ganhos, slider, gastos essenciais e metas futuras devem ficar todos numa única tela, ou em
  páginas separadas? → A: Uma única tela de planejamento com todas as seções.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso seguro à conta (Priority: P1)

O usuário, já cadastrado pelo administrador, entra na plataforma com email e senha, continua
conectado entre visitas até decidir sair e encerra a sessão clicando em um botão de sair. Ele só
enxerga os próprios dados.

**Why this priority**: sem acesso autenticado e isolado, nenhum dado financeiro pode ser exibido
com segurança; é a base de todas as outras histórias.

**Independent Test**: com dois usuários cadastrados, entrar com cada um, fechar e reabrir o
navegador, verificar que a sessão continua ativa, sair pelo botão e confirmar que o acesso à
área logada passa a exigir login novamente.

**Acceptance Scenarios**:

1. **Given** um usuário cadastrado e deslogado, **When** ele informa email e senha corretos,
   **Then** é levado à tela de planejamento, que reúne ganhos, slider, gastos e metas.
2. **Given** um usuário deslogado, **When** ele informa email ou senha incorretos, **Then** vê
   uma mensagem de erro genérica e continua deslogado.
3. **Given** um usuário logado, **When** ele fecha o navegador e volta à plataforma depois,
   **Then** continua logado sem precisar informar as credenciais.
4. **Given** um usuário logado, **When** ele clica no botão de sair, **Then** a sessão é
   encerrada e ele é levado à tela de login.
5. **Given** um usuário deslogado, **When** ele tenta acessar a área de planejamento
   diretamente, **Then** é redirecionado para a tela de login.
6. **Given** dois usuários A e B com dados cadastrados, **When** A está logado, **Then** A não
   vê nem consegue alterar nenhum ganho, gasto, meta ou divisão de B.

---

### User Story 2 - Cadastro de ganhos e receita total (Priority: P1)

O usuário cadastra vários ganhos (ex.: salário, freelance), pode editá-los e apagá-los, e vê a
receita total, que é a soma de todos os seus ganhos.

**Why this priority**: a receita é a base de cálculo de todo o planejamento; sem ela não há o
que dividir.

**Independent Test**: logado, cadastrar três ganhos, conferir a receita total, editar um,
apagar outro, recarregar a página e verificar que os ganhos e a receita refletem as alterações.

**Acceptance Scenarios**:

1. **Given** um usuário logado sem ganhos, **When** ele cadastra um ganho "Salário" de
   R$ 5.000,00, **Then** o ganho aparece na lista e a receita total é R$ 5.000,00.
2. **Given** um ganho de R$ 5.000,00, **When** o usuário cadastra outro de R$ 1.250,50,
   **Then** a receita total passa a ser R$ 6.250,50.
3. **Given** um ganho existente, **When** o usuário altera seu valor, **Then** a lista e a
   receita total refletem o novo valor.
4. **Given** um ganho existente, **When** o usuário o apaga e confirma, **Then** ele some da
   lista e a receita total é recalculada.
5. **Given** ganhos cadastrados, **When** o usuário sai e entra novamente, **Then** os mesmos
   ganhos continuam lá.

---

### User Story 3 - Divisão da receita com o slider (Priority: P2)

O usuário usa um slider para definir quanto da receita vai para gastos essenciais e quanto vai
para metas futuras. Um lado do slider representa a porcentagem de gastos essenciais e o outro a
de metas futuras; as duas sempre somam 100%. A escolha fica salva.

**Why this priority**: define os limites planejados de cada seção, que dão sentido às somas e
aos alertas.

**Independent Test**: com receita cadastrada, mover o slider para 70/30, verificar os valores
planejados exibidos, recarregar a página e confirmar que a divisão continua 70/30.

**Acceptance Scenarios**:

1. **Given** receita de R$ 6.000,00 e divisão 50/50, **When** o usuário move o slider para 70%
   gastos essenciais, **Then** a tela mostra 70% (R$ 4.200,00) para gastos essenciais e 30%
   (R$ 1.800,00) para metas futuras.
2. **Given** o usuário soltou o slider em 70/30, sem clicar em nenhum botão, **When** ele
   recarrega a página ou entra em outro dia, **Then** o slider continua em 70/30.
3. **Given** um usuário que nunca ajustou o slider, **When** ele acessa o planejamento pela
   primeira vez, **Then** a divisão padrão é 50/50.

---

### User Story 4 - Gastos essenciais (Priority: P2)

Na seção de gastos essenciais, o usuário cria, edita e apaga gastos com nome, valor e categoria
(escolhida de uma lista pré-cadastrada) e vê a soma de todos os gastos.

**Why this priority**: é uma das duas metades do planejamento e o principal uso cotidiano.

**Independent Test**: criar dois gastos com categorias diferentes, conferir que a soma exibida
é a soma dos valores e que os gastos persistem após recarregar a página.

**Acceptance Scenarios**:

1. **Given** a seção de gastos essenciais, **When** o usuário cria o gasto "Aluguel",
   R$ 1.500,00, categoria "Moradia", **Then** o gasto aparece na seção e a soma é R$ 1.500,00.
2. **Given** a criação de um gasto, **When** o usuário abre a seleção de categoria, **Then** vê
   todas as categorias cadastradas na plataforma.
3. **Given** a criação de um gasto, **When** o usuário tenta salvar sem nome, valor ou
   categoria, **Then** vê qual campo está faltando e o gasto não é salvo.
4. **Given** gastos de R$ 1.500,00 e R$ 450,75, **When** a seção é exibida, **Then** a soma
   mostrada é R$ 1.950,75.
5. **Given** um gasto existente, **When** o usuário o edita ou apaga, **Then** a lista e a soma
   refletem a alteração (exclusão pede confirmação).

---

### User Story 5 - Metas futuras (Priority: P2)

Na seção de metas futuras, o usuário cria, edita e apaga metas com nome, valor (quanto reserva
para a meta no planejamento) e categoria opcional, e vê a soma das metas.

**Why this priority**: é a outra metade do planejamento, com o mesmo peso dos gastos.

**Independent Test**: criar uma meta só com nome e valor e outra com todos os campos, conferir
a soma, editar e apagar uma delas e verificar a persistência após recarregar.

**Acceptance Scenarios**:

1. **Given** a seção de metas futuras, **When** o usuário cria a meta "Viagem", valor
   R$ 500,00, sem categoria, **Then** a meta é salva e aparece na seção.
2. **Given** a criação de uma meta, **When** o usuário escolhe uma categoria, **Then** a meta
   é salva com essa categoria.
3. **Given** metas com valores R$ 500,00 e R$ 300,00, **When** a seção é exibida, **Then** a
   soma mostrada é R$ 800,00.
4. **Given** a criação de uma meta, **When** o usuário tenta salvar sem nome ou sem valor,
   **Then** vê qual campo está faltando e a meta não é salva.
5. **Given** uma meta existente, **When** o usuário a edita ou apaga, **Then** a lista e a soma
   refletem a alteração (exclusão pede confirmação).

---

### User Story 6 - Alerta de planejamento excedido (Priority: P3)

Quando a soma dos gastos ultrapassa o valor planejado para gastos essenciais (receita total ×
porcentagem do slider), a tela mostra um alerta chamativo informando que o planejamento está
incorreto. O mesmo vale para a soma das metas em relação ao valor planejado para metas futuras.

**Why this priority**: agrega valor ao planejamento, mas depende de todas as histórias
anteriores.

**Independent Test**: com receita de R$ 4.000,00 e divisão 50/50, cadastrar gastos que somem
R$ 2.100,00 e verificar o alerta na seção de gastos; reduzir para R$ 2.000,00 e verificar que o
alerta some.

**Acceptance Scenarios**:

1. **Given** receita de R$ 4.000,00, divisão 50/50 e gastos somando R$ 2.100,00, **When** a
   tela é exibida, **Then** aparece o alerta de planejamento incorreto para gastos essenciais.
2. **Given** gastos somando exatamente R$ 2.000,00 nas mesmas condições, **When** a tela é
   exibida, **Then** nenhum alerta aparece para gastos essenciais.
3. **Given** metas somando mais que o valor planejado para metas futuras, **When** a tela é
   exibida, **Then** aparece o alerta de planejamento incorreto para metas futuras.
4. **Given** um alerta visível, **When** o usuário move o slider, altera ganhos, gastos ou
   metas de forma que a soma deixe de exceder o planejado, **Then** o alerta desaparece sem
   precisar recarregar a página.

---

### Edge Cases

- Usuário sem nenhum ganho: receita total é R$ 0,00; os valores planejados são R$ 0,00 e
  qualquer gasto ou meta com valor maior que zero dispara o alerta da respectiva seção.
- Slider nos extremos (100/0 ou 0/100): uma das seções tem valor planejado R$ 0,00.
- Valores com mais de duas casas decimais, negativos, zero ou não numéricos: são rejeitados com
  mensagem clara.
- Valores muito altos (ex.: R$ 999.999.999,99): são aceitos e exibidos sem perda de precisão.
- Somas com centavos (ex.: R$ 0,10 + R$ 0,20) são exibidas exatamente (R$ 0,30).
- Valor planejado com fração de centavo (ex.: 33% de R$ 100,01): é arredondado para o centavo
  mais próximo na exibição; a comparação do alerta usa o mesmo valor exibido.
- Nenhuma categoria cadastrada na plataforma: a criação de gasto informa que não há categorias
  disponíveis e não permite salvar.
- Sessão expirada ou encerrada em outra aba: a próxima ação leva o usuário à tela de login sem
  perda de dados já salvos.
- Usuário tentando acessar ou alterar um registro de outro usuário (ex.: alterando o endereço da
  página): a operação é negada e nada é revelado sobre o registro.
- Falha ao salvar (ex.: perda de conexão): o usuário é avisado e o dado não aparece como salvo.
- Usuário move o slider várias vezes em sequência rápida: apenas a última posição solta
  permanece salva.

## Requirements *(mandatory)*

### Functional Requirements

**Autenticação e privacidade**

- **FR-001**: O sistema MUST permitir login com email e senha de usuários previamente
  cadastrados pelo administrador.
- **FR-002**: O sistema MUST exibir uma mensagem de erro genérica (sem indicar se o email
  existe) quando as credenciais forem inválidas.
- **FR-003**: O sistema MUST manter o usuário logado entre visitas e após fechar o navegador,
  até que ele saia explicitamente.
- **FR-004**: O sistema MUST oferecer um botão de sair, visível na área logada, que encerra a
  sessão e leva à tela de login.
- **FR-005**: O sistema MUST redirecionar para a tela de login qualquer acesso não autenticado
  à área de planejamento.
- **FR-006**: O sistema MUST garantir que cada usuário só possa ver, criar, alterar e apagar os
  próprios ganhos, gastos, metas e divisão da receita.
- **FR-007**: O sistema MUST NOT oferecer cadastro de novos usuários.

**Tela de planejamento**

- **FR-007a**: Após o login, o usuário MUST ser levado a uma única tela de planejamento que
  reúne as seções de ganhos (com a receita total), o slider de divisão, gastos essenciais e
  metas futuras; criar, editar e apagar itens MUST acontecer nessa mesma tela, sem navegar para
  outras páginas.

**Ganhos e receita**

- **FR-008**: Usuários MUST poder cadastrar quantos ganhos quiserem, cada um com nome e valor.
- **FR-009**: Usuários MUST poder editar o nome e o valor de um ganho.
- **FR-010**: Usuários MUST poder apagar um ganho, com confirmação antes da exclusão.
- **FR-011**: O sistema MUST exibir a receita total como a soma dos valores de todos os ganhos
  do usuário.
- **FR-012**: O sistema MUST persistir os ganhos de forma que permaneçam disponíveis entre
  sessões.

**Divisão da receita**

- **FR-013**: O sistema MUST oferecer um slider em que um lado representa a porcentagem para
  gastos essenciais e o outro a porcentagem para metas futuras, sempre somando 100%.
- **FR-014**: O slider MUST permitir valores inteiros de 0% a 100%, com passo de 1%.
- **FR-015**: O sistema MUST exibir, para cada seção, a porcentagem e o valor planejado
  (receita total × porcentagem), arredondado ao centavo.
- **FR-016**: O sistema MUST salvar a divisão automaticamente quando o usuário soltar o slider,
  sem botão de salvar, e restaurá-la nas próximas sessões.
- **FR-016a**: Enquanto o slider é movido, as porcentagens, os valores planejados e os alertas
  MUST ser atualizados em tempo real, antes mesmo de salvar.
- **FR-016b**: Se o salvamento da divisão falhar, o sistema MUST avisar o usuário e manter
  visível que a divisão exibida não foi salva.
- **FR-017**: Para usuários que nunca ajustaram a divisão, o sistema MUST usar 50% / 50%.

**Gastos essenciais**

- **FR-018**: Usuários MUST poder criar gastos na seção de gastos essenciais, com nome, valor e
  categoria, todos obrigatórios.
- **FR-019**: A categoria do gasto MUST ser escolhida de uma lista de categorias cadastradas na
  plataforma.
- **FR-020**: O sistema MUST exibir na seção de gastos essenciais a soma dos valores de todos os
  gastos do usuário.
- **FR-021**: O sistema MUST persistir os gastos entre sessões.

**Metas futuras**

- **FR-022**: Usuários MUST poder criar metas na seção de metas futuras, com nome e valor
  obrigatórios e categoria opcional.
- **FR-023**: A categoria opcional da meta MUST ser escolhida da mesma lista de categorias
  cadastradas na plataforma.
- **FR-024**: O sistema MUST exibir na seção de metas futuras a soma dos valores de todas as
  metas do usuário.
- **FR-025**: O sistema MUST persistir as metas entre sessões.
- **FR-026**: Usuários MUST poder editar todos os campos de gastos e metas e apagá-los, com
  confirmação antes da exclusão; a soma e os alertas MUST refletir a alteração.

**Valores monetários**

- **FR-027**: Todos os valores (ganho, gasto e valor de meta) MUST ser em reais (R$),
  maiores que zero e com no máximo duas casas decimais.
- **FR-028**: O sistema MUST calcular somas e comparações sem erros de arredondamento de
  centavos.
- **FR-029**: O sistema MUST exibir valores no formato monetário brasileiro (ex.: R$ 1.234,56).

**Alertas**

- **FR-030**: O sistema MUST exibir um alerta visualmente destacado na seção de gastos
  essenciais quando a soma dos gastos for estritamente maior que o valor planejado para gastos
  essenciais, informando que o planejamento está incorreto e quanto foi excedido.
- **FR-031**: O sistema MUST aplicar a mesma regra de alerta à seção de metas futuras,
  comparando a soma das metas com o valor planejado para metas futuras.
- **FR-032**: Os alertas MUST aparecer e desaparecer imediatamente quando ganhos, gastos, metas
  ou a posição do slider forem alterados.

### Key Entities *(include if feature involves data)*

- **Usuário**: pessoa com acesso à plataforma, cadastrada pelo administrador; identificada por
  email. Dona de todos os seus ganhos, gastos, metas e da divisão da receita.
- **Ganho**: entrada de dinheiro do usuário; nome e valor em reais. A soma dos ganhos é a
  receita total.
- **Divisão da receita**: preferência única por usuário com a porcentagem destinada a gastos
  essenciais; a de metas futuras é o complemento até 100%.
- **Categoria**: classificação compartilhada por todos os usuários, com apenas o atributo nome;
  mantida pelo administrador.
- **Gasto**: gasto essencial do usuário; nome, valor em reais e uma categoria obrigatória.
- **Meta**: meta futura do usuário; nome, valor em reais (quanto da receita é reservado para ela)
  e categoria opcional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário cadastrado consegue entrar na plataforma em menos de 30 segundos.
- **SC-002**: Após entrar, um usuário consegue cadastrar sua receita, ajustar a divisão e
  registrar um gasto e uma meta em menos de 5 minutos na primeira utilização.
- **SC-003**: 100% das tentativas de acessar dados de outro usuário são negadas.
- **SC-004**: 100% dos dados salvos (ganhos, divisão, gastos e metas) aparecem iguais após sair
  e entrar novamente.
- **SC-005**: Somas, valores planejados e alertas batem ao centavo com o cálculo manual em 100%
  dos casos de teste.
- **SC-006**: O alerta de planejamento excedido aparece ou some em menos de 1 segundo após a
  alteração que o causa.
- **SC-007**: Usuários que voltam à plataforma não precisam informar credenciais novamente,
  salvo após terem saído.

## Assumptions

- Cadastro de usuários, recuperação de senha e troca de senha estão fora de escopo; o
  administrador cadastra os usuários manualmente.
- Existe um único planejamento contínuo por usuário, sem separação por mês ou período e sem
  histórico; os valores representam o planejamento vigente (confirmado em Clarifications).
  Planejamento mensal poderá ser uma feature futura.
- Um ganho tem nome e valor; não há data, recorrência ou categoria de ganho nesta versão.
- As categorias são uma lista global, a mesma para gastos e metas, cadastrada pelo
  administrador; usuários não criam, editam nem apagam categorias.
- O "alvo" de uma meta (valor total a atingir) está fora de escopo nesta versão, pois ainda não
  foi definido; poderá ser adicionado em uma feature futura.
- A divisão padrão inicial é 50% / 50% e o slider usa passos de 1%.
- O alerta dispara somente quando a soma é estritamente maior que o planejado; igualar o valor
  planejado não gera alerta.
- O alerta é informativo e não impede salvar gastos ou metas.
- Apagar um ganho, gasto ou meta pede confirmação para evitar exclusões acidentais.
- A plataforma é usada em navegadores modernos, em desktop e celular, em português do Brasil.
