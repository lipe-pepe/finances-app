-- CreateEnum
CREATE TYPE "present_part" AS ENUM ('essentials', 'education', 'free');

-- AlterTable
ALTER TABLE "allocations" ADD COLUMN     "education_percentage" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "free_percentage" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "part" "present_part" NOT NULL DEFAULT 'essentials';

-- AlterTable
ALTER TABLE "actual_expenses" ADD COLUMN     "part" "present_part" NOT NULL DEFAULT 'essentials';



-- ===========================================================================================
-- SQL manual (Princípio V): o que o schema do Prisma não expressa.
-- ===========================================================================================

-- O DEFAULT 'essentials' das colunas "part" coloca os gastos existentes em Gastos Essenciais
-- (FR-021). A parte Gastos Essenciais da divisão é derivada: Momento Presente − Educação − Livre,
-- por isso Educação + Livre nunca pode passar do Momento Presente.
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_present_parts_check" CHECK ("education_percentage" >= 0 AND "free_percentage" >= 0 AND "education_percentage" + "free_percentage" <= "essential_percentage");
