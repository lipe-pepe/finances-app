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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Avatar e menu da conta no cabeçalho (Priority: P1)

Em qualquer página logada, o usuário vê no canto direito do cabeçalho um círculo com a sua foto
(ou suas iniciais, se não tiver foto) cercado por uma borda na sua cor. Ao tocar nele, abre um
menu com duas opções: "Perfil", que leva à página de perfil, e "Sair", que encerra a sessão. O
botão "Sair" que existe hoje no cabeçalho deixa de existir.

**Why this priority**: é o ponto de entrada de toda a feature e substitui a única forma atual de
sair da conta; sem ele, o usuário não chega ao perfil nem consegue deslogar.

**Independent Test**: entrar na plataforma, conferir o avatar no canto direito do cabeçalho em
Controle e Planejamento, abrir o menu, usar "Perfil" e depois "Sair".

**Acceptance Scenarios**:

1. **Given** um usuário logado com foto, **When** qualquer página logada é exibida, **Then** o
   canto direito do cabeçalho mostra a foto num círculo com borda na cor escolhida pelo usuário,
   e não há mais um botão "Sair" solto no cabeçalho.
2. **Given** um usuário logado sem foto, **When** o cabeçalho é exibido, **Then** o círculo mostra
   as iniciais do nome (ou a inicial do email, se não houver nome) com a mesma borda colorida.
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

O usuário abre a página de perfil e vê, de forma organizada, a sua foto (com a borda na sua cor),
o nome e sobrenome, o email da conta e a cor escolhida, identificada pelo nome (ex.: "Roxo") e por
uma amostra.

**Why this priority**: é o destino da opção "Perfil" e a base da edição; já entrega valor ao
mostrar com que dados a conta está identificada.

**Independent Test**: abrir a página de perfil pelo menu do avatar e conferir que os quatro
dados aparecem, inclusive para uma conta ainda sem foto e sem nome.

**Acceptance Scenarios**:

1. **Given** um usuário com todos os dados preenchidos, **When** ele abre o perfil, **Then** vê a
   foto com a borda colorida, o nome e sobrenome, o email e o nome da cor com a amostra.
2. **Given** um usuário sem foto e sem nome, **When** ele abre o perfil, **Then** vê o avatar com a
   inicial do email, o aviso "Nome não informado" no lugar do nome e um convite para editar.
3. **Given** um visitante não logado, **When** ele tenta acessar o endereço do perfil, **Then** é
   levado à tela de login.

---

### User Story 3 - Editar nome, email e cor (Priority: P2)

Na página de perfil, o usuário toca em "Editar perfil" e as informações viram um formulário:
campos de nome e sobrenome, campo de email e um seletor com as oito cores. Ele pode salvar ou
cancelar. Ao salvar, o perfil e o avatar do cabeçalho passam a refletir os novos dados.

**Why this priority**: é o núcleo do pedido ("todos esses itens devem ser editáveis"), mas
depende das histórias 1 e 2 para ter onde aparecer.

**Independent Test**: editar nome, sobrenome e cor, salvar e conferir perfil e cabeçalho; repetir
cancelando e conferir que nada mudou; trocar o email e seguir a confirmação.

**Acceptance Scenarios**:

1. **Given** o perfil em modo de leitura, **When** o usuário toca em "Editar perfil", **Then** os
   dados viram campos preenchidos com os valores atuais e aparecem os botões "Salvar" e
   "Cancelar".
2. **Given** o modo de edição, **When** o usuário altera nome, sobrenome e cor e toca em
   "Salvar", **Then** o perfil volta ao modo de leitura com os novos dados, uma mensagem confirma
   o salvamento e a borda do avatar no cabeçalho já aparece na nova cor.
3. **Given** o modo de edição com alterações, **When** o usuário toca em "Cancelar", **Then** o
   perfil volta ao modo de leitura com os dados anteriores, sem salvar nada.
4. **Given** o seletor de cores, **When** ele é exibido, **Then** mostra exatamente as oito opções
   (amarelo, laranja, azul, ciano, rosa, vermelho, verde, roxo), cada uma com amostra e nome
   legível, e marca a cor atual de forma visível além da própria cor (ex.: ícone de seleção).
5. **Given** o modo de edição, **When** o usuário deixa o nome vazio ou ultrapassa o limite de
   caracteres e tenta salvar, **Then** o campo mostra a mensagem de erro correspondente e nada é
   salvo.
6. **Given** o modo de edição, **When** o usuário troca o email por um endereço válido e salva,
   **Then** a plataforma informa que um link de confirmação foi enviado ao novo endereço e o
   email exibido continua o antigo até a confirmação.
7. **Given** um link de confirmação recebido no novo email, **When** o usuário o abre, **Then** o
   novo email passa a ser o da conta e o login seguinte é feito com ele.
