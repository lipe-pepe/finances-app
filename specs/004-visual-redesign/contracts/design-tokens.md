# Contract: Tokens do tema

**Feature**: `004-visual-redesign`

Fonte única: `src/app/globals.css` (`:root` = claro; `@media (prefers-color-scheme: dark)` =
escuro). Nomes = CSS variables; no Tailwind viram `bg-<nome>`, `text-<nome>`, `border-<nome>`
etc. Valores hex conforme `docs/design/redesign/README.md`.

## Base (nomes do shadcn/ui, remapeados)

| Token | Claro | Escuro |
|---|---|---|
| `background` | `#FAFAF8` | `#131315` |
| `foreground` | `#1C1B19` | `#ECEBE7` |
| `card`, `popover` | `#FFFFFF` | `#1B1B1F` |
| `card-foreground`, `popover-foreground` | `#1C1B19` | `#ECEBE7` |
| `muted` (trilho, fundos neutros) | `#EEECE6` | `#2E2E34` |
| `muted-foreground` | `#5F5C55` | `#A7A49C` |
| `border`, `input` | `#E4E2DC` | `#2E2E34` |
| `primary` (marca rosa) | `#DB2777` | `#F472B6` |
| `primary-foreground` | `#FFFFFF` | `#2A0B19` |
| `secondary`, `accent` | `#F0EEE9` | `#26262B` |
| `secondary-foreground`, `accent-foreground` | `#1C1B19` | `#ECEBE7` |
| `destructive` (alerta) | `#B42318` | `#F97066` |
| `ring` | `#DB2777` | `#F472B6` |

## Novos

| Token | Claro | Escuro |
|---|---|---|
| `brand-soft` | `#FDE8F1` | `#3B1A2C` |
| `brand-ink` | `#BE185D` | `#F9A8D4` |
| `danger-soft` | `#FDECEA` | `#3A1D1B` |
| `chart-limit` | `#4338CA` | `#A5B4FC` |
| `income` / `-foreground` | `#15803D` / `#FFFFFF` | `#4ADE80` / `#052E16` |
| `income-soft` / `-ink` | `#DCFCE7` / `#166534` | `#14301F` / `#86EFAC` |
| `present` / `-foreground` | `#EE6A10` / `#1C1B19` | `#FB923C` / `#2A1205` |
| `present-soft` / `-ink` | `#FFEDD5` / `#C2410C` | `#3A2412` / `#FDBA74` |
| `future` / `-foreground` | `#1D4ED8` / `#FFFFFF` | `#60A5FA` / `#0B1B33` |
| `future-soft` / `-ink` | `#DBEAFE` / `#1E40AF` | `#172544` / `#93C5FD` |
| `section`, `section-foreground`, `section-soft`, `section-ink` | apontam para `income*`, `present*` ou `future*` conforme `[data-section]` | idem |

## Categorias (`category-<key>` = traço, `category-<key>-soft` = fundo)

| key | Claro (fundo / traço) | Escuro (fundo / traço) |
|---|---|---|
| `food` | `#FFEDD5` / `#C2410C` | `#3A2412` / `#FDBA74` |
| `housing` | `#EDE9FE` / `#6D28D9` | `#2A2145` / `#C4B5FD` |
| `transport` | `#DBEAFE` / `#1D4ED8` | `#172544` / `#93C5FD` |
| `health` | `#DCFCE7` / `#15803D` | `#14301F` / `#86EFAC` |
| `leisure` | `#FCE7F3` / `#BE185D` | `#3B1A2C` / `#F9A8D4` |
| `emergency` | `#CCFBF1` / `#0F766E` | `#0F302C` / `#5EEAD4` |
| `travel` | `#E0F2FE` / `#0369A1` | `#0C2A3D` / `#7DD3FC` |
| `education` | `#FEF3C7` / `#B45309` | `#3A2A0A` / `#FCD34D` |
| `bills` | `#FEF9C3` / `#A16207` | `#3A3208` / `#FDE047` |
| `investments` | `#D1FAE5` / `#047857` | `#0B2E22` / `#6EE7B7` |
| `other`, `neutral`, `none` | `#F0EEE9` / `#5F5C55` | `#26262B` / `#A7A49C` |

## Outros

- Fonte: `--font-sans` = DM Sans (400/500/600/700); valores com `tabular-nums`.
- Raio: `--radius: 0.75rem`.
- Breakpoint: `--breakpoint-tablet: 45rem` (720 px).

## Pares de contraste verificados por teste (ambos os temas)

≥ 4,5:1 — `foreground`/`background`, `foreground`/`card`, `muted-foreground`/`card`,
`muted-foreground`/`background`, `primary-foreground`/`primary`, `income-foreground`/`income`,
`present-foreground`/`present`, `future-foreground`/`future`, `income-ink`/`card`,
`present-ink`/`card`, `future-ink`/`card`, `brand-ink`/`card`, `destructive`/`card`,
`destructive`/`danger-soft`.

≥ 3:1 — `primary`/`background`, `income`/`card`, `present`/`card`, `future`/`card`,
`chart-limit`/`card`, `destructive`/`background`, cada `category-<key>`/`category-<key>-soft`.
