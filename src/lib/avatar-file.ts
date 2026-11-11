// Regras da foto do perfil (FR-018/019): formatos, tamanho e detecção do tipo pelos bytes.
// Funções puras, usadas no navegador (aviso imediato) e no servidor (validação definitiva).

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AvatarType = (typeof AVATAR_TYPES)[number];

/** Valor do atributo `accept` do campo de arquivo. */
export const AVATAR_ACCEPT = AVATAR_TYPES.join(",");

export const AVATAR_FILE_ERROR = "Use uma imagem JPG, PNG ou WebP de até 2 MB.";

const EXTENSIONS: Record<AvatarType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

const ascii = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

/**
 * Tipo real da imagem pela assinatura do arquivo; null se não for JPG, PNG ou WebP.
 * Não confia na extensão nem no tipo informado pelo navegador.
 */
export function detectAvatarType(bytes: Uint8Array): AvatarType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "image/webp";
  return null;
}

/** Extensão do arquivo gravado, derivada do tipo detectado. */
export function extensionFor(type: AvatarType): string {
  return EXTENSIONS[type];
}

/** Validação rápida no navegador (tipo informado e tamanho); null quando o arquivo serve. */
export function checkAvatarFile(file: { size: number; type: string }): string | null {
  const validType = (AVATAR_TYPES as readonly string[]).includes(file.type);
  if (!validType || file.size <= 0 || file.size > AVATAR_MAX_BYTES) {
    return AVATAR_FILE_ERROR;
  }
  return null;
}
