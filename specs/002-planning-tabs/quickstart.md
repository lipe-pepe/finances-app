# Quickstart: Momento Presente, Momento Futuro e navegação por abas

**Feature**: `002-planning-tabs`

Ambiente e setup: os mesmos da feature 001 ([README](../../README.md)). Não há migração nova.
Detalhes de endereço e componentes em [contracts/ui.md](./contracts/ui.md).

## Testes automatizados

```bash
npm run test:unit    # inclui tests/unit/specs/002-planning-tabs.spec.test.ts
npm test             # suíte completa (integração requer Supabase local)
npm run lint && npx tsc --noEmit
```

Esperado: todos passam; nenhum texto "Gastos essenciais"/"Metas futuras" restante em `src/`
(`grep -rn "Gastos essenciais\|Metas futuras\|gastos essenciais\|metas futuras" src` sem resultados).

## Validação manual (`npm run dev`, usuário logado)

1. **Abas (US1)**: em `/`, ver as abas Receita → Momento Presente → Momento Futuro com "Receita"
   selecionada; a aba Receita mostra Ganhos e Divisão da receita; as outras mostram só sua seção.
2. **Endereço (FR-006)**: abrir "Momento Futuro" → endereço `/?tab=future`; recarregar → continua
   em Momento Futuro; voltar para "Receita" → endereço `/`; abrir `/?tab=xyz` → Receita.
3. **Histórico (FR-006a)**: trocar de aba várias vezes e clicar em Voltar → sai da tela de
   planejamento (não percorre as abas).
4. **Mutações (FR-007)**: na aba Momento Presente, criar, editar e apagar um gasto → a aba não muda.
5. **Teclado (FR-008)**: focar a lista de abas com Tab e trocar com as setas.
6. **Nomes (US2)**: slider mostra "Momento Presente X%" / "Momento Futuro Y%"; títulos e totais
   usam os novos nomes; itens continuam "gasto" e "meta".
7. **Indicadores (US3)**: receita R$ 4.000,00, gastos R$ 2.100,00, slider 50% → ícone de alerta na
   aba Momento Presente, visível a partir da aba Receita; mover o slider para 55% → o ícone some;
   dentro da aba, o alerta diz "O Momento Presente excede o planejado em R$ 100,00".
8. **Celular**: no modo responsivo do navegador, as três abas ficam visíveis sem rolagem
   horizontal da página.
