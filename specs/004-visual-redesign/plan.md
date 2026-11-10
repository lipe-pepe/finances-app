# Implementation Plan: Redesign visual da plataforma

**Branch**: `004-visual-redesign` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-visual-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Aplicar o design aprovado (`docs/design/redesign/`) a Login, Controle e Planejamento: tokens de
tema em um único arquivo com temas claro/escuro pela preferência do dispositivo, fonte DM Sans,
rosa como marca, cor fixa por parte do planejamento, novos layouts (Controle com "Disponível" em
destaque e formulário à direita; Planejamento com cards de resumo como abas), ícones por
categoria e telas responsivas com botão fixo + painel de registro no Controle abaixo de 720 px.

Abordagem: remapear os tokens do shadcn/ui em `src/app/globals.css` (hex, R1) e trocar o modo
escuro para media query (R3); componentes passam a usar só tokens semânticos; cor da aba ativa
por `data-section` (R4); breakpoint `tablet` = 720 px resolvido em CSS, com um hook cliente só
para comportamento (R5); painel com o `sheet` do shadcn/ui (R6); mapa de ícones puro (R7);
gráfico de área (R8); dois testes que verificam contraste e ausência de cores escritas à mão
(R9). Sem mudanças em banco, Server Actions ou regras. Detalhes em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 22+ (inalterado)

**Primary Dependencies**: as das features 001–003; novo componente shadcn/ui `sheet` (Radix
Dialog, já no pacote `radix-ui`); fonte DM Sans via `next/font/google`; ícones `lucide-react`
(já instalado)

**Storage**: sem alterações (nenhuma migração)

**Testing**: Vitest + Testing Library (unitários); testes de design (contraste e tokens);
integração inalterada (nenhum endpoint novo ou alterado)

**Target Platform**: navegadores modernos, desktop e celular (a partir de 360 px)

**Project Type**: aplicação web Next.js (mesmo projeto)

**Performance Goals**: sem regressão; nenhuma ida ao servidor nova; troca de tema instantânea
(media query)

**Constraints**: Princípio VI (tokens, claro/escuro, AA, 360 px, cores fixas); SSR primeiro;
layout correto já no HTML do servidor para qualquer largura

**Scale/Scope**: 3 páginas, ~20 componentes restilizados, ~6 componentes novos, 1 arquivo de
tokens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Idioma no código | Tokens, componentes e chaves em inglês (`income`, `present`, `future`, `category-food`, `CategoryIcon`, `UsageBar`); comentários em português; textos de UI em pt-BR | ✅ Pass |
| II. Testes (não negociável) | Unitários para cada funcionalidade nova (`category-style`, `getUsedPercentage`, `incomeCountLabel`, `contrastRatio`, `CategoryIcon`, `UsageBar`, `SplitBar`, cards de resumo, painel de registro/edição) + testes de design (contraste e tokens) + teste da spec 004; testes existentes ajustados. Nenhum endpoint novo/alterado: integração das features 001–003 segue válida | ✅ Pass |
| III. SSR primeiro | Páginas, cabeçalho, listas, `CategoryIcon` e `UsageBar` no servidor. Client Components novos justificados: `ActualExpenseSheetProvider`/`ui/sheet` (diálogo), `SplitBar` (acompanha o slider), `useIsNarrow` (comportamento por largura). Layout por largura resolvido em CSS | ✅ Pass |
| IV. React Hook Form | Formulários reaproveitados; o painel usa o mesmo `ActualExpenseForm` com validação no servidor | ✅ Pass |
| V. Supabase, Prisma e Auth | Sem mudanças de schema, consultas ou autenticação (a contagem de ganhos usa `incomes.length`) | ✅ Pass |
| VI. Design system, temas e acessibilidade | Tokens únicos em `globals.css`; claro/escuro por `prefers-color-scheme`; pares AA verificados por teste; cores fixas (rosa marca/Controle, verde, laranja, azul, vermelho); 360 px e alvos de 44 px; teste que proíbe cores escritas à mão | ✅ Pass (ver divergência abaixo) |
| Commits | Commits por tarefa no padrão `tipo(escopo): descrição [T###]` na branch `004-visual-redesign` | ✅ Pass |

