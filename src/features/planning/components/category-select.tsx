"use client";
// Client Component: o seletor de categoria (Radix Select) é interativo e é controlado pelo
// React Hook Form via Controller.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryOption } from "@/features/planning/queries";

type CategorySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  categories: CategoryOption[];
  /** Quando informado, adiciona uma opção "sem categoria" com este valor */
  emptyOption?: { value: string; label: string };
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
};

export function CategorySelect({
  id,
  value,
  onChange,
  onBlur,
  categories,
  emptyOption,
  invalid,
  describedBy,
  disabled,
}: CategorySelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      onOpenChange={(open) => !open && onBlur?.()}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="w-full"
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {emptyOption && <SelectItem value={emptyOption.value}>{emptyOption.label}</SelectItem>}
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
