import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Dois projetos: "unit" (libs, schemas e componentes) e "integration" (Server Actions contra o
// banco de teste). Os testes de integração rodam em sequência porque compartilham o banco.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": new URL("./tests/setup/server-only.ts", import.meta.url).pathname,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["tests/setup/unit.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          fileParallelism: false,
          setupFiles: ["tests/setup/integration.setup.ts"],
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