8. **Given** o modo de edição, **When** o usuário informa um email inválido ou já usado por outra
   conta, **Then** vê uma mensagem de erro clara e o email da conta não muda.

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
   rolagem horizontal, todos os botões e cores do seletor têm área de toque de no mínimo 44 × 44
   px e os campos ocupam a largura disponível em uma coluna.
2. **Given** uma tela de 1280 px, **When** o perfil é exibido, **Then** o conteúdo fica num
   bloco centralizado de largura limitada, com a foto e os dados lado a lado ou em destaque.
3. **Given** o tema escuro, **When** o perfil, o seletor de cores e o menu do avatar são exibidos,
   **Then** textos, bordas das cores e amostras mantêm contraste legível.
4. **Given** um celular, **When** o menu do avatar abre, **Then** ele fica inteiro dentro da tela.

---

### Edge Cases

- Nome ou sobrenome com acentos, apóstrofos ou hífens (ex.: "Pêpe", "D'Ávila", "Ana-Clara") são
  aceitos e exibidos corretamente; espaços no início e no fim são descartados.
- Nome muito longo no menu ou no perfil é truncado com reticências na exibição, sem quebrar o
  layout; o valor completo continua salvo.
- Se a foto salva não puder ser carregada (arquivo indisponível), o avatar mostra as iniciais em
  vez de uma imagem quebrada.
- Usuário que nunca escolheu cor vê a cor padrão (rosa) e pode trocá-la.
- Falha de conexão ao salvar mantém o modo de edição com os valores digitados e mostra uma
  mensagem de erro, sem perder o que foi preenchido.
- O usuário tenta sair do modo de edição navegando para outra página com alterações não salvas:
  a plataforma pede confirmação antes de descartá-las.
- O usuário troca o email e, antes de confirmar, troca de novo: vale apenas o último pedido.
- O usuário informa como novo email o mesmo email atual: nenhum pedido de confirmação é enviado.
- Sessão expirada enquanto o perfil está em edição: ao salvar, o usuário é levado ao login sem
  que nada seja gravado.
- Imagem muito grande em pixels, mas dentro de 2 MB, ou em formato retrato/paisagem: é exibida
  centralizada e recortada em círculo, sem distorção.

## Requirements *(mandatory)*

### Functional Requirements

**Avatar e menu da conta**

- **FR-001**: Toda página logada MUST exibir no canto direito do cabeçalho um avatar circular com
  a foto do usuário e uma borda na cor escolhida por ele.
- **FR-002**: Sem foto, ou com foto que não carrega, o avatar MUST exibir as iniciais do nome e
  sobrenome (ou a primeira letra do email, se não houver nome) sobre um fundo neutro, mantendo a
  borda colorida.
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
- **FR-010**: A página de perfil MUST exibir a foto (ou as iniciais) com a borda colorida, o nome
  e sobrenome, o email da conta e a cor escolhida, com o nome da cor em texto e uma amostra.
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
- **FR-016**: O email MUST ser validado como endereço de email; trocar o email MUST exigir a
  confirmação por um link enviado ao novo endereço, e o email da conta só muda depois dessa
  confirmação.
- **FR-017**: Ao pedir a troca de email, a plataforma MUST informar que o link foi enviado e para
  qual endereço; emails já usados por outra conta MUST ser recusados com mensagem clara.
- **FR-018**: A cor MUST ser escolhida entre exatamente oito opções: amarelo, laranja, azul,
  ciano, rosa, vermelho, verde e roxo; cada opção MUST mostrar amostra e nome, e a selecionada
  MUST ser indicada por algo além da cor (ex.: ícone de seleção).
- **FR-019**: A cor do usuário MUST ser apenas personalização: ela muda somente a borda do avatar
  (e a sua amostra no perfil) e MUST NOT alterar as cores da marca, das partes do planejamento,
  dos alertas ou de qualquer outro elemento da plataforma.
- **FR-020**: Usuários que nunca escolheram cor MUST ver a cor rosa como padrão.
- **FR-021**: O modo de edição MUST permitir escolher uma foto do dispositivo nos formatos JPG,
  PNG ou WebP com até 2 MB, mostrando uma prévia antes de salvar, e MUST permitir remover a foto
  atual.
- **FR-022**: Arquivos fora do formato ou do tamanho aceitos MUST ser recusados com mensagem que
  informe formato e tamanho aceitos.
- **FR-023**: Toda validação MUST ser feita também ao salvar no servidor, recusando dados
  inválidos mesmo que a verificação na tela seja contornada.
- **FR-024**: Ao salvar com sucesso, o perfil MUST voltar ao modo de leitura, exibir uma
  confirmação e o avatar do cabeçalho MUST refletir os novos dados sem que o usuário precise
  recarregar a página.
