import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  TEST_USERS,
  createProfileRow,
  createTestUsers,
  pngBytes,
  resetDatabase,
  signInAs,
  uploadAvatarObject,
  type TestUsers,
} from "../setup/db";
import { getProfile } from "@/features/profile/queries";

// Não mocka @/lib/auth: a URL assinada da foto depende da sessão real do usuário (Storage).

describe("getProfile", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    await signInAs(TEST_USERS.a);
  });

  it("devolve um perfil vazio quando o usuário nunca salvou", async () => {
    await expect(getProfile(users.userA)).resolves.toEqual({
      firstName: null,
      lastName: null,
      email: TEST_USERS.a,
      avatarUrl: null,
      initials: "U",
      displayName: TEST_USERS.a,
    });
  });

  it("monta iniciais e nome exibido a partir do perfil salvo", async () => {
    await createProfileRow(users.userA, { firstName: "Ana", lastName: "Souza" });
    await expect(getProfile(users.userA)).resolves.toMatchObject({
      firstName: "Ana",
      lastName: "Souza",
      initials: "AS",
      displayName: "Ana Souza",
    });
  });

  it("gera URL assinada para a foto existente", async () => {
    const path = `${users.userA}/foto.png`;
    await uploadAvatarObject(path, pngBytes(), "image/png");
    await createProfileRow(users.userA, { firstName: "Ana", avatarPath: path });

    const profile = await getProfile(users.userA);
    expect(profile.avatarUrl).toContain(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    expect(profile.avatarUrl).toContain("/storage/v1/object/sign/avatars/");
  });

  it("devolve avatarUrl null quando o objeto não existe", async () => {
    await createProfileRow(users.userA, {
      firstName: "Ana",
      avatarPath: `${users.userA}/inexistente.png`,
    });
    await expect(getProfile(users.userA)).resolves.toMatchObject({ avatarUrl: null });
  });

  it("nunca devolve o perfil de outro usuário", async () => {
    await createProfileRow(users.userB, { firstName: "Bruno" });
    await expect(getProfile(users.userA)).resolves.toMatchObject({ firstName: null });
  });
});
