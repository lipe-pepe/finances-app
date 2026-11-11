"use server";

import { revalidatePath } from "next/cache";
import { fieldError, ok, validationError, type ActionResult } from "@/lib/action-result";
import { AVATAR_FILE_ERROR, AVATAR_MAX_BYTES, detectAvatarType, type AvatarType } from "@/lib/avatar-file";
import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/server-action";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { removeAvatar, uploadAvatar } from "@/features/profile/avatar-storage";
import { profileSchema } from "@/features/profile/schemas";

/** Lê um campo de texto do FormData (ausente → string vazia). */
function textField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Salva nome, sobrenome e foto do usuário autenticado (specs/005-user-profile/contracts/
 * server-actions.md). Lê apenas `firstName`, `lastName`, `photo` e `removePhoto`: o email nunca
 * é lido nem gravado (FR-016/017). Ordem das operações e falhas parciais: research.md R5.
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    const parsed = profileSchema.safeParse({
      firstName: textField(formData, "firstName"),
      lastName: textField(formData, "lastName"),
    });
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Foto nova: validada pelo tamanho e pelos bytes antes de qualquer gravação (FR-019/020)
    const photo = formData.get("photo");
    let newPhoto: { bytes: Uint8Array; type: AvatarType } | null = null;
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > AVATAR_MAX_BYTES) {
        return fieldError("photo", AVATAR_FILE_ERROR);
      }
      const bytes = new Uint8Array(await photo.arrayBuffer());
      const type = detectAvatarType(bytes);
      if (!type) {
        return fieldError("photo", AVATAR_FILE_ERROR);
      }
      newPhoto = { bytes, type };
    }
    // Foto nova e remoção juntas: a foto nova prevalece
    const removePhoto = !newPhoto && textField(formData, "removePhoto") === "true";

    const supabase = await createSupabaseServerClient();
    const current = await prisma.profile.findUnique({
      where: { userId },
      select: { avatarPath: true },
    });
    const previousPath = current?.avatarPath ?? null;

    const uploadedPath = newPhoto
      ? await uploadAvatar(supabase, userId, newPhoto.bytes, newPhoto.type)
      : null;
    const avatarPath = uploadedPath ?? (removePhoto ? null : previousPath);

    try {
      await prisma.profile.upsert({
        where: { userId },
        create: { userId, ...parsed.data, avatarPath },
        update: { ...parsed.data, avatarPath },
      });
    } catch (error) {
      // O banco nunca aponta para um arquivo inexistente: desfaz o upload e devolve UNKNOWN
      if (uploadedPath) {
        await removeAvatar(supabase, uploadedPath);
      }
      throw error;
    }

    // A foto anterior só é apagada depois que o banco já aponta para a nova (ou para nenhuma)
    if (previousPath && previousPath !== avatarPath) {
      await removeAvatar(supabase, previousPath);
    }

    // O cabeçalho de todas as páginas mostra o perfil: revalida o layout inteiro (FR-021)
    revalidatePath("/", "layout");
    return ok();
  });
}