- **FR-025**: Em caso de falha ao salvar, a plataforma MUST manter o modo de edição com os
  valores digitados e exibir uma mensagem de erro.
- **FR-026**: Ao tentar sair da página com alterações não salvas, a plataforma MUST pedir
  confirmação antes de descartá-las.
- **FR-027**: A foto de um usuário MUST ser acessível apenas para exibição na própria conta; não
  deve ser possível listar ou alterar fotos de outros usuários.

**Apresentação**

- **FR-028**: Avatar, menu e página de perfil MUST seguir o visual da plataforma (feature 004),
  funcionar nos temas claro e escuro com contraste AA e funcionar a partir de 360 px de largura,
  sem rolagem horizontal e com alvos de toque de no mínimo 44 × 44 px.
- **FR-029**: As oito cores do avatar MUST ser tons da paleta do projeto, com contraste mínimo de
  3:1 da borda contra o fundo do cabeçalho e da página nos dois temas.

### Key Entities *(include if feature involves data)*

- **Perfil do usuário**: dados de apresentação de uma conta. Atributos: nome (obrigatório ao
  editar, até 50 caracteres), sobrenome (opcional, até 50 caracteres), foto (opcional; imagem
  JPG, PNG ou WebP de até 2 MB), cor do avatar (uma das oito opções; padrão rosa). Pertence a
  exatamente uma conta e é visível e editável apenas por ela.
- **Conta**: a conta de acesso já existente, identificada pelo email usado no login. O email é
  exibido e editado no perfil, mas continua pertencendo à conta e muda apenas após confirmação.
- **Cor do avatar**: lista fixa de oito opções nomeadas (amarelo, laranja, azul, ciano, rosa,
  vermelho, verde, roxo), cada uma com valor para tema claro e escuro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das páginas logadas, o avatar aparece no canto direito do cabeçalho e o
  botão "Sair" solto não aparece mais.
- **SC-002**: A partir de qualquer página logada, o usuário chega à página de perfil em no máximo
  2 toques (avatar → "Perfil") e sai da conta em no máximo 2 toques (avatar → "Sair").
- **SC-003**: Um usuário consegue trocar nome e cor e salvar em menos de 30 segundos.
- **SC-004**: Após salvar, a nova cor e a nova foto aparecem no cabeçalho em até 2 segundos, sem
  recarregar a página.
- **SC-005**: 100% das tentativas de salvar dados inválidos (nome vazio, nome com mais de 50
  caracteres, email inválido, cor fora da lista, foto fora do formato ou acima de 2 MB) são
  recusadas, com mensagem, tanto na tela quanto no servidor.
- **SC-006**: Nenhuma troca de email entra em vigor sem a confirmação pelo link enviado ao novo
  endereço.
- **SC-007**: Perfil, seletor de cores e menu do avatar passam em verificação de contraste AA
  nos temas claro e escuro e não têm rolagem horizontal em 360, 768 e 1280 px.
- **SC-008**: Nenhum usuário consegue ver ou alterar o perfil ou a foto de outro usuário.

## Assumptions

- **Contas existentes**: as contas atuais não têm nome, foto nem cor; até o usuário editar o
  perfil, o avatar usa a inicial do email e a cor padrão rosa. Não há cadastro de novas contas na
  plataforma, então o perfil é preenchido só pela página de perfil.
- **Troca de email**: segue o fluxo padrão de confirmação por link do provedor de autenticação já
  usado pela plataforma; o email antigo continua válido para login até a confirmação.
- **Foto**: limite de 2 MB e formatos JPG, PNG e WebP são padrões razoáveis para foto de perfil;
  não há ferramenta de recorte, a imagem é centralizada e recortada em círculo automaticamente.
- **Sem troca de senha**: alterar senha, excluir conta e outras configurações de segurança estão
  fora do escopo desta feature.
- **Cores com significado**: a constituição fixa o significado de rosa (marca), verde (Receita),
  laranja (Momento Presente), azul (Momento Futuro) e vermelho (alertas). A cor do avatar é um
  uso decorativo restrito à borda do avatar e à amostra no perfil (FR-019) e não identifica
  nenhuma parte da plataforma; o plano MUST confirmar no Constitution Check que isso não viola o
  Princípio VI ou registrar a emenda necessária. Amarelo, ciano e roxo são tons novos que
  precisam ser adicionados aos tokens do tema.
- **Menu**: o cabeçalho de páginas logadas já existe (feature 004); o avatar ocupa o lugar do
  botão "Sair" atual. A página de perfil não ganha item próprio na navegação principal; o acesso
  é pelo menu do avatar.
- **Iniciais**: até duas letras (primeira letra do nome e do sobrenome), em maiúsculas.
