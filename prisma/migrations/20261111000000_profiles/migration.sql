-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "avatar_path" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);


-- ===========================================================================================
-- SQL manual (Princípio V): o que o schema do Prisma não expressa.
-- ===========================================================================================

-- Dono dos dados: o perfil pertence a um usuário do Supabase Auth (1:1)
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;

-- Nome e sobrenome: quando informados, de 1 a 50 caracteres
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_first_name_check" CHECK ("first_name" IS NULL OR char_length("first_name") BETWEEN 1 AND 50);
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_last_name_check" CHECK ("last_name" IS NULL OR char_length("last_name") BETWEEN 1 AND 50);

-- A foto fica sempre na pasta do próprio dono dentro do bucket
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_path_check" CHECK ("avatar_path" IS NULL OR "avatar_path" LIKE "user_id"::text || '/%');

-- Row Level Security: defesa em profundidade contra acesso pela API do Supabase.
-- A aplicação acessa via Prisma (que ignora o RLS) e por isso sempre filtra por user_id.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON "profiles" FOR SELECT TO authenticated USING (auth.uid() = "user_id");
CREATE POLICY "profiles_insert_own" ON "profiles" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "profiles_update_own" ON "profiles" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");
CREATE POLICY "profiles_delete_own" ON "profiles" FOR DELETE TO authenticated USING (auth.uid() = "user_id");


-- ===========================================================================================
-- Supabase Storage (schema storage, não auth): bucket privado das fotos de perfil.
-- Cada usuário só lê, grava e apaga objetos na pasta com o seu id (FR-024, SC-008).
-- ===========================================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_select_own" ON storage.objects;
CREATE POLICY "avatars_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
