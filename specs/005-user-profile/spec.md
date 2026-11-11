# Feature Specification: Perfil do usuário

**Feature Branch**: `005-user-profile`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Perfil do Usuário. No header, no canto direito, um componente de
Avatar: círculo com a foto do usuário e borda na cor do usuário. Ao clicar, abre um menu com
'Perfil' (vai para a página de perfil) e 'Sair' (desloga; substitui o botão de sair atual). A
página de perfil exibe foto, nome e sobrenome, email e cor, todos editáveis por um botão de
edição que transforma as informações em formulário. A cor é só personalização, escolhida entre
amarelo, laranja, azul, ciano, rosa, vermelho, verde e roxo, combinando com a paleta do projeto,
e fica em volta do avatar. Boa apresentação e responsividade."

**Depends on**: `specs/004-visual-redesign` (cabeçalho, tokens de tema, temas claro e escuro e
regras de responsividade que esta feature segue).

## Clarifications

### Session 2026-11-11

- Q: Como a cor do avatar deve conviver com as cores de significado fixo da constituição? → A: A
  cor do usuário sai do escopo por enquanto; a borda do avatar é sempre cinza neutra (padrão do
  tema), e o perfil não exibe nem edita cor.
- Q: Na troca de email, quem precisa confirmar? → A: O email não pode ser trocado por enquanto;
  ele aparece no perfil apenas para leitura, inclusive no modo de edição.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Avatar e menu da conta no cabeçalho (Priority: P1)

Em qualquer página logada, o usuário vê no canto direito do cabeçalho um círculo com a sua foto
(ou suas iniciais, se não tiver foto) cercado por uma borda cinza neutra. Ao tocar nele, abre um
menu com duas opções: "Perfil", que leva à página de perfil, e "Sair", que encerra a sessão. O
botão "Sair" que existe hoje no cabeçalho deixa de existir.

**Why this priority**: é o ponto de entrada de toda a feature e substitui a única forma atual de
sair da conta; sem ele, o usuário não chega ao perfil nem consegue deslogar.

**Independent Test**: entrar na plataforma, conferir o avatar no canto direito do cabeçalho em
Controle e Planejamento, abrir o menu, usar "Perfil" e depois "Sair".

**Acceptance Scenarios**:

1. **Given** um usuário logado com foto, **When** qualquer página logada é exibida, **Then** o
   canto direito do cabeçalho mostra a foto num círculo com borda cinza neutra, e não há mais um
   botão "Sair" solto no cabeçalho.
2. **Given** um usuário logado sem foto, **When** o cabeçalho é exibido, **Then** o círculo mostra
   as iniciais do nome (ou a inicial do email, se não houver nome) com a mesma borda.
3. **Given** o cabeçalho exibido, **When** o usuário toca no avatar, **Then** abre um menu com as
   opções "Perfil" e "Sair", identificando também o nome e o email do usuário.
4. **Given** o menu aberto, **When** o usuário escolhe "Perfil", **Then** é levado à página de
   perfil e o menu fecha.
5. **Given** o menu aberto, **When** o usuário escolhe "Sair", **Then** a sessão é encerrada e ele
   é levado à tela de login; voltar pelo navegador não reexibe dados da conta.
6. **Given** o menu aberto, **When** o usuário toca fora dele ou pressiona Esc, **Then** o menu
   fecha sem nenhuma ação.
7. **Given** um usuário que navega só pelo teclado, **When** ele foca o avatar e pressiona Enter
   ou Espaço, **Then** o menu abre, as opções são percorríveis com as setas e Tab, e o foco volta
   ao avatar quando o menu fecha.

---

### User Story 2 - Ver o próprio perfil (Priority: P1)

O usuário abre a página de perfil e vê, de forma organizada, a sua foto, o nome e sobrenome e o
email da conta.

**Why this priority**: é o destino da opção "Perfil" e a base da edição; já entrega valor ao
mostrar com que dados a conta está identificada.

**Independent Test**: abrir a página de perfil pelo menu do avatar e conferir que os três dados
aparecem, inclusive para uma conta ainda sem foto e sem nome.

**Acceptance Scenarios**:

1. **Given** um usuário com todos os dados preenchidos, **When** ele abre o perfil, **Then** vê a
   foto, o nome e sobrenome e o email.
2. **Given** um usuário sem foto e sem nome, **When** ele abre o perfil, **Then** vê o avatar com a
   inicial do email, o aviso "Nome não informado" no lugar do nome e um convite para editar.
