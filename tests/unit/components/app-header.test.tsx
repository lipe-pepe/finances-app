import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions", () => ({ signOut: vi.fn() }));

import { AppHeader } from "@/features/planning/components/app-header";

describe("AppHeader", () => {
  it("mostra os botões das duas partes com o Controle como página atual", () => {
    render(<AppHeader current="control" />);
    const nav = screen.getByRole("navigation", { name: "Seções" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Planejamento", "Controle"]);

    const planning = within(nav).getByRole("link", { name: "Planejamento" });
    const control = within(nav).getByRole("link", { name: "Controle" });
    expect(planning).toHaveAttribute("href", "/planning");
    expect(control).toHaveAttribute("href", "/control");
    expect(control).toHaveAttribute("aria-current", "page");
    expect(planning).not.toHaveAttribute("aria-current");
  });

  it("destaca o Planejamento quando ele é a página atual", () => {
    render(<AppHeader current="planning" />);
    expect(screen.getByRole("link", { name: "Planejamento" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Controle" })).not.toHaveAttribute("aria-current");
  });

  it("mantém o título e o botão Sair", () => {
    render(<AppHeader current="control" />);
    expect(screen.getByRole("heading", { name: "Finanças Pessoais" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });
});
