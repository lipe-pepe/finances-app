import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions", () => ({ signOut: vi.fn() }));

import { AccountMenu } from "@/features/profile/components/account-menu";

const profile = {
  avatarUrl: null,
  initials: "AS",
  displayName: "Ana Souza",
  email: "ana@teste.local",
};

describe("AccountMenu", () => {
  it("tem nome acessível com o nome do usuário (FR-008)", () => {
    render(<AccountMenu profile={profile} />);
    expect(screen.getByRole("button", { name: "Menu da conta de Ana Souza" })).toBeInTheDocument();
  });

  it("abre com nome, email, Perfil e Sair, nessa ordem (FR-003/004/005)", async () => {
    const user = userEvent.setup();
    render(<AccountMenu profile={profile} />);
    await user.click(screen.getByRole("button", { name: "Menu da conta de Ana Souza" }));

    const menu = await screen.findByRole("menu");
    expect(menu).toHaveTextContent("Ana Souza");
    expect(menu).toHaveTextContent("ana@teste.local");
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Perfil", "Sair"]);
    expect(items[0]).toHaveAttribute("href", "/profile");
    expect(items[1].closest("form")).not.toBeNull();
    expect(items[1]).toHaveAttribute("type", "submit");
  });

  it("fecha com Esc e devolve o foco ao avatar (FR-007)", async () => {
    const user = userEvent.setup();
    render(<AccountMenu profile={profile} />);
    const trigger = screen.getByRole("button", { name: "Menu da conta de Ana Souza" });
    await user.click(trigger);
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("abre pelo teclado (Enter)", async () => {
    const user = userEvent.setup();
    render(<AccountMenu profile={profile} />);
    const trigger = screen.getByRole("button", { name: "Menu da conta de Ana Souza" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("tem alvo de toque de 44 px e menu alinhado à direita com largura limitada (US5)", async () => {
    const user = userEvent.setup();
    render(<AccountMenu profile={profile} />);
    const trigger = screen.getByRole("button", { name: "Menu da conta de Ana Souza" });
    expect(trigger).toHaveClass("size-11");
    await user.click(trigger);
    expect(await screen.findByRole("menu")).toHaveClass("max-w-xs");
    for (const item of screen.getAllByRole("menuitem")) {
      expect(item).toHaveClass("min-h-11");
    }
  });
});
