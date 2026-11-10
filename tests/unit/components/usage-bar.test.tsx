import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsageBar } from "@/components/usage-bar";

function fill(container: HTMLElement): HTMLElement {
  return container.firstElementChild!.firstElementChild as HTMLElement;
}

describe("UsageBar", () => {
  it("mostra o preenchimento proporcional sobre o trilho", () => {
    const { container } = render(<UsageBar value={50} tone="brand" />);
    const track = container.firstElementChild as HTMLElement;
    expect(track).toHaveAttribute("aria-hidden", "true");
    expect(track).toHaveClass("bg-muted");
    expect(fill(container)).toHaveClass("bg-primary");
    expect(fill(container).style.width).toBe("50%");
  });

  it("limita o preenchimento a 100%", () => {
    const { container } = render(<UsageBar value={150} tone="brand" />);
    expect(fill(container).style.width).toBe("100%");
  });

  it.each([
    ["danger", "bg-destructive"],
    ["section", "bg-section"],
    ["income", "bg-income"],
    ["present", "bg-present"],
    ["future", "bg-future"],
  ] as const)("usa a cor do tom %s", (tone, className) => {
    const { container } = render(<UsageBar value={10} tone={tone} />);
    expect(fill(container)).toHaveClass(className);
  });
});
