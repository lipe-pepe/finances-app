import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryIcon } from "@/components/category-icon";

describe("CategoryIcon", () => {
  it("mostra o ícone com as cores da categoria", () => {
    const { container } = render(<CategoryIcon categoryName="Moradia" />);
    const icon = container.firstElementChild as HTMLElement;
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("size-10", "bg-category-housing-soft", "text-category-housing");
    expect(icon.querySelector("svg")).not.toBeNull();
  });

  it("usa o estilo de meta sem categoria", () => {
    const { container } = render(<CategoryIcon categoryName={null} />);
    expect(container.firstElementChild).toHaveClass("bg-category-none-soft", "text-category-none");
  });
});
