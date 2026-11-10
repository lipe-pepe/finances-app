import { cn } from "cn";
import { getCategoryStyle, type CategoryKey } from "@/lib/category-style";

// Classes completas por categoria, para o Tailwind encontrá-las no código (cores = tokens)
const COLOR_CLASSES: Record<CategoryKey, string> = {
  food: "bg-category-food-soft text-category-food",
  housing: "bg-category-housing-soft text-category-housing",
  transport: "bg-category-transport-soft text-category-transport",
  health: "bg-category-health-soft text-category-health",
  leisure: "bg-category-leisure-soft text-category-leisure",
  emergency: "bg-category-emergency-soft text-category-emergency",
  travel: "bg-category-travel-soft text-category-travel",
  education: "bg-category-education-soft text-category-education",
  bills: "bg-category-bills-soft text-category-bills",
  investments: "bg-category-investments-soft text-category-investments",
  other: "bg-category-other-soft text-category-other",
  neutral: "bg-category-neutral-soft text-category-neutral",
  none: "bg-category-none-soft text-category-none",
};

type CategoryIconProps = {
  /** Nome da categoria; `null` para meta sem categoria */
  categoryName: string | null;
  className?: string;
};

/** Ícone decorativo da categoria, em quadrado arredondado com a cor da categoria. */
export function CategoryIcon({ categoryName, className }: CategoryIconProps) {
  const { key, Icon } = getCategoryStyle(categoryName);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        COLOR_CLASSES[key],
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2} />
    </span>
  );
}
