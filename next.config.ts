import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components desativado: toda a tela de planejamento depende da sessão do usuário
  // (cookies do Supabase), então a renderização é sempre dinâmica por requisição.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
