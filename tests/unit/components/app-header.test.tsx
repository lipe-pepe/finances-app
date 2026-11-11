import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUserId: vi.fn(async () => "user-1") }));
vi.mock("@/features/profile/queries", () => ({
  getProfile: vi.fn(async () => ({
    firstName: "Ana",
    lastName: "Souza",
    email: "ana@teste.local",
    avatarUrl: null,
    initials: "AS",
    displayName: "Ana Souza",
  })),
}));

import { AppHeader } from "@/features/planning/components/app-header";

describe("AppHeader", () => {
  it("mostra os botões das duas partes com o Controle como página atual", async () => {
    render(await AppHeader({ current: "control" }));
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

  it("destaca o Planejamento quando ele é a página atual", async () => {
    render(await AppHeader({ current: "planning" }));
    expect(screen.getByRole("link", { name: "Planejamento" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Controle" })).not.toHaveAttribute("aria-current");
  });

  it("mantém o título e troca o botão Sair pelo avatar da conta (FR-001/006)", async () => {
    render(await AppHeader({ current: "control" }));
    expect(screen.getByRole("heading", { name: "Finanças Pessoais" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu da conta de Ana Souza" })).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("não destaca nenhuma seção quando não há página atual (perfil)", async () => {
    render(await AppHeader({}));
    const nav = screen.getByRole("navigation", { name: "Seções" });
    for (const link of within(nav).getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("mostra o logo da marca e sublinha a página atual", async () => {
    const { container } = render(await AppHeader({ current: "control" }));
    expect(container.querySelector('[aria-hidden="true"].bg-primary')).not.toBeNull();
    expect(screen.getByRole("link", { name: "Controle" })).toHaveClass("border-primary");
    expect(screen.getByRole("link", { name: "Planejamento" })).toHaveClass("border-transparent");
  });
});
