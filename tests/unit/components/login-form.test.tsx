import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn();
vi.mock("@/features/auth/actions", () => ({ signIn: (...args: unknown[]) => signIn(...args) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { LoginForm } from "@/features/auth/components/login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    signIn.mockReset();
  });

  it("mostra erros por campo sem chamar a action", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe um email válido.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("envia as credenciais e mostra a mensagem genérica quando inválidas", async () => {
    signIn.mockResolvedValue({ ok: false, error: { code: "INVALID_CREDENTIALS" } });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "ana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Email ou senha inválidos.")).toBeInTheDocument();
    expect(signIn).toHaveBeenCalledWith({ email: "ana@exemplo.com", password: "errada" });
  });

  it("desabilita o botão durante o envio", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    signIn.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "ana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled();
    resolve({ ok: false, error: { code: "INVALID_CREDENTIALS" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
  });
});
