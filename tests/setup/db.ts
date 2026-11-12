import { createClient } from "@supabase/supabase-js";
import { toDbDate } from "@/lib/calendar";
import { centsToDecimalString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { PresentPart } from "@/lib/present-parts";
import { RedirectError, resetCookies } from "./mocks";

// Helpers do banco de teste: usuários A e B no Supabase Auth local e limpeza das tabelas

export const TEST_PASSWORD = "senha-de-teste-123";

export const TEST_USERS = {
  a: "usuario.a@teste.local",
  b: "usuario.b@teste.local",
} as const;

export type TestUsers = { userA: string; userB: string };

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function ensureUser(email: string): Promise<string> {
  const admin = createAdminClient();
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((user) => user.email === email);
  if (existing) return existing.id;

  // A Admin API funciona mesmo com o cadastro público desativado (enable_signup = false)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

/** Cria (ou reaproveita) os usuários de teste A e B. */
export async function createTestUsers(): Promise<TestUsers> {
  return { userA: await ensureUser(TEST_USERS.a), userB: await ensureUser(TEST_USERS.b) };
}

/** Limpa os dados de usuário, mantendo as categorias do seed. */
export async function resetDatabase(): Promise<void> {
  await emptyAvatarsBucket();
  await prisma.$transaction([
    prisma.profile.deleteMany(),
    prisma.actualExpense.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.income.deleteMany(),
    prisma.allocation.deleteMany(),
  ]);
}

/** Retorna uma categoria do seed (falha se o seed não foi aplicado). */
export async function getAnyCategory(name = "Moradia"): Promise<{ id: string; name: string }> {
  const category = await prisma.category.findUnique({ where: { name } });
  if (!category) {
    throw new Error("Categorias não encontradas. Rode `npm run db:seed:test`.");
  }
  return category;
}

/** Grava um gasto realizado direto no banco (preparação dos testes do Controle). */
export async function createActualExpenseRow(
  userId: string,
  row: {
    name: string;
    amountCents: number;
    categoryId: string;
    spentOn: string;
    part?: PresentPart;
  },
): Promise<{ id: string }> {
  return prisma.actualExpense.create({
    data: {
      userId,
      name: row.name,
      amount: centsToDecimalString(row.amountCents),
      categoryId: row.categoryId,
      spentOn: toDbDate(row.spentOn),
      part: row.part ?? "essentials",
    },
    select: { id: true },
  });
}

/** Grava um gasto planejado direto no banco (feature 006: `part` opcional, padrão essentials). */
export async function createExpenseRow(
  userId: string,
  row: { name: string; amountCents: number; categoryId: string; part?: PresentPart },
): Promise<{ id: string }> {
  return prisma.expense.create({
    data: {
      userId,
      name: row.name,
      amount: centsToDecimalString(row.amountCents),
      categoryId: row.categoryId,
      ...(row.part ? { part: row.part } : {}),
    },
    select: { id: true },
  });
}

/** Grava a divisão da receita e das partes do Momento Presente (feature 006). */
export async function setAllocation(
  userId: string,
  row: { essentialPercentage: number; educationPercentage?: number; freePercentage?: number },
): Promise<void> {
  const data = {
    essentialPercentage: row.essentialPercentage,
    educationPercentage: row.educationPercentage ?? 0,
    freePercentage: row.freePercentage ?? 0,
  };
  await prisma.allocation.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

// ---------------------------------------------------------------------------------------------
// Perfil (feature 005)
// ---------------------------------------------------------------------------------------------

const AVATARS_BUCKET = "avatars";

/** Apaga todos os objetos do bucket de fotos (pastas dos usuários de teste), via cliente admin. */
export async function emptyAvatarsBucket(): Promise<void> {
  const storage = createAdminClient().storage.from(AVATARS_BUCKET);
  const { data: folders } = await storage.list("", { limit: 1000 });
  for (const folder of folders ?? []) {
    const { data: files } = await storage.list(folder.name, { limit: 1000 });
    const paths = (files ?? []).map((file) => `${folder.name}/${file.name}`);
    if (paths.length > 0) {
      await storage.remove(paths);
    }
  }
}

/** Lista os nomes dos objetos na pasta de um usuário (via cliente admin). */
export async function listAvatarObjects(userId: string): Promise<string[]> {
  const { data } = await createAdminClient().storage.from(AVATARS_BUCKET).list(userId);
  return (data ?? []).map((file) => `${userId}/${file.name}`);
}

/** Envia um objeto direto para o bucket (preparação dos testes), via cliente admin. */
export async function uploadAvatarObject(path: string, bytes: Uint8Array, type: string): Promise<void> {
  const { error } = await createAdminClient()
    .storage.from(AVATARS_BUCKET)
    .upload(path, bytes, { contentType: type, upsert: true });
  if (error) throw error;
}

/** Grava um perfil direto no banco (preparação dos testes). */
export async function createProfileRow(
  userId: string,
  row: { firstName?: string | null; lastName?: string | null; avatarPath?: string | null },
): Promise<void> {
  await prisma.profile.create({
    data: {
      userId,
      firstName: row.firstName ?? null,
      lastName: row.lastName ?? null,
      avatarPath: row.avatarPath ?? null,
    },
  });
}

/**
 * Faz login de verdade (Supabase Auth local) e grava a sessão no cookie mock de next/headers.
 * Necessário quando o código usa o Storage, cujas políticas dependem da sessão do usuário.
 */
export async function signInAs(email: string): Promise<void> {
  resetCookies();
  const { signIn } = await import("@/features/auth/actions");
  await signIn({ email, password: TEST_PASSWORD }).catch((error: unknown) => {
    if (!(error instanceof RedirectError)) throw error;
  });
}

/** PNG mínimo válido (1 × 1 px). */
export function pngBytes(): Uint8Array {
  return Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    ),
  );
}

/** JPEG mínimo (assinatura FF D8 FF + marcador de fim). */
export function jpegBytes(): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);
}

export { prisma };
