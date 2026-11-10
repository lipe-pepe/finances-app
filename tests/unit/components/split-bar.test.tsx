import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/allocation/actions", () => ({ saveAllocation: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { SplitBar } from "@/features/allocation/components/split-bar";

describe("SplitBar", () => {
  it("divide a barra entre Momento Presente e Momento Futuro na proporção do slider", () => {
    const { container } = render(
      <AllocationProvider initialEssentialPercentage={70}>
        <SplitBar />
      </AllocationProvider>,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute("aria-hidden", "true");
    const [present, future] = Array.from(bar.children) as HTMLElement[];
    expect(present).toHaveClass("bg-present");
    expect(present.style.width).toBe("70%");
    expect(future).toHaveClass("bg-future");
  });
});
