# Redesign visual — referência aprovada

Design aprovado em 2026-11-09 no canvas do Claude Design (privado):
https://claude.ai/artifact/9CDXzFGVkqbMdR34A3ByUQ

Esta pasta guarda uma **cópia fixa** das telas aprovadas, para que a spec, o plano e os testes
da feature de redesign apontem para uma versão que não muda. O canvas continua sendo a referência
viva para explorar ideias novas.

Os arquivos em [`screens/`](screens/) são protótipos no formato `.dc.html` do canvas: servem
como referência visual e de estrutura e **não** são código para copiar (dependem do runtime do
canvas). Os dados neles são fictícios.

| Arquivo | Tela |
|---|---|
| `ControlPink.dc.html` | Controle (desktop e celular; abaixo de 720 px usa o botão fixo e o painel) |
| `Planning.dc.html` | Planejamento, com as três abas (prop `tab`: `receita`, `presente`, `futuro`) |
| `Login.dc.html` | Login (prop `showError` mostra o erro de credenciais) |
| `*Mobile*.dc.html`, `PlanningPresent/Future.dc.html` | As mesmas telas em 390 px ou abertas em outra aba |

## Identidade

- **Fonte**: DM Sans (400, 500, 600, 700). Valores monetários com `tabular-nums`.
- **Fundo neutro**: as páginas não têm fundos coloridos; cards e formulários são superfícies
  brancas (ou escuras) com borda fina.
- **Rosa = marca**: logo, menu Planejamento/Controle (sublinhado da página atual) e toda a
  página Controle.
- **Cor por parte do planejamento** (cards de resumo, botões, slider e barras da aba aberta):
  Receita verde, Momento Presente laranja, Momento Futuro azul.
- **Vermelho = alerta** (planejamento excedido, acima do limite), sempre com ícone e texto.
- **Temas claro e escuro**, com contraste AA para texto (4,5:1) e componentes (3:1).

## Cores (tokens)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| fundo | `#FAFAF8` | `#131315` | Página |
| superfície | `#FFFFFF` | `#1B1B1F` | Cards, formulários, campos |
| borda | `#E4E2DC` | `#2E2E34` | Bordas e divisórias |
| trilho | `#EEECE6` | `#2E2E34` | Fundo de barras de uso |
| texto | `#1C1B19` | `#ECEBE7` | Texto principal |
| texto secundário | `#5F5C55` | `#A7A49C` | Rótulos, datas, categorias |
| marca (rosa) | `#DB2777` / texto `#FFFFFF` | `#F472B6` / texto `#2A0B19` | Logo, menu, Controle |
| marca suave | `#FDE8F1` | `#3B1A2C` | Área do gráfico |
| Receita (verde) | `#15803D` / texto `#FFFFFF` | `#4ADE80` / texto `#052E16` | Aba Receita |
| Momento Presente (laranja) | `#F97316` / texto `#1C1B19` | `#FB923C` / texto `#2A1205` | Aba Momento Presente |
| Momento Futuro (azul) | `#1D4ED8` / texto `#FFFFFF` | `#60A5FA` / texto `#0B1B33` | Aba Momento Futuro |
| alerta | `#B42318`, fundo `#FDECEA` | `#F97066`, fundo `#3A1D1B` | Excedido, acima do limite |
| linha de limite | `#4338CA` | `#A5B4FC` | Gráfico do Controle (tracejada) |

Cada cor das partes tem também um tom suave (fundo do ícone) e um tom de texto sobre branco:
verde `#DCFCE7`/`#166534`, laranja `#FFEDD5`/`#C2410C`, azul `#DBEAFE`/`#1E40AF` (no escuro:
`#14301F`/`#86EFAC`, `#3A2412`/`#FDBA74`, `#172544`/`#93C5FD`). O laranja vivo leva **texto
escuro** nos botões (branco não passa no contraste).

## Ícones por categoria

Ícones de traço (estilo Lucide), em quadrado arredondado de 40 px com fundo suave e traço na cor
da categoria:

| Categoria | Ícone | Fundo / traço (claro) |
|---|---|---|
| Alimentação | talheres | `#FFEDD5` / `#C2410C` |
| Moradia | casa | `#EDE9FE` / `#6D28D9` |
| Transporte | carro | `#DBEAFE` / `#1D4ED8` |
| Saúde | coração | `#DCFCE7` / `#15803D` |
| Lazer | estrela | `#FCE7F3` / `#BE185D` |
| Reserva de Emergência | escudo | `#CCFBF1` / `#0F766E` |
| Viagem | avião de papel | `#E0F2FE` / `#0369A1` |
| Educação | livro | `#FEF3C7` / `#B45309` |
| Sem categoria (metas) | alvo | cinza neutro |

Ainda sem ícone definido: **Contas e Serviços**, **Investimentos** e **Outros**. Os ganhos usam
um ícone de carteira na cor da marca.

## Layout por página

**Controle** (rosa)
- Cabeçalho neutro; mês atual em texto discreto e seleção de categoria ("Todos" padrão).
- **Disponível** em número grande (40–64 px, fluido); abaixo, barra de uso e "Gasto",
  "Planejado" e "Usado %"; acima do limite: número em vermelho + "Acima do limite em R$ X".
- Gráfico do gasto acumulado com área preenchida e linha "Limite" tracejada.
- Lista "Gastos do mês" com ícone por categoria, nome, data e categoria (só em "Todos"), valor,
  Editar e Apagar.
- **Desktop**: formulário "Registrar gasto" num card na coluna da direita (com a dica "Somente
  dias de <mês>").
- **Celular (< 720 px)**: botão fixo no rodapé "+ Registrar gasto", que abre o formulário num
  painel que sobe de baixo (diálogo; fecha no X, tocando fora ou com Esc).

**Planejamento** (cor por parte)
- Título grande "Planejamento" e uma frase de apoio.
- As abas são **três cards de resumo clicáveis** (papel de aba): Receita (total e quantidade de
  ganhos), Momento Presente e Momento Futuro (planejado, % da receita, total e % usado, barra de
  uso, ícone de alerta quando excede). O card selecionado tem borda e ícone preenchido na cor da
  parte.
- Conteúdo em uma coluna (até 880 px). Receita: divisão da receita (rótulos com bolinha de cor,
  barra laranja/azul na proporção e slider) e ganhos. Momentos: alerta "Planejamento incorreto",
  formulário em linha acima da lista, lista com ícones e total no fim.

**Login**: card central com logo, email, senha e "Entrar"; mensagem de erro em vermelho.

**Celular (todas)**: topo quebra em linhas; cards de resumo empilhados; formulários em uma ou
duas colunas; alvos de toque ≥ 44 px; nada rola na horizontal.

## O que é informação nova na tela

O redesign não muda regras de cálculo, dados nem validações, mas passa a **mostrar**:

- percentual "Usado" (gasto ÷ planejado) e barras de uso no Controle e nos cards do Planejamento;
- quantidade de ganhos no card da Receita;
- a dica "Somente dias de <mês>" no campo de data do Controle.
