import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/profile/actions", () => ({ updateProfile: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { updateProfile } from "@/features/profile/actions";
import { ProfileEditor } from "@/features/profile/components/profile-editor";
import { AVATAR_FILE_ERROR } from "@/lib/avatar-file";
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

const mockedUpdate = vi.mocked(updateProfile);

function sentForm(): FormData {
  return mockedUpdate.mock.calls[0][0];
}

async function openEditor(profile: ProfileView = fullProfile) {
  const user = userEvent.setup();
  render(<ProfileEditor profile={profile} />);
  await user.click(screen.getByRole("button", { name: "Editar perfil" }));
  return user;
}

describe("ProfileEditor — edição de nome (US3)", () => {
  beforeEach(() => {
    mockedUpdate.mockReset();
    mockedUpdate.mockResolvedValue({ ok: true, data: undefined });
  });

  it("mostra os campos preenchidos e o email só para leitura (FR-013/016)", async () => {
    await openEditor();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Ana");
    expect(screen.getByRole("textbox", { name: "Sobrenome" })).toHaveValue("Souza");
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByText("ana@teste.local")).toBeInTheDocument();
    expect(screen.getByText("O email não pode ser alterado.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveFocus();
  });

  it("recusa nome vazio sem chamar o servidor (FR-015)", async () => {
    const user = await openEditor();
    await user.clear(screen.getByRole("textbox", { name: "Nome" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("envia só nome e sobrenome e volta à leitura com confirmação (FR-021)", async () => {
    const user = await openEditor();
    await user.clear(screen.getByRole("textbox", { name: "Sobrenome" }));
    await user.type(screen.getByRole("textbox", { name: "Sobrenome" }), "Lima");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledTimes(1));
    const data = sentForm();
    expect(data.get("firstName")).toBe("Ana");
    expect(data.get("lastName")).toBe("Lima");
    expect(data.has("email")).toBe(false);
    expect(data.has("photo")).toBe(false);
    expect(await screen.findByRole("status")).toHaveTextContent("Perfil atualizado.");
    expect(screen.getByRole("button", { name: "Editar perfil" })).toHaveFocus();
  });

  it("mostra no campo o erro de validação do servidor", async () => {
    mockedUpdate.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { firstName: ["Use no máximo 50 caracteres."] } },
    });
    const user = await openEditor();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Use no máximo 50 caracteres.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeInTheDocument();
  });

  it("em falha de conexão mantém a edição e os valores (FR-022)", async () => {
    mockedUpdate.mockRejectedValue(new Error("rede"));
    const user = await openEditor();
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "x");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Verifique sua conexão");
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Anax");
  });

  it("Cancelar descarta as alterações (FR-014)", async () => {
    const user = await openEditor();
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "zzz");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("heading", { name: "Ana Souza" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Ana");
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("pede confirmação ao sair por um link com alterações não salvas (FR-023)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <a href="/planning">Planejamento</a>
        <ProfileEditor profile={fullProfile} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "x");
    await user.click(screen.getByRole("link", { name: "Planejamento" }));
    expect(await screen.findByRole("alertdialog", { name: "Descartar alterações?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar editando" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("Anax");
  });
});

describe("ProfileEditor — foto (US4)", () => {
  const createObjectURL = vi.fn(() => "blob:previa");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    mockedUpdate.mockReset();
    mockedUpdate.mockResolvedValue({ ok: true, data: undefined });
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const pngFile = () => new File(["png"], "eu.png", { type: "image/png" });

  it("aceita só JPG, PNG e WebP no seletor de arquivo", async () => {
    await openEditor();
    expect(screen.getByTestId("photo-input")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
    expect(screen.getByRole("button", { name: "Escolher foto" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover foto" })).not.toBeInTheDocument();
  });

  it("mostra a prévia e envia a foto ao salvar (FR-018)", async () => {
    const user = await openEditor();
    await user.upload(screen.getByTestId("photo-input"), pngFile());
    expect(createObjectURL).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remover foto" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(sentForm().get("photo")).toBeInstanceOf(File);
    expect(sentForm().has("removePhoto")).toBe(false);
  });

  it("recusa arquivo grande demais ou de outro formato sem prévia (FR-019)", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfileEditor profile={fullProfile} />);
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));

    const big = new File([new Uint8Array(3 * 1024 * 1024)], "grande.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByTestId("photo-input"), big);
    expect(screen.getByText(AVATAR_FILE_ERROR)).toBeInTheDocument();

    await user.upload(screen.getByTestId("photo-input"), new File(["gif"], "a.gif", { type: "image/gif" }));
    expect(screen.getByText(AVATAR_FILE_ERROR)).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("remove a foto atual ao salvar (US4-5)", async () => {
    const user = await openEditor({ ...fullProfile, avatarUrl: "https://exemplo.test/a.png" });
    await user.click(screen.getByRole("button", { name: "Remover foto" }));
    expect(screen.queryByRole("button", { name: "Remover foto" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(sentForm().get("removePhoto")).toBe("true");
  });

  it("Cancelar descarta a prévia e libera a URL (US4-3)", async () => {
    const user = await openEditor();
    await user.upload(screen.getByTestId("photo-input"), pngFile());
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:previa");
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("trocar só a foto também ativa o aviso de alterações não salvas", async () => {
    const user = userEvent.setup();
    render(
      <>
        <a href="/control">Controle</a>
        <ProfileEditor profile={fullProfile} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    await user.upload(screen.getByTestId("photo-input"), pngFile());
    await user.click(screen.getByRole("link", { name: "Controle" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("ProfileEditor — apresentação (US5)", () => {
  it("empilha no celular e põe a foto ao lado dos dados a partir de 720 px", () => {
    const { container } = render(<ProfileEditor profile={fullProfile} />);
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass("flex-col", "tablet:flex-row", "min-w-0");
  });

  it("trunca nome e email longos sem quebrar o layout (Edge Cases)", () => {
    render(<ProfileEditor profile={fullProfile} />);
    expect(screen.getByRole("heading", { name: "Ana Souza" })).toHaveClass("truncate");
    expect(screen.getByText("ana@teste.local")).toHaveClass("truncate");
  });

  it("os botões ocupam a largura toda no celular e têm 44 px de altura", async () => {
    await openEditor();
    for (const name of ["Salvar", "Cancelar", "Escolher foto"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toHaveClass("w-full");
      expect(button.className).toMatch(/\bh-11\b/);
    }
  });
});
