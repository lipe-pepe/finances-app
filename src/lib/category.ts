import "server-only";
import { prisma } from "@/lib/prisma";

/** Verifica se a categoria existe na lista global cadastrada pelo administrador. */
export async function categoryExists(categoryId: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  return category !== null;
}

export const MISSING_CATEGORY_MESSAGE = "Categoria inexistente.";
