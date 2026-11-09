import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

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
  await prisma.$transaction([
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

export { prisma };
