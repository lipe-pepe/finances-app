import { describe, expect, it } from "vitest";
import {
  FIELD_LABELS,
  NAME_NOT_SET,
  PROFILE_SAVED,
  accountMenuLabel,
  avatarAlt,
} from "@/features/profile/labels";

describe("labels do perfil", () => {
  it("monta o nome acessível do menu da conta (FR-008)", () => {
    expect(accountMenuLabel("Ana Souza")).toBe("Menu da conta de Ana Souza");
  });

  it("monta o texto alternativo da foto", () => {
    expect(avatarAlt("Ana")).toBe("Foto de Ana");
  });

  it("tem os rótulos e mensagens da spec", () => {
    expect(FIELD_LABELS).toEqual({ firstName: "Nome", lastName: "Sobrenome", email: "Email" });
    expect(NAME_NOT_SET).toBe("Nome não informado");
    expect(PROFILE_SAVED).toBe("Perfil atualizado.");
  });
});
