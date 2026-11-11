import { describe, expect, it } from "vitest";
import {
  AVATAR_ACCEPT,
  AVATAR_FILE_ERROR,
  AVATAR_MAX_BYTES,
  checkAvatarFile,
  detectAvatarType,
  extensionFor,
} from "@/lib/avatar-file";

const ascii = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

describe("avatar-file", () => {
  it("define os limites aceitos", () => {
    expect(AVATAR_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(AVATAR_ACCEPT).toBe("image/jpeg,image/png,image/webp");
    expect(AVATAR_FILE_ERROR).toBe("Use uma imagem JPG, PNG ou WebP de até 2 MB.");
  });

  it("detecta o tipo pelos primeiros bytes", () => {
    expect(detectAvatarType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(
      detectAvatarType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])),
    ).toBe("image/png");
    expect(
      detectAvatarType(new Uint8Array([...ascii("RIFF"), 1, 2, 3, 4, ...ascii("WEBP"), 0])),
    ).toBe("image/webp");
  });

  it("recusa o que não é JPG, PNG ou WebP", () => {
    expect(detectAvatarType(new Uint8Array(ascii("GIF89a")))).toBeNull();
    expect(detectAvatarType(new Uint8Array(ascii("hello")))).toBeNull();
    expect(detectAvatarType(new Uint8Array([]))).toBeNull();
    expect(detectAvatarType(new Uint8Array([...ascii("RIFF"), 1, 2, 3, 4, ...ascii("WAVE")]))).toBeNull();
  });

  it("deriva a extensão do tipo", () => {
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/png")).toBe("png");
    expect(extensionFor("image/webp")).toBe("webp");
  });

  it("valida tamanho e tipo no cliente", () => {
    expect(checkAvatarFile({ size: AVATAR_MAX_BYTES, type: "image/png" })).toBeNull();
    expect(checkAvatarFile({ size: AVATAR_MAX_BYTES + 1, type: "image/png" })).toBe(
      AVATAR_FILE_ERROR,
    );
    expect(checkAvatarFile({ size: 1000, type: "image/gif" })).toBe(AVATAR_FILE_ERROR);
    expect(checkAvatarFile({ size: 0, type: "image/png" })).toBe(AVATAR_FILE_ERROR);
  });
});
