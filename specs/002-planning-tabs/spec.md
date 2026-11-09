# Feature Specification: Momento Presente, Momento Futuro e navegação por abas

**Feature Branch**: `002-planning-tabs`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Mudanças de nomenclatura. Os gastos essenciais devem mudar de nome e
passar a se chamar 'Momento Presente'. As metas futuras devem mudar de nome e passar a se chamar
'Momento Futuro'. Cada uma dessas seções sai da tela principal e vai para uma aba de um Tabs. Assim,
ficamos com um Tabs com três abas: 'Receita', 'Momento Presente' e 'Momento Futuro'. A divisão da
receita continua na aba da Receita."

**Depends on**: `specs/001-financial-planning` (altera a apresentação definida nessa feature; as
regras de cálculo, persistência e privacidade permanecem as mesmas)

## Clarifications

### Session 2026-11-09

- Q: Os itens das seções também mudam de nome, ou só as seções? → A: Só as seções mudam; os
  itens continuam "gasto" e "meta".
- Q: O alerta de uma seção deve ser sinalizado fora da aba dela? → A: Sim, com um indicador de
  alerta no nome da aba com problema, visível de qualquer aba.
- Q: A aba selecionada deve ficar registrada no endereço da página, para que recarregar, usar
  Voltar/Avançar ou abrir um link mantenha a mesma aba? → A: Sim; sem aba no endereço, a tela
  abre em "Receita".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar pelo planejamento em abas (Priority: P1)

Ao entrar, o usuário vê a tela de planejamento organizada em três abas: "Receita", "Momento
Presente" e "Momento Futuro". A aba "Receita" reúne os ganhos, a receita total e a divisão da
receita (slider). As outras duas abas reúnem, cada uma, sua seção. O usuário troca de aba sem sair
da tela e sem perder o que já está salvo.

**Why this priority**: é a mudança estrutural da feature; sem ela as seções continuam empilhadas
na tela principal.

**Independent Test**: logado, verificar as três abas, abrir cada uma e confirmar que mostram
apenas o conteúdo esperado; cadastrar um item em uma aba e confirmar que a tela continua nessa aba.

**Acceptance Scenarios**:

1. **Given** um usuário logado, **When** ele abre a tela de planejamento, **Then** vê três abas na
   ordem "Receita", "Momento Presente" e "Momento Futuro", com a aba "Receita" selecionada.
7. **Given** o usuário na aba "Momento Futuro", **When** ele recarrega a página, **Then** a tela
   volta já na aba "Momento Futuro".
8. **Given** um link da tela de planejamento que indica a aba "Momento Presente", **When** o
   usuário logado o abre, **Then** a tela abre diretamente nessa aba.
2. **Given** a aba "Receita" selecionada, **When** o usuário olha o conteúdo, **Then** vê a lista
   de ganhos, a receita total e o slider de divisão da receita, e não vê as listas de gastos nem
   de metas.
3. **Given** a tela de planejamento, **When** o usuário seleciona "Momento Presente", **Then** vê
   apenas a seção Momento Presente (valor planejado, cadastro, lista e soma).
4. **Given** a tela de planejamento, **When** o usuário seleciona "Momento Futuro", **Then** vê
   apenas a seção Momento Futuro (valor planejado, cadastro, lista e soma).
5. **Given** o usuário na aba "Momento Presente", **When** ele cria, edita ou apaga um item,
   **Then** a soma é atualizada e a aba "Momento Presente" continua selecionada.
6. **Given** o usuário em qualquer aba, **When** ele usa o teclado (Tab e setas), **Then**
   consegue focar a lista de abas e trocar de aba sem usar o mouse.

---

### User Story 2 - Novos nomes das seções (Priority: P1)

Em toda a interface, "Gastos essenciais" passa a se chamar "Momento Presente" e "Metas futuras"
passa a se chamar "Momento Futuro": títulos, rótulos do slider, valores planejados, totais e
alertas.

**Why this priority**: é o pedido central da feature; nomes antigos remanescentes deixariam a
interface inconsistente.

**Independent Test**: percorrer as três abas e o slider e verificar que os termos "Gastos
essenciais" e "Metas futuras" não aparecem em nenhum texto da tela.

**Acceptance Scenarios**:

1. **Given** a aba "Receita", **When** o usuário move o slider para 70%, **Then** os rótulos
   mostram "Momento Presente 70%" e "Momento Futuro 30%".
