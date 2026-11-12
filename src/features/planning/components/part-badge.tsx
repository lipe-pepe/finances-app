import { cn } from "cn";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import { PART_LABELS } from "@/lib/part-labels";
import type { PresentPart } from "@/lib/present-parts";

/** Selo da parte do gasto: ponto de cor + nome, nunca só a cor (FR-012, FR-016). */
export function PartBadge({ part, className }: { part: PresentPart; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
      {PART_LABELS[part]}
    </span>
  );
}
