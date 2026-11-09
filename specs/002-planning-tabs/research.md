# Research: Momento Presente, Momento Futuro e navegação por abas

**Feature**: `002-planning-tabs` | **Date**: 2026-11-09

A stack e a arquitetura vêm da feature 001 (ver `specs/001-financial-planning/research.md`).
Esta pesquisa cobre apenas as decisões novas.

## R1. Componente de abas

- **Decision**: shadcn/ui `tabs` (Radix Tabs), adicionado com `npx shadcn@4.23.0 add tabs`, usado em
  modo **controlado** (`value` + `onValueChange`) dentro de um Client Component `PlanningTabs`.
- **Rationale**: o Radix Tabs já implementa os papéis ARIA (`tablist`, `tab`, `tabpanel`),
  navegação por setas e foco (FR-008); mantém o mesmo kit de UI da feature 001.
- **Comportamento relevante**: o Radix desmonta o conteúdo das abas inativas. Isso descarta dados
  digitados e não salvos ao trocar de aba, o que a spec aceita (Edge Cases). O estado do slider não
  é afetado, porque fica no `AllocationProvider`, acima das abas.
- **Alternatives considered**: abas como rotas separadas (`/present`, `/future`) — contraria a
  "tela única" da feature 001 e recarregaria dados a cada troca; abas próprias sem Radix — exigiria
  reimplementar a acessibilidade.

## R2. Aba no endereço (FR-006, FR-006a)

- **Decision**: parâmetro de busca `tab` com os valores em inglês `income` (Receita), `present`
  (Momento Presente) e `future` (Momento Futuro), ex.: `/?tab=future`.
  - **Servidor**: `src/app/page.tsx` lê `searchParams` (Promise no Next.js 16) e converte com a
    função pura `parsePlanningTab(value)` → valor válido ou `income` (padrão para ausente,
    inválido ou repetido).
  - **Cliente**: `PlanningTabs` guarda a aba em estado local (valor inicial vindo do servidor) e,
    em `onValueChange`, chama `window.history.replaceState` com o novo `?tab=`. A aba `income`
    remove o parâmetro (endereço limpo `/`).
- **Rationale**: a renderização inicial no servidor já sai com a aba certa (Princípio III, sem
  "piscar" a aba Receita); `replaceState` não recarrega a página, não cria entrada no histórico
  (FR-006a) e, segundo a documentação do Next.js 16, integra-se ao roteador.
- **Alternatives considered**: `router.replace` / `<Link>` — dispara nova renderização no servidor
  a cada troca de aba (lento, contraria SC-003); `pushState` — criaria uma entrada no histórico por
  troca, rejeitado na clarificação; valores em português — violaria o Princípio I (rotas em
  inglês).

## R3. Manter a aba após mutações (FR-007)

- **Decision**: nenhuma mudança nas Server Actions. Após `revalidatePath('/')`, o Next.js
  re-renderiza o Server Component, mas o Client Component `PlanningTabs` continua montado e
  preserva o estado; além disso, o endereço já contém `?tab=`, então o valor inicial do servidor
  coincide com a aba atual.
- **Alternatives considered**: guardar a aba em cookie ou no banco — desnecessário (a spec só exige
  o endereço).

## R4. Indicador de alerta nas abas (FR-014, FR-014a, FR-014b)

- **Decision**: Client Component `TabAlertIndicator` com props `{ section, revenueCents,
  totalCents }`, que reutiliza as funções puras de `src/lib/planning.ts` e a porcentagem do
  `useAllocation()`. Renderiza um ícone (`TriangleAlert`, cor de destaque) com
  `aria-hidden="true"` e um texto `sr-only` ", com alerta" dentro do gatilho da aba, de modo que o
  nome acessível da aba seja "Momento Presente, com alerta".
- **Refatoração**: extrair de `OverBudgetAlert` um hook `useOverBudget(section, revenueCents,
  totalCents)` em `src/features/planning/hooks/use-over-budget.ts`, usado pelo alerta da seção e
  pelo indicador — a mesma regra garante que os dois concordem sempre (SC-004a).
- **Alternatives considered**: calcular no servidor — não reagiria ao slider em tempo real
  (FR-014a).

## R5. Centralização dos nomes da interface

- **Decision**: novo módulo `src/lib/planning-labels.ts` com os textos das seções:
  `SECTION_LABELS = { expenses: "Momento Presente", goals: "Momento Futuro" }` e os textos
  derivados (totais e frases de alerta) e `TAB_LABELS` (`income`: "Receita", `present`: "Momento
  Presente", `future`: "Momento Futuro"). Slider, valores planejados, seções, alertas e abas usam
  esse módulo.
- **Rationale**: uma única fonte para os novos nomes (FR-009) evita resquícios de "Gastos
  essenciais"/"Metas futuras" e facilita futuras mudanças.
- **Identificadores de código**: os domínios continuam `expenses` e `goals` (tabelas, rotas de
  dados, pastas e Server Actions), pois os itens continuam sendo "gastos" e "metas" (FR-011a) e a
  mudança é só de apresentação. Os valores da aba no endereço (`present`/`future`) são um
  vocabulário de navegação, independente dos domínios.
- **Alternatives considered**: renomear domínios para `present`/`future` — exigiria migração de
  banco e reescrita das actions sem ganho para o usuário.

## R6. Testes (Princípio II)

- **Decision**:
  - Unitários novos: `parsePlanningTab` e helpers de endereço; `planning-labels`; `PlanningTabs`
    (troca de aba, `replaceState`, teclado, aba inicial); `TabAlertIndicator` (aparece/some com o
    slider, texto acessível); `useOverBudget` coberto via componentes.
  - Unitários atualizados: `allocation-slider.test.tsx` e `over-budget-alert.test.tsx` (novos
    textos).
  - Teste da spec: `tests/unit/specs/002-planning-tabs.spec.test.ts` (rastreável aos cenários).
  - Integração: **nenhum endpoint novo ou alterado** — as Server Actions da feature 001 não mudam,
    então seus testes de integração continuam valendo.
- **Nota**: async Server Components (a página) não são testáveis no Vitest; a lógica da página fica
  em funções puras testadas (`parsePlanningTab`) e a validação ponta a ponta fica no quickstart.
