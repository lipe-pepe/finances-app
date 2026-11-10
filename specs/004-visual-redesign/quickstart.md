# Quickstart: Redesign visual da plataforma

**Feature**: `004-visual-redesign`

Setup: o mesmo das features anteriores ([README](../../README.md)); **sem migração**. Depois de
atualizar: `npm install` (componente `sheet`, se adicionar dependências).

Referência para comparar: `docs/design/redesign/README.md` e o canvas
(https://claude.ai/artifact/9CDXzFGVkqbMdR34A3ByUQ). Contratos: [ui.md](./contracts/ui.md) e
[design-tokens.md](./contracts/design-tokens.md).

## Testes automatizados

```bash
npm run test:unit   # inclui tests/unit/design/{contrast,tokens}.test.ts e o teste da spec 004
npm run lint && npx tsc --noEmit && npm run build
```

Esperado: todos passam (o teste de tokens falha se houver cor ou tamanho escrito à mão nos
componentes; o de contraste, se algum par ficar abaixo de AA).

## Validação manual (`npm run dev`, usuário logado)

Use as ferramentas do navegador: modo responsivo (360 e 1280 px) e, em Rendering, "Emulate CSS
media feature prefers-color-scheme" (light/dark).

1. **Identidade (US1)**: em claro e escuro, Login, Controle e Planejamento usam DM Sans, fundo
   neutro, logo e menu rosa com a página atual sublinhada; nada ilegível no escuro.
2. **Login (US1)**: senha errada → "Email ou senha inválidos." em destaque de erro.
3. **Controle (US2)**: "Disponível" em destaque; barra e "Gasto / Planejado / Usado %";
   selecionar uma categoria acima do limite → número vermelho, "Acima do limite em R$ X", barra
   vermelha e percentual > 100%; gráfico com área rosa e "Limite" tracejado; lista com ícones
   por categoria; formulário na coluna à direita com "Somente dias de <mês>".
4. **Planejamento (US3)**: título grande; três cards (verde, laranja, azul) com a Receita
   selecionada; trocar de card → borda/ícone e botões na cor da parte, endereço `?tab=`; mover o
   slider até o Momento Presente exceder → card com alerta e barra vermelha; leitor de tela
   anuncia "Momento Presente, com alerta"; na Receita, "Divisão da receita" antes de "Ganhos",
   com a barra laranja/azul acompanhando o slider; Tab + setas trocam de card.
5. **Celular (US4)** em 360 px: nenhuma tela rola na horizontal; cabeçalho quebra em linhas;
   cards empilhados; no Controle, botão "+ Registrar gasto" fixo no rodapé → painel com foco;
   fechar pelo X, tocando fora e com Esc (foco volta ao botão); registrar um gasto → painel fecha
   e gasto aparece; "Editar" um gasto → painel "Editar gasto" preenchido; no Planejamento,
   formulários continuam em linha e "Editar" abre na linha.
6. **Troca de largura**: com o painel aberto, alargar para > 720 px → painel fecha e o formulário
   volta para a coluna à direita.
7. **Preservado**: cadastros, edições, exclusões, alertas, cálculos e mensagens das features
   001–003 continuam funcionando igual.
