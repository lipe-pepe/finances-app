import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import { GENERIC_ERROR_MESSAGE } from "@/lib/handle-action-result";

describe("DeleteConfirmDialog", () => {
  it("só chama a action após a confirmação", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true, data: undefined });
    render(<DeleteConfirmDialog itemName="Aluguel" action={action} />);
    await userEvent.click(screen.getByRole("button", { name: "Apagar Aluguel" }));
    expect(await screen.findByText('Apagar "Aluguel"?')).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Apagar" }));
    expect(action).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Apagar "Aluguel"?')).not.toBeInTheDocument());
  });

  it("cancelar não chama a action", async () => {
    const action = vi.fn();
    render(<DeleteConfirmDialog itemName="Aluguel" action={action} />);
    await userEvent.click(screen.getByRole("button", { name: "Apagar Aluguel" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    expect(action).not.toHaveBeenCalled();
  });

  it("mantém o diálogo aberto com aviso quando a exclusão falha", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, error: { code: "UNKNOWN" } });
    render(<DeleteConfirmDialog itemName="Aluguel" action={action} />);
    await userEvent.click(screen.getByRole("button", { name: "Apagar Aluguel" }));
    await userEvent.click(await screen.findByRole("button", { name: "Apagar" }));
    expect(await screen.findByText(GENERIC_ERROR_MESSAGE)).toBeInTheDocument();
  });
});
