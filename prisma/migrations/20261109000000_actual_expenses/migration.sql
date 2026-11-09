-- CreateTable
CREATE TABLE "actual_expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category_id" UUID NOT NULL,
    "spent_on" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "actual_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actual_expenses_user_id_spent_on_idx" ON "actual_expenses"("user_id", "spent_on");

-- AddForeignKey
ALTER TABLE "actual_expenses" ADD CONSTRAINT "actual_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ===========================================================================================
-- SQL manual (Princípio V): o que o schema do Prisma não expressa.
-- ===========================================================================================

-- Dono dos dados: cada gasto realizado pertence a um usuário do Supabase Auth
ALTER TABLE "actual_expenses" ADD CONSTRAINT "actual_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;

-- Valor monetário: maior que zero e até R$ 999.999.999,99
ALTER TABLE "actual_expenses" ADD CONSTRAINT "actual_expenses_amount_check" CHECK ("amount" > 0 AND "amount" <= 999999999.99);

-- Row Level Security: defesa em profundidade contra acesso pela API do Supabase.
-- A aplicação acessa via Prisma (que ignora o RLS) e por isso sempre filtra por user_id.
ALTER TABLE "actual_expenses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actual_expenses_select_own" ON "actual_expenses" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "actual_expenses_insert_own" ON "actual_expenses" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "actual_expenses_update_own" ON "actual_expenses" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "actual_expenses_delete_own" ON "actual_expenses" FOR DELETE TO authenticated USING (auth.uid() = "user_id");