3. **Given** um visitante não logado, **When** ele tenta acessar o endereço do perfil, **Then** é
   levado à tela de login.

---

### User Story 3 - Editar nome e sobrenome (Priority: P2)

Na página de perfil, o usuário toca em "Editar perfil" e as informações viram um formulário:
campos de nome e sobrenome. O email continua visível, mas apenas para leitura. Ele pode salvar ou
cancelar. Ao salvar, o perfil e o avatar do cabeçalho passam a refletir os novos dados.

**Why this priority**: é o núcleo do pedido ("todos esses itens devem ser editáveis"), mas
depende das histórias 1 e 2 para ter onde aparecer.

**Independent Test**: editar nome e sobrenome, salvar e conferir perfil e cabeçalho; repetir
cancelando e conferir que nada mudou; conferir que o email não pode ser alterado.

**Acceptance Scenarios**:

1. **Given** o perfil em modo de leitura, **When** o usuário toca em "Editar perfil", **Then** nome
   e sobrenome viram campos preenchidos com os valores atuais, o email continua exibido como
   texto não editável e aparecem os botões "Salvar" e "Cancelar".
2. **Given** o modo de edição, **When** o usuário altera nome e sobrenome e toca em "Salvar",
   **Then** o perfil volta ao modo de leitura com os novos dados, uma mensagem confirma o
   salvamento e o menu do avatar e as iniciais no cabeçalho já refletem o novo nome.
3. **Given** o modo de edição com alterações, **When** o usuário toca em "Cancelar", **Then** o
   perfil volta ao modo de leitura com os dados anteriores, sem salvar nada.
4. **Given** o modo de edição, **When** o usuário deixa o nome vazio ou ultrapassa o limite de
   caracteres e tenta salvar, **Then** o campo mostra a mensagem de erro correspondente e nada é
   salvo.
5. **Given** um pedido de salvamento que inclua um email diferente do da conta (ex.: enviado
   contornando a tela), **When** o servidor o recebe, **Then** o email da conta não muda.

---

### User Story 4 - Trocar ou remover a foto (Priority: P2)

No modo de edição, o usuário escolhe uma imagem do dispositivo para ser a sua foto, vê uma
prévia no círculo e confirma ao salvar. Também pode remover a foto, voltando às iniciais.

**Why this priority**: a foto é o elemento central do avatar, mas o avatar já funciona com
iniciais, então pode vir depois da edição dos dados em texto.

**Independent Test**: no modo de edição, escolher uma imagem válida, conferir a prévia, salvar e
ver a foto no perfil e no cabeçalho; depois remover a foto e conferir a volta das iniciais.

**Acceptance Scenarios**:

1. **Given** o modo de edição, **When** o usuário escolhe uma imagem JPG, PNG ou WebP de até 2 MB,
   **Then** vê uma prévia no círculo do avatar antes de salvar.
2. **Given** uma prévia de foto nova, **When** o usuário salva, **Then** a nova foto aparece no
   perfil e no cabeçalho, recortada em círculo sem distorção.
3. **Given** uma prévia de foto nova, **When** o usuário cancela, **Then** a foto anterior é
   mantida.
4. **Given** um arquivo de outro formato ou maior que 2 MB, **When** o usuário o escolhe, **Then**
   vê uma mensagem explicando o formato e o tamanho aceitos e a foto não muda.
5. **Given** um usuário com foto, **When** ele escolhe "Remover foto" e salva, **Then** o avatar
   volta a mostrar as iniciais no perfil e no cabeçalho.

---

### User Story 5 - Perfil bem apresentado em qualquer tela (Priority: P3)

A página de perfil e o menu do avatar seguem o visual da plataforma e se adaptam ao tamanho da
tela: no celular, foto em destaque no topo e campos em uma coluna; em telas largas, o conteúdo
fica centralizado e bem distribuído, sem esticar até as bordas.

**Why this priority**: o pedido exige boa apresentação e responsividade, mas as histórias
anteriores já são utilizáveis com o layout básico.

**Independent Test**: abrir o perfil e o menu do avatar em 360 px, 768 px e 1280 px de largura,
nos temas claro e escuro, em leitura e em edição.

**Acceptance Scenarios**:

1. **Given** uma tela de 360 px, **When** o perfil é exibido em leitura ou edição, **Then** não há
   rolagem horizontal, todos os botões têm área de toque de no mínimo 44 × 44 px e os campos
   ocupam a largura disponível em uma coluna.
