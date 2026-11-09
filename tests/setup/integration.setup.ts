import { config } from "dotenv";
import { vi } from "vitest";

// Variáveis do banco de teste (Supabase local). Ver .env.test.example.
config({ path: ".env.test", override: true, quiet: true });

for (const name of [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  if (!process.env[name]) {
    throw new Error(
      `Variável ${name} ausente. Crie .env.test a partir de .env.test.example e rode \`supabase start\`.`,
    );
  }
}

// APIs do Next que só existem dentro de uma requisição: substituídas por versões de teste
vi.mock("next/headers", async () => (await import("./mocks")).nextHeadersMock);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/navigation", async () => (await import("./mocks")).nextNavigationMock);
