import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed das categorias globais (idempotente: upsert pelo nome)
const CATEGORY_NAMES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Contas e Serviços",
  "Viagem",
  "Reserva de Emergência",
  "Investimentos",
  "Outros",
];

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Defina DIRECT_URL ou DATABASE_URL para executar o seed.");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    for (const name of CATEGORY_NAMES) {
      await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log(`Seed concluído: ${CATEGORY_NAMES.length} categorias.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