2. **Given** uma tela de 1280 px, **When** o perfil é exibido, **Then** o conteúdo fica num
   bloco centralizado de largura limitada, com a foto e os dados lado a lado ou em destaque.
3. **Given** o tema escuro, **When** o perfil e o menu do avatar são exibidos, **Then** textos,
   campos e a borda do avatar mantêm contraste legível.
4. **Given** um celular, **When** o menu do avatar abre, **Then** ele fica inteiro dentro da tela.

---

### Edge Cases

- Nome ou sobrenome com acentos, apóstrofos ou hífens (ex.: "Pêpe", "D'Ávila", "Ana-Clara") são
  aceitos e exibidos corretamente; espaços no início e no fim são descartados.
- Nome muito longo no menu ou no perfil é truncado com reticências na exibição, sem quebrar o
  layout; o valor completo continua salvo.
- Se a foto salva não puder ser carregada (arquivo indisponível), o avatar mostra as iniciais em
  vez de uma imagem quebrada.
- Falha de conexão ao salvar mantém o modo de edição com os valores digitados e mostra uma
  mensagem de erro, sem perder o que foi preenchido.
- O usuário tenta sair do modo de edição navegando para outra página com alterações não salvas:
  a plataforma pede confirmação antes de descartá-las.
- Email muito longo no menu ou no perfil é truncado com reticências na exibição, sem quebrar o
  layout.
- Sessão expirada enquanto o perfil está em edição: ao salvar, o usuário é levado ao login sem
  que nada seja gravado.
- Imagem muito grande em pixels, mas dentro de 2 MB, ou em formato retrato/paisagem: é exibida
  centralizada e recortada em círculo, sem distorção.

## Requirements *(mandatory)*

### Functional Requirements

**Avatar e menu da conta**

- **FR-001**: Toda página logada MUST exibir no canto direito do cabeçalho um avatar circular com
  a foto do usuário e uma borda cinza neutra, igual para todos os usuários.
- **FR-002**: Sem foto, ou com foto que não carrega, o avatar MUST exibir as iniciais do nome e
  sobrenome (ou a primeira letra do email, se não houver nome) sobre um fundo neutro, mantendo a
  mesma borda.
- **FR-003**: Ao ser acionado (clique, toque, Enter ou Espaço), o avatar MUST abrir um menu com,
  nesta ordem, as opções "Perfil" e "Sair", precedidas do nome e do email do usuário.
- **FR-004**: A opção "Perfil" MUST levar à página de perfil do usuário logado.
- **FR-005**: A opção "Sair" MUST encerrar a sessão e levar à tela de login, com o mesmo efeito do
  botão de sair atual.
- **FR-006**: O botão "Sair" que hoje fica solto no cabeçalho MUST ser removido; "Sair" passa a
  existir apenas no menu do avatar.
- **FR-007**: O menu MUST fechar ao escolher uma opção, ao tocar fora dele ou ao pressionar Esc,
  e MUST ser operável por teclado, com o foco devolvido ao avatar ao fechar.
- **FR-008**: O avatar MUST ter um nome acessível (ex.: "Menu da conta de Felipe") para leitores
  de tela.

**Página de perfil — leitura**

- **FR-009**: A plataforma MUST ter uma página de perfil acessível apenas a usuários logados;
  visitantes não logados MUST ser levados ao login.
- **FR-010**: A página de perfil MUST exibir a foto (ou as iniciais), o nome e sobrenome e o
  email da conta.
