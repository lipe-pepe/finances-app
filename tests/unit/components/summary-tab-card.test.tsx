import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { SummaryTabCard } from "@/features/planning/components/summary-tab-card";

function renderCard(props: Partial<Parameters<typeof SummaryTabCard>[0]> = {}, selected = "income") {
  return render(
    <Tabs value={selected}>
      <TabsList>
        <SummaryTabCard
          value="present"
          part="present"
          label="Momento Presente"
          amount="R$ 3.125,25"
          summary="50% da receita · gastos R$ 2.750,00 (88%)"
          usage={88}
          alert={false}
          selected={selected === "present"}
          {...props}
        />
      </TabsList>
    </Tabs>,
  );
}

describe("SummaryTabCard", () => {
  it("é uma aba com nome curto e o resumo como descrição", () => {
    renderCard();
    const tab = screen.getByRole("tab", { name: "Momento Presente" });
    expect(tab).toHaveAccessibleDescription(
      "R$ 3.125,25 50% da receita · gastos R$ 2.750,00 (88%)",
    );
  });

  it("usa a cor da parte no ícone e na borda quando selecionada", () => {
    const { container, rerender } = renderCard({}, "income");
    const tab = screen.getByRole("tab");
    expect(tab).toHaveClass("border-border");
    expect(container.querySelector(".bg-present-soft")).not.toBeNull();

    rerender(
      <Tabs value="present">
        <TabsList>
          <SummaryTabCard
            value="present"
            part="present"
            label="Momento Presente"
            amount="R$ 3.125,25"
            summary="50% da receita · gastos R$ 2.750,00 (88%)"
            usage={88}
            alert={false}
            selected
          />
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tab")).toHaveClass("border-present");
    expect(container.querySelector('[aria-hidden="true"].bg-present')).not.toBeNull();
  });

  it("sinaliza alerta no nome, no resumo e na barra", () => {
    const { container } = renderCard({ alert: true, usage: 120 });
    expect(screen.getByRole("tab", { name: "Momento Presente, com alerta" })).toBeInTheDocument();
    expect(screen.getByText("50% da receita · gastos R$ 2.750,00 (88%)")).toHaveClass(
      "text-destructive",
    );
    expect(container.querySelector(".bg-destructive")).not.toBeNull();
  });

  it("não mostra barra de uso na Receita", () => {
    const { container } = renderCard({
      value: "income",
      part: "income",
      label: "Receita",
      amount: "R$ 6.250,50",
      summary: "2 ganhos cadastrados",
      usage: undefined,
    });
    expect(container.querySelector('[aria-hidden="true"].bg-muted')).toBeNull();
    expect(container.querySelector(".bg-income-soft")).not.toBeNull();
  });
});
