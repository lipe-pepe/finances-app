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
} from "lucide-react";
import { describe, expect, it } from "vitest";
import { getCategoryStyle } from "@/lib/category-style";

describe("getCategoryStyle", () => {
  it.each([
    ["Alimentação", "food", Utensils],
    ["Moradia", "housing", House],
    ["Transporte", "transport", Car],
    ["Saúde", "health", Heart],
    ["Lazer", "leisure", Star],
    ["Reserva de Emergência", "emergency", ShieldCheck],
    ["Viagem", "travel", Plane],
    ["Educação", "education", BookOpen],
    ["Contas e Serviços", "bills", Zap],
    ["Investimentos", "investments", TrendingUp],
    ["Outros", "other", CircleEllipsis],
  ])("associa %s ao estilo %s", (name, key, Icon) => {
    expect(getCategoryStyle(name)).toEqual({ key, Icon });
  });

  it("usa o estilo neutro para categoria desconhecida", () => {
    expect(getCategoryStyle("Pets")).toEqual({ key: "neutral", Icon: CircleEllipsis });
  });

  it("usa o alvo para meta sem categoria", () => {
    expect(getCategoryStyle(null)).toEqual({ key: "none", Icon: Target });
  });
});
