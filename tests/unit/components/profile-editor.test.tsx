import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/profile/actions", () => ({ updateProfile: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { ProfileEditor } from "@/features/profile/components/profile-editor";
import type { ProfileView } from "@/features/profile/queries";

const fullProfile: ProfileView = {
  firstName: "Ana",
  lastName: "Souza",
  email: "ana@teste.local",
  avatarUrl: null,
  initials: "AS",
  displayName: "Ana Souza",
};

const emptyProfile: ProfileView = {
  firstName: null,
  lastName: null,
  email: "novo@teste.local",
  avatarUrl: null,
  initials: "N",
  displayName: "novo@teste.local",
};

describe("ProfileEditor — leitura (US2)", () => {
  it("mostra nome, sobrenome, email e o botão de edição (FR-010)", () => {
    render(<ProfileEditor profile={fullProfile} />);
    expect(screen.getByRole("heading", { name: "Ana Souza" })).toBeInTheDocument();
    expect(screen.getByText("Nome").nextElementSibling).toHaveTextContent("Ana");
    expect(screen.getByText("Sobrenome").nextElementSibling).toHaveTextContent("Souza");
    expect(screen.getByText("Email").nextElementSibling).toHaveTextContent("ana@teste.local");
    expect(screen.getByRole("button", { name: "Editar perfil" })).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("indica dados não informados e convida a completar (FR-011, US2-2)", () => {
    render(<ProfileEditor profile={emptyProfile} />);
    expect(screen.getByRole("heading", { name: "Nome não informado" })).toBeInTheDocument();
    expect(screen.getByText("Complete seu perfil adicionando seu nome.")).toBeInTheDocument();
    expect(screen.getByText("Sobrenome").nextElementSibling).toHaveTextContent("Não informado");
    expect(screen.getByText("novo@teste.local")).toBeInTheDocument();
  });
});
