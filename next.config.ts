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
  experimental: {
    serverActions: {
      // Foto do perfil até 2 MB + sobra do multipart (specs/005-user-profile/research.md R4)
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