**Divergência intencional da referência (Princípio VI)**: o laranja do Momento Presente no tema
claro passa de `#F97316` para `#EE6A10`. O valor aprovado tem 2,8:1 sobre branco (abaixo dos
3:1 exigidos para elementos gráficos); `#EE6A10` tem 3,1:1 sobre o branco, 3,0:1 sobre o fundo
e 5,5:1 com o texto escuro dos botões, e é visualmente quase igual. Os demais valores da
referência passam no AA nos dois temas.

**Re-check pós-design (Phase 1)**: ✅ Pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-visual-redesign/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── design-tokens.md
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                         # ALTERADO: tokens hex, dark por media query, tokens novos, data-section, breakpoint tablet
│   ├── layout.tsx                          # ALTERADO: DM Sans
│   ├── login/page.tsx                      # ALTERADO: novo layout
│   ├── control/page.tsx                    # ALTERADO: duas colunas, provider do painel
│   └── planning/page.tsx                   # ALTERADO: título, ordem Divisão → Ganhos, contagem de ganhos
├── components/
│   ├── ui/sheet.tsx                        # NOVO (shadcn/ui)
│   ├── ui/button.tsx                       # ALTERADO: variante `section`
│   ├── category-icon.tsx                   # NOVO
│   └── usage-bar.tsx                       # NOVO
├── hooks/use-is-narrow.ts                  # NOVO
├── lib/
│   ├── category-style.ts                   # NOVO: nome → key + ícone
│   ├── contrast.ts                         # NOVO: contraste WCAG
│   ├── spending.ts                         # ALTERADO: getUsedPercentage, getUsageBarPercentage
│   ├── planning-labels.ts                  # ALTERADO: incomeCountLabel, frase do Planejamento
│   └── control-labels.ts                   # ALTERADO: "Usado", "+ Registrar gasto", "Editar gasto", dica de data
└── features/
    ├── planning/components/
    │   ├── app-header.tsx                  # ALTERADO
    │   ├── planning-tabs.tsx               # ALTERADO: cards de resumo, data-section
    │   ├── summary-tab-card.tsx            # NOVO
    │   └── tab-alert-indicator.tsx, over-budget-alert.tsx, section-total.tsx, delete-confirm-dialog.tsx  # restilizados
    ├── allocation/components/              # restilizados; split-bar.tsx NOVO
    ├── incomes|expenses|goals/components/  # restilizados; listas com CategoryIcon; forms em linha
    ├── control/components/
    │   ├── spending-summary.tsx            # ALTERADO: destaque, UsageBar, Usado %
    │   ├── spending-chart.tsx              # ALTERADO: área
    │   ├── actual-expense-list.tsx         # ALTERADO: CategoryIcon, edição por painel no celular
    │   ├── actual-expense-form.tsx         # ALTERADO: onSuccess, modo controlado, dica de data
    │   ├── actual-expense-sheet.tsx        # NOVO: provider + botão fixo + painel
    │   └── control-dashboard.tsx           # ALTERADO: layout
    └── auth/components/login-form.tsx      # restilizado

tests/unit/
├── design/{contrast,tokens}.test.ts                                   # NOVOS
├── lib/{category-style,contrast}.test.ts                              # NOVOS
├── lib/{spending,planning-labels}.test.ts                             # ALTERADOS
├── components/{category-icon,usage-bar,split-bar,summary-tab-card,actual-expense-sheet}.test.tsx  # NOVOS
├── components/{planning-tabs,spending-summary,spending-chart,actual-expense-list,app-header,…}.test.tsx  # ALTERADOS
└── specs/004-visual-redesign.spec.test.ts                             # NOVO
```

**Structure Decision**: mantém a organização por domínio. Peças visuais usadas por mais de uma
página (`CategoryIcon`, `UsageBar`) ficam em `src/components`; regras puras em `src/lib`.

## Complexity Tracking

Nenhuma violação da constituição; a única divergência da referência visual (laranja) está
justificada acima.
