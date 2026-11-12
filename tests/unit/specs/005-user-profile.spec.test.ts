import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { profileSchema } from "@/features/profile/schemas";
import { PROFILE_PATH } from "@/lib/app-routes";
import { resolveAuthRedirect } from "@/lib/auth-redirect";
import {
  AVATAR_FILE_ERROR,
  AVATAR_MAX_BYTES,
  checkAvatarFile,
  detectAvatarType,
} from "@/lib/avatar-file";
import { contrastRatio } from "@/lib/contrast";
import { getDisplayName, getInitials } from "@/lib/initials";

// Teste unitário rastreável à spec specs/005-user-profile/spec.md (Princípio II).

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");
const lightBlock = css.slice(css.indexOf("\n:root {"));
const darkBlock = css.slice(css.indexOf("\n@media (prefers-color-scheme: dark) {"));

function token(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i").exec(block);
  if (!match) throw new Error(`Token ${name} ausente`);
  return match[1];
}

describe("Spec 005 — US1: avatar no cabeçalho", () => {
  it("FR-002: sem foto, o avatar mostra as iniciais do nome ou a inicial do email", () => {
    expect(getInitials({ firstName: "Felipe", lastName: "Pêpe", email: "f@x.com" })).toBe("FP");
    expect(getInitials({ firstName: null, lastName: null, email: "maria@x.com" })).toBe("M");
  });

  it("FR-026: a borda neutra do avatar tem contraste ≥ 3:1 nos dois temas", () => {
    for (const block of [lightBlock, darkBlock]) {
      expect(contrastRatio(token(block, "avatar-ring"), token(block, "background"))).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(token(block, "avatar-ring"), token(block, "card"))).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("Spec 005 — US2: ver o perfil", () => {
  it("FR-009: a página de perfil existe e exige login", () => {
    expect(PROFILE_PATH).toBe("/profile");
    expect(resolveAuthRedirect(PROFILE_PATH, false)).toBe("/login");
    expect(resolveAuthRedirect(PROFILE_PATH, true)).toBeNull();
  });

  it("US2-2: sem nome, o perfil é identificado pelo email", () => {
    expect(getDisplayName({ firstName: null, lastName: null, email: "novo@x.com" })).toBe("novo@x.com");
  });
});

describe("Spec 005 — US3: editar nome e sobrenome", () => {
  it("FR-015: nome obrigatório e até 50 caracteres; sobrenome opcional", () => {
    expect(profileSchema.safeParse({ firstName: "", lastName: "" }).success).toBe(false);
    expect(profileSchema.safeParse({ firstName: "a".repeat(51), lastName: "" }).success).toBe(false);
    expect(profileSchema.parse({ firstName: "Ana", lastName: "" })).toEqual({
      firstName: "Ana",
      lastName: null,
    });
  });

  it("FR-016/017: o email não faz parte dos dados salvos", () => {
    const data = profileSchema.parse({ firstName: "Ana", lastName: "", email: "outro@x.com" });
    expect(Object.keys(data).sort()).toEqual(["firstName", "lastName"]);
  });
});

describe("Spec 005 — US4: foto", () => {
  it("FR-018/019, SC-005: aceita JPG, PNG e WebP até 2 MB e recusa o resto", () => {
    expect(checkAvatarFile({ size: AVATAR_MAX_BYTES, type: "image/webp" })).toBeNull();
    expect(checkAvatarFile({ size: AVATAR_MAX_BYTES + 1, type: "image/jpeg" })).toBe(AVATAR_FILE_ERROR);
    expect(checkAvatarFile({ size: 10, type: "image/gif" })).toBe(AVATAR_FILE_ERROR);
  });

  it("FR-020: no servidor, o tipo é verificado pelos bytes e não pela extensão", () => {
    expect(detectAvatarType(new TextEncoder().encode("não sou uma imagem"))).toBeNull();
    expect(detectAvatarType(Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]))).toBe("image/jpeg");
  });
});
