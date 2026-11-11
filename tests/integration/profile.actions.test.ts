import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TEST_PASSWORD,
  TEST_USERS,
  createProfileRow,
  createTestUsers,
  jpegBytes,
  listAvatarObjects,
  pngBytes,
  prisma,
  resetDatabase,
  signInAs,
  type TestUsers,
} from "../setup/db";
import { resetCookies } from "../setup/mocks";
import { updateProfile } from "@/features/profile/actions";
import { AVATAR_FILE_ERROR, AVATAR_MAX_BYTES } from "@/lib/avatar-file";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Não mocka @/lib/auth: o Storage só aplica as políticas com a sessão real do usuário.

function form(fields: Record<string, string | File>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.append(name, value);
  return data;
}

const png = () => new File([pngBytes() as BlobPart], "eu.png", { type: "image/png" });
const jpeg = () => new File([jpegBytes() as BlobPart], "eu.jpg", { type: "image/jpeg" });

async function profileOf(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

/** Cliente com a sessão de um usuário, como um atacante usando a API do Supabase direto. */
async function sessionClientFor(email: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw error;
  return client;
}

describe("updateProfile — nome e sobrenome (US3)", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    await signInAs(TEST_USERS.a);
  });

  it("cria o perfil, normaliza os nomes e revalida o layout", async () => {
    await expect(updateProfile(form({ firstName: " Ana ", lastName: "" }))).resolves.toEqual({
      ok: true,
      data: undefined,
    });
    await expect(profileOf(users.userA)).resolves.toMatchObject({ firstName: "Ana", lastName: null });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("atualiza a mesma linha nas próximas vezes (upsert)", async () => {
    await updateProfile(form({ firstName: "Ana", lastName: "" }));
    await updateProfile(form({ firstName: "Ana", lastName: "Souza" }));
    await expect(prisma.profile.count({ where: { userId: users.userA } })).resolves.toBe(1);
    await expect(profileOf(users.userA)).resolves.toMatchObject({ lastName: "Souza" });
  });

  it("recusa nome vazio ou longo demais sem gravar (FR-015/020)", async () => {
    await expect(updateProfile(form({ firstName: "", lastName: "" }))).resolves.toMatchObject({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { firstName: ["Informe o nome."] } },
    });
    await expect(
      updateProfile(form({ firstName: "a".repeat(51), lastName: "" })),
    ).resolves.toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    await expect(profileOf(users.userA)).resolves.toBeNull();
  });

  it("ignora o email enviado no formulário (FR-017, SC-006)", async () => {
    await expect(
      updateProfile(form({ firstName: "Ana", lastName: "", email: "outro@teste.local" })),
    ).resolves.toMatchObject({ ok: true });
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    expect(data.user?.email).toBe(TEST_USERS.a);
  });

  it("sem sessão devolve UNAUTHENTICATED e não grava nada", async () => {
    resetCookies();
    await expect(updateProfile(form({ firstName: "Ana", lastName: "" }))).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    await expect(profileOf(users.userA)).resolves.toBeNull();
  });

  it("salvar como B nunca altera o perfil de A (SC-008)", async () => {
    await createProfileRow(users.userA, { firstName: "Ana" });
    await signInAs(TEST_USERS.b);
    await updateProfile(form({ firstName: "Bruno", lastName: "" }));
    await expect(profileOf(users.userA)).resolves.toMatchObject({ firstName: "Ana" });
    await expect(profileOf(users.userB)).resolves.toMatchObject({ firstName: "Bruno" });
  });
});

describe("updateProfile — foto (US4)", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    await signInAs(TEST_USERS.a);
  });

  it("envia a foto para a pasta do usuário com nome novo", async () => {
    await expect(
      updateProfile(form({ firstName: "Ana", lastName: "", photo: png() })),
    ).resolves.toMatchObject({ ok: true });
    const profile = await profileOf(users.userA);
    expect(profile?.avatarPath).toMatch(new RegExp(`^${users.userA}/[0-9a-f-]{36}\\.png$`));
    await expect(listAvatarObjects(users.userA)).resolves.toEqual([profile?.avatarPath]);
  });

  it("troca a foto e apaga a anterior", async () => {
    await updateProfile(form({ firstName: "Ana", lastName: "", photo: png() }));
    const first = (await profileOf(users.userA))?.avatarPath;
    await updateProfile(form({ firstName: "Ana", lastName: "", photo: jpeg() }));
    const second = (await profileOf(users.userA))?.avatarPath;

    expect(second).toMatch(/\.jpg$/);
    expect(second).not.toBe(first);
    await expect(listAvatarObjects(users.userA)).resolves.toEqual([second]);
  });

  it("recusa arquivo acima de 2 MB (FR-019)", async () => {
    const big = new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], "grande.png", { type: "image/png" });
    await expect(
      updateProfile(form({ firstName: "Ana", lastName: "", photo: big })),
    ).resolves.toEqual({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { photo: [AVATAR_FILE_ERROR] } },
    });
    await expect(profileOf(users.userA)).resolves.toBeNull();
  });

  it("recusa arquivo que não é imagem, mesmo com extensão e tipo de PNG", async () => {
    const fake = new File(["não sou uma imagem"], "x.png", { type: "image/png" });
    await expect(
      updateProfile(form({ firstName: "Ana", lastName: "", photo: fake })),
    ).resolves.toMatchObject({ ok: false, error: { fieldErrors: { photo: [AVATAR_FILE_ERROR] } } });
    await expect(listAvatarObjects(users.userA)).resolves.toEqual([]);
  });

  it("remove a foto e apaga o objeto (US4-5)", async () => {
    await updateProfile(form({ firstName: "Ana", lastName: "", photo: png() }));
    await updateProfile(form({ firstName: "Ana", lastName: "", removePhoto: "true" }));
    await expect(profileOf(users.userA)).resolves.toMatchObject({ avatarPath: null });
    await expect(listAvatarObjects(users.userA)).resolves.toEqual([]);
  });

  it("com foto nova e remoção juntas, a foto nova prevalece", async () => {
    await updateProfile(form({ firstName: "Ana", lastName: "", photo: png(), removePhoto: "true" }));
    await expect(profileOf(users.userA)).resolves.toMatchObject({
      avatarPath: expect.stringMatching(/\.png$/),
    });
  });

  it("outro usuário não consegue ler, listar nem gravar na pasta de A (FR-024, SC-008)", async () => {
    await updateProfile(form({ firstName: "Ana", lastName: "", photo: png() }));
    const pathA = (await profileOf(users.userA))!.avatarPath!;

    const clientB = await sessionClientFor(TEST_USERS.b);
    const bucket = clientB.storage.from("avatars");
    const download = await bucket.download(pathA);
    expect(download.error).not.toBeNull();
    const listing = await bucket.list(users.userA);
    expect(listing.data ?? []).toEqual([]);
    const upload = await bucket.upload(`${users.userA}/intruso.png`, pngBytes(), {
      contentType: "image/png",
    });
    expect(upload.error).not.toBeNull();
  });
});
