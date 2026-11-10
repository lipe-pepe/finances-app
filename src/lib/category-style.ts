import {
  BookOpen,
  Car,
  CircleEllipsis,
  Heart,
  House,
  Plane,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Ícone e cor de cada categoria (FR-011). A tabela de categorias só tem o nome, então a
// associação é feita pelo nome do seed; as cores vêm dos tokens category-<key> do tema.

export type CategoryKey =
  | "food"
  | "housing"
  | "transport"
  | "health"
  | "leisure"
  | "emergency"
  | "travel"
  | "education"
  | "bills"
  | "investments"
  | "other"
  | "neutral"
  | "none";

export type CategoryStyle = { key: CategoryKey; Icon: LucideIcon };

const STYLES_BY_NAME: Record<string, CategoryStyle> = {
  Alimentação: { key: "food", Icon: Utensils },
  Moradia: { key: "housing", Icon: House },
  Transporte: { key: "transport", Icon: Car },
  Saúde: { key: "health", Icon: Heart },
  Lazer: { key: "leisure", Icon: Star },
  "Reserva de Emergência": { key: "emergency", Icon: ShieldCheck },
  Viagem: { key: "travel", Icon: Plane },
  Educação: { key: "education", Icon: BookOpen },
  "Contas e Serviços": { key: "bills", Icon: Zap },
  Investimentos: { key: "investments", Icon: TrendingUp },
  Outros: { key: "other", Icon: CircleEllipsis },
};

const NEUTRAL: CategoryStyle = { key: "neutral", Icon: CircleEllipsis };
const NO_CATEGORY: CategoryStyle = { key: "none", Icon: Target };

/** Estilo da categoria pelo nome; `null` = meta sem categoria; nome desconhecido = neutro. */
export function getCategoryStyle(categoryName: string | null): CategoryStyle {
  if (categoryName === null) return NO_CATEGORY;
  return STYLES_BY_NAME[categoryName] ?? NEUTRAL;
}
