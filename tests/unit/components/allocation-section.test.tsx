import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/allocation/actions", () => ({ saveAllocation: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSection } from "@/features/allocation/components/allocation-section";

describe("AllocationSection (feature 007, US1)", () => {
  it("tem um único slider e nenhum cartão de valor abaixo dele (FR-001, FR-003)", () => {
    render(
      <AllocationProvider initialEssentialPercentage={70}>
        <AllocationSection revenueCents={600000} />
      </AllocationProvider>,
    );
    expect(screen.getByRole("heading", { name: "Divisão da receita" })).toBeInTheDocument();
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(screen.queryByText(/Momento Presente: R\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Momento Futuro: R\$/)).not.toBeInTheDocument();
    expect(screen.queryAllByTestId(/^planned-/)).toHaveLength(0);
    expect(screen.getByTestId("slider-value-expenses")).toHaveTextContent("R$ 4.200,00");
  });
});