2. **Given** a aba "Momento Presente", **When** ela é exibida, **Then** o título é "Momento
   Presente" e o total aparece como "Total do Momento Presente".
3. **Given** a aba "Momento Futuro", **When** ela é exibida, **Then** o título é "Momento Futuro" e
   o total aparece como "Total do Momento Futuro".
4. **Given** a soma do Momento Presente acima do planejado, **When** a aba é exibida, **Then** o
   alerta diz "Planejamento incorreto" e "O Momento Presente excede o planejado em R$ X".
5. **Given** a soma do Momento Futuro acima do planejado, **When** a aba é exibida, **Then** o
   alerta diz "Planejamento incorreto" e "O Momento Futuro excede o planejado em R$ X".
6. **Given** qualquer tela da plataforma, **When** o usuário procura os termos "Gastos essenciais"
   ou "Metas futuras", **Then** não os encontra.
7. **Given** as abas "Momento Presente" e "Momento Futuro", **When** o usuário cadastra itens,
   **Then** os itens continuam chamados de "gasto" e "meta" (ex.: "Nome do gasto", "Adicionar
   gasto", "Nome da meta", "Adicionar meta", "Nenhum gasto cadastrado").

---

### User Story 3 - Saber que há alerta em outra aba (Priority: P2)

Como as seções agora ficam em abas separadas, o usuário pode não ver um alerta de planejamento
excedido que está em uma aba não selecionada. Por isso, a aba de uma seção acima do planejado
exibe um indicador de alerta no próprio nome, visível de qualquer aba.

**Why this priority**: evita que o usuário ajuste o slider na aba "Receita" sem perceber que
deixou outra seção acima do planejado; depende das Histórias 1 e 2.

**Independent Test**: com a aba "Receita" selecionada, mover o slider até que o Momento Presente
fique acima do planejado e verificar que a aba "Momento Presente" passa a exibir o indicador de
alerta; voltar o slider e verificar que o indicador some.

**Acceptance Scenarios**:

1. **Given** o Momento Presente acima do planejado, **When** o usuário abre a aba "Momento
   Presente", **Then** vê o alerta de planejamento incorreto no topo da seção.
2. **Given** a aba "Receita" selecionada, **When** o usuário move o slider e o Momento Presente ou
   o Momento Futuro passa a exceder o planejado (ou deixa de exceder), **Then** o indicador de
   alerta no nome da aba correspondente aparece ou desaparece imediatamente, sem recarregar a
   página.
3. **Given** uma aba com indicador de alerta, **When** um leitor de tela anuncia essa aba,
   **Then** ela é identificada como tendo planejamento excedido (ex.: "Momento Presente, com
   alerta"), não apenas por cor.
4. **Given** a soma de uma seção igual ao planejado, **When** a tela é exibida, **Then** a aba
   dessa seção não mostra indicador.

---

### Edge Cases

- Recarregar a página: a tela abre na aba indicada no endereço; sem indicação, em "Receita".
- Endereço com aba inexistente ou inválida: a tela abre em "Receita", sem erro.
- Usuário deslogado que abre um link com aba: vai para o login e, após entrar, cai na tela de
  planejamento em "Receita" (preservar a aba após o login não faz parte desta feature).
- Salvar, editar ou apagar um item em uma aba: a aba selecionada não muda.
- Mover o slider na aba "Receita" e depois abrir outra aba: os valores planejados e alertas dessa
  aba já refletem a nova divisão, mesmo antes de o salvamento terminar.
- Formulário com dados não salvos ao trocar de aba: o conteúdo digitado e não salvo pode ser
  descartado; somente o que foi salvo é garantido.
- Telas estreitas (celular): as três abas continuam visíveis e selecionáveis, sem rolagem
  horizontal da página.
- Seções vazias: cada aba mostra seu estado vazio ("Nenhum ... cadastrado") normalmente.

## Requirements *(mandatory)*

### Functional Requirements

**Navegação por abas**

- **FR-001**: A tela de planejamento MUST organizar o conteúdo em três abas, nesta ordem:
  "Receita", "Momento Presente" e "Momento Futuro".
- **FR-002**: A aba "Receita" MUST conter a seção de ganhos (cadastro, lista e receita total) e a
  divisão da receita (slider com os valores planejados de cada momento).
- **FR-003**: A aba "Momento Presente" MUST conter a seção antes chamada "Gastos essenciais", com
  todo o seu comportamento atual (valor planejado, cadastro, edição, exclusão, lista, soma e
  alerta).
- **FR-004**: A aba "Momento Futuro" MUST conter a seção antes chamada "Metas futuras", com todo o
  seu comportamento atual.
- **FR-005**: Apenas o conteúdo da aba selecionada MUST ser exibido; as seções de Momento Presente
  e Momento Futuro MUST NOT aparecer fora de suas abas.
- **FR-006**: A aba selecionada MUST ficar registrada no endereço da página, com os valores
  `receita`, `momento-presente` e `momento-futuro`; ao abrir ou recarregar a tela, a aba indicada
  no endereço MUST estar selecionada, e sem indicação (ou com valor inválido) MUST ser "Receita".
- **FR-006a**: Trocar de aba MUST atualizar o endereço sem recarregar a página e sem criar uma
  nova entrada no histórico do navegador para cada troca (Voltar sai da tela de planejamento em
  vez de percorrer as abas).
- **FR-007**: Criar, editar ou apagar itens, ou mover o slider, MUST NOT mudar a aba selecionada.
- **FR-008**: As abas MUST ser operáveis por teclado e identificadas como abas para tecnologias
  assistivas.

**Nomenclatura**

- **FR-009**: Todo texto da interface que hoje diz "Gastos essenciais" MUST passar a dizer
  "Momento Presente", e todo texto que diz "Metas futuras" MUST passar a dizer "Momento Futuro",
  incluindo títulos, rótulos do slider, valores planejados, totais e alertas.
- **FR-010**: Os rótulos do slider MUST ser "Momento Presente X%" e "Momento Futuro Y%", com
  X + Y = 100.
- **FR-011**: Os totais MUST ser exibidos como "Total do Momento Presente" e "Total do Momento
  Futuro".
- **FR-011a**: Os itens das seções MUST continuar sendo chamados de "gasto" (Momento Presente) e
  "meta" (Momento Futuro) nos rótulos, botões e estados vazios.
- **FR-012**: Os alertas MUST informar "Planejamento incorreto" e "O Momento Presente excede o
  planejado em R$ X" ou "O Momento Futuro excede o planejado em R$ X".

**Alertas entre abas**

- **FR-013**: O alerta de cada seção MUST continuar aparecendo no topo da respectiva aba quando a
  soma exceder estritamente o valor planejado, e MUST reagir em tempo real ao slider e às
  alterações de itens.
- **FR-014**: Quando a soma de uma seção exceder estritamente o valor planejado, o nome da aba
  dessa seção MUST exibir um indicador de alerta visível de qualquer aba, independentemente da
  aba selecionada.
- **FR-014a**: O indicador MUST aparecer e desaparecer em tempo real com o slider e com as
  alterações de itens, seguindo a mesma regra do alerta da seção.
- **FR-014b**: O indicador MUST ter texto alternativo acessível (não depender apenas de cor).

**Comportamento preservado**

- **FR-015**: Regras de cálculo, validações, persistência, salvamento automático do slider,
  privacidade entre usuários e login/logout definidos em `specs/001-financial-planning` MUST
  permanecer inalterados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das telas verificadas, os termos "Gastos essenciais" e "Metas futuras" não
  aparecem.
- **SC-002**: O usuário chega a qualquer seção com no máximo 1 clique ou toque a partir da tela de
  planejamento.
- **SC-003**: A troca de aba exibe o conteúdo em menos de 0,5 segundo, sem recarregar a página.
- **SC-004**: 100% das ações de criar, editar ou apagar itens mantêm o usuário na aba em que
  estava.
- **SC-004a**: O indicador de alerta nas abas corresponde ao alerta da seção em 100% dos casos
  verificados, inclusive durante o movimento do slider.
- **SC-005**: Todos os cenários de aceitação da feature 001 (exceto os que dependem dos nomes
  antigos ou da exibição simultânea das seções) continuam passando após a mudança.

## Assumptions

- A mudança é apenas de apresentação: os dados já cadastrados (ganhos, gastos, metas e divisão)
  continuam os mesmos e não precisam de migração.
- "Receita" é o nome da aba que reúne ganhos e divisão; o título interno da seção de ganhos
  continua "Ganhos" e o total continua "Receita total".
- A aba fica apenas no endereço da página: não é lembrada entre visitas que abrem a tela sem
  indicação de aba (nesse caso, abre em "Receita").
- O cabeçalho com o título e o botão "Sair" permanece fora das abas, sempre visível.
- Categorias, valores e regras de alerta (estritamente maior que o planejado) não mudam.
