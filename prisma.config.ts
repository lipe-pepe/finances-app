import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Carrega as variáveis do mesmo arquivo usado pelo Next (.env.local) ou de um arquivo explícito
// (ex.: PRISMA_ENV_FILE=.env.test para aplicar migrations no banco de testes).
config({ path: process.env.PRISMA_ENV_FILE ?? [".env.local", ".env"], quiet: true });

// Configuração do Prisma: migrations usam a conexão direta (DIRECT_URL); em runtime a aplicação
// usa o pooler (DATABASE_URL) via driver adapter em src/lib/prisma.ts.
// A URL é opcional aqui para que `prisma generate` funcione sem banco configurado.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
