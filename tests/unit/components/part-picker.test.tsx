import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { PartPicker } from "@/features/planning/components/part-picker";
import type { PresentPart } from "@/lib/present-parts";

let latest: PresentPart | undefined;

function Harness({ error }: { error?: string }) {
  const { register, watch } = useForm<{ part: PresentPart }>({ defaultValues: { part: "essentials" } });
  latest = watch("part");
  return (
    <form>
      <PartPicker registration={register("part")} error={error} />
    </form>
  );
}

describe("PartPicker", () => {
  it("mostra as três partes em ordem, com Gastos Essenciais marcado", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Parte" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.closest("label")?.textContent)).toEqual([
      "Gastos Essenciais",
      "Educação",
      "Livre",
    ]);
    expect(screen.getByRole("radio", { name: "Gastos Essenciais" })).toBeChecked();
  });

  it("muda o valor do formulário ao clicar ou com as setas", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: "Educação" }));
    expect(latest).toBe("education");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Livre" })).toBeChecked();
    expect(latest).toBe("free");
  });

  it("mostra o erro e tem alvo de toque de 44 px", () => {
    render(<Harness error="Selecione a parte." />);
    expect(screen.getByText("Selecione a parte.")).toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.closest("label")).toHaveClass("min-h-11");
    }
  });
});