- **FR-011**: Dados ainda não informados MUST aparecer com um texto indicativo (ex.: "Nome não
  informado") em vez de um espaço vazio.
- **FR-012**: A página MUST mostrar apenas os dados do próprio usuário logado; não deve ser
  possível ver ou alterar o perfil de outro usuário.

**Página de perfil — edição**

- **FR-013**: A página MUST ter um botão "Editar perfil" que transforma as informações em um
  formulário preenchido com os valores atuais, com os botões "Salvar" e "Cancelar".
- **FR-014**: "Cancelar" MUST descartar todas as alterações (inclusive foto escolhida e não salva)
  e voltar ao modo de leitura.
- **FR-015**: Nome e sobrenome MUST ser campos separados; o nome é obrigatório e o sobrenome é
  opcional; cada um aceita até 50 caracteres após remover espaços nas pontas.
- **FR-016**: O email MUST ser exibido apenas para leitura, também no modo de edição; a
  plataforma MUST NOT oferecer forma de trocá-lo nesta feature.
- **FR-017**: O salvamento do perfil MUST ignorar ou recusar qualquer valor de email recebido, de
  modo que o email da conta nunca seja alterado por ele.
- **FR-018**: O modo de edição MUST permitir escolher uma foto do dispositivo nos formatos JPG,
  PNG ou WebP com até 2 MB, mostrando uma prévia antes de salvar, e MUST permitir remover a foto
  atual.
- **FR-019**: Arquivos fora do formato ou do tamanho aceitos MUST ser recusados com mensagem que
  informe formato e tamanho aceitos.
- **FR-020**: Toda validação MUST ser feita também ao salvar no servidor, recusando dados
  inválidos mesmo que a verificação na tela seja contornada.
- **FR-021**: Ao salvar com sucesso, o perfil MUST voltar ao modo de leitura, exibir uma
  confirmação e o avatar do cabeçalho MUST refletir os novos dados sem que o usuário precise
  recarregar a página.
- **FR-022**: Em caso de falha ao salvar, a plataforma MUST manter o modo de edição com os
  valores digitados e exibir uma mensagem de erro.
- **FR-023**: Ao tentar sair da página com alterações não salvas, a plataforma MUST pedir
  confirmação antes de descartá-las.
- **FR-024**: A foto de um usuário MUST ser acessível apenas para exibição na própria conta; não
  deve ser possível listar ou alterar fotos de outros usuários.

**Apresentação**

- **FR-025**: Avatar, menu e página de perfil MUST seguir o visual da plataforma (feature 004),
  funcionar nos temas claro e escuro com contraste AA e funcionar a partir de 360 px de largura,
  sem rolagem horizontal e com alvos de toque de no mínimo 44 × 44 px.
- **FR-026**: A borda cinza do avatar MUST usar um token neutro do tema, com contraste mínimo de
  3:1 contra o fundo do cabeçalho e da página nos dois temas.

### Key Entities *(include if feature involves data)*

- **Perfil do usuário**: dados de apresentação de uma conta. Atributos: nome (obrigatório ao
  editar, até 50 caracteres), sobrenome (opcional, até 50 caracteres), foto (opcional; imagem
  JPG, PNG ou WebP de até 2 MB). Pertence a exatamente uma conta e é visível e editável apenas
  por ela.
- **Conta**: a conta de acesso já existente, identificada pelo email usado no login. O email é
  exibido no perfil apenas para leitura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das páginas logadas, o avatar aparece no canto direito do cabeçalho e o
  botão "Sair" solto não aparece mais.
- **SC-002**: A partir de qualquer página logada, o usuário chega à página de perfil em no máximo
  2 toques (avatar → "Perfil") e sai da conta em no máximo 2 toques (avatar → "Sair").
- **SC-003**: Um usuário consegue trocar nome e sobrenome e salvar em menos de 30 segundos.
- **SC-004**: Após salvar, o novo nome e a nova foto aparecem no cabeçalho em até 2 segundos, sem
  recarregar a página.
- **SC-005**: 100% das tentativas de salvar dados inválidos (nome vazio, nome com mais de 50
  caracteres, foto fora do formato ou acima de 2 MB) são recusadas, com mensagem, tanto na tela
  quanto no servidor.
- **SC-006**: Nenhum salvamento do perfil altera o email da conta.
- **SC-007**: Perfil e menu do avatar passam em verificação de contraste AA nos temas claro e
  escuro e não têm rolagem horizontal em 360, 768 e 1280 px.
- **SC-008**: Nenhum usuário consegue ver ou alterar o perfil ou a foto de outro usuário.

## Assumptions

- **Contas existentes**: as contas atuais não têm nome nem foto; até o usuário editar o perfil, o
  avatar usa a inicial do email. Não há cadastro de novas contas na plataforma, então o perfil é
  preenchido só pela página de perfil.
- **Foto**: limite de 2 MB e formatos JPG, PNG e WebP são padrões razoáveis para foto de perfil;
  não há ferramenta de recorte, a imagem é centralizada e recortada em círculo automaticamente.
- **Fora do escopo**: cor personalizada do avatar (adiada; pode voltar numa feature futura, o que
  exigirá tratar as cores de significado fixo do Princípio VI da constituição), trocar email
  (adiado), alterar senha,
  excluir conta e outras configurações de segurança.
- **Menu**: o cabeçalho de páginas logadas já existe (feature 004); o avatar ocupa o lugar do
  botão "Sair" atual. A página de perfil não ganha item próprio na navegação principal; o acesso
  é pelo menu do avatar.
- **Iniciais**: até duas letras (primeira letra do nome e do sobrenome), em maiúsculas.
