import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "@/features/profile/components/user-avatar";

describe("UserAvatar", () => {
  it("mostra as iniciais quando não há foto (FR-002)", () => {
    render(<UserAvatar avatarUrl={null} initials="FP" alt="Foto de Felipe" size="sm" />);
    expect(screen.getByText("FP")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("mostra as iniciais enquanto a foto não carrega (ou se falhar)", () => {
    // jsdom não carrega imagens: o Radix mantém o fallback, como numa foto indisponível
    render(<UserAvatar avatarUrl="https://exemplo.test/foto.png" initials="AS" alt="Foto" size="lg" />);
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("usa a borda neutra do tema nos dois tamanhos (FR-001)", () => {
    const { rerender } = render(<UserAvatar avatarUrl={null} initials="A" alt="" size="sm" />);
    expect(screen.getByTestId("user-avatar")).toHaveClass("ring-avatar-ring", "size-9");
    rerender(<UserAvatar avatarUrl={null} initials="A" alt="" size="lg" />);
    expect(screen.getByTestId("user-avatar")).toHaveClass("ring-avatar-ring", "size-24");
  });
});
