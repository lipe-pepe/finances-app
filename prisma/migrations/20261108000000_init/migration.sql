-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "incomes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "user_id" UUID NOT NULL,
    "essential_percentage" SMALLINT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(60) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incomes_user_id_created_at_idx" ON "incomes"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "expenses_user_id_created_at_idx" ON "expenses"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "goals_user_id_created_at_idx" ON "goals"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===========================================================================================
-- SQL manual (Princípio V): o que o schema do Prisma não expressa.
-- O schema "auth" é gerenciado pelo Supabase Auth e não é alterado aqui; apenas referenciado.
-- ===========================================================================================

-- Dono dos dados: cada registro pertence a um usuário do Supabase Auth
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;

-- Valores monetários: maiores que zero e até R$ 999.999.999,99
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_amount_check" CHECK ("amount" > 0 AND "amount" <= 999999999.99);
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_amount_check" CHECK ("amount" > 0 AND "amount" <= 999999999.99);
ALTER TABLE "goals" ADD CONSTRAINT "goals_amount_check" CHECK ("amount" > 0 AND "amount" <= 999999999.99);

-- Porcentagem de gastos essenciais entre 0 e 100
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_essential_percentage_check" CHECK ("essential_percentage" >= 0 AND "essential_percentage" <= 100);

-- Row Level Security: defesa em profundidade contra acesso pela API do Supabase.
-- A aplicação acessa via Prisma (que ignora o RLS) e por isso sempre filtra por user_id.
ALTER TABLE "incomes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "allocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário autenticado só acessa as próprias linhas
CREATE POLICY "incomes_select_own" ON "incomes" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "incomes_insert_own" ON "incomes" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "incomes_update_own" ON "incomes" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "incomes_delete_own" ON "incomes" FOR DELETE TO authenticated USING (auth.uid() = "user_id");

CREATE POLICY "expenses_select_own" ON "expenses" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "expenses_insert_own" ON "expenses" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "expenses_update_own" ON "expenses" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "expenses_delete_own" ON "expenses" FOR DELETE TO authenticated USING (auth.uid() = "user_id");

CREATE POLICY "goals_select_own" ON "goals" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "goals_insert_own" ON "goals" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "goals_update_own" ON "goals" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "goals_delete_own" ON "goals" FOR DELETE TO authenticated USING (auth.uid() = "user_id");

CREATE POLICY "allocations_select_own" ON "allocations" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "allocations_insert_own" ON "allocations" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "allocations_update_own" ON "allocations" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "allocations_delete_own" ON "allocations" FOR DELETE TO authenticated USING (auth.uid() = "user_id");

-- Categorias: somente leitura para usuários autenticados; sem políticas de escrita
CREATE POLICY "categories_select_authenticated" ON "categories" FOR SELECT TO authenticated USING (true);
