import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestUsers, prisma, resetDatabase, setAllocation, type TestUsers } from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import { saveAllocation, savePresentSplit } from "@/features/allocation/actions";

describe("saveAllocation", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    mockAuthenticatedUser(users.userA);
  });

  it("cria a divisão na primeira chamada e atualiza nas seguintes (última vence)", async () => {
    await expect(saveAllocation({ essentialPercentage: 70 })).resolves.toEqual({
      ok: true,
      data: { essentialPercentage: 70, parts: { essentials: 70, education: 0, free: 0 } },
    });
    await saveAllocation({ essentialPercentage: 65 });
    await saveAllocation({ essentialPercentage: 60 });
    const rows = await prisma.allocation.findMany();
    expect(rows).toEqual([expect.objectContaining({ userId: users.userA, essentialPercentage: 60 })]);
  });

  it("não chama revalidatePath (exceção no contrato)", async () => {
    await saveAllocation({ essentialPercentage: 40 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("retorna VALIDATION para valores fora de 0–100", async () => {
    const result = await saveAllocation({ essentialPercentage: 101 });
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    expect(await prisma.allocation.count()).toBe(0);
  });

  it("retorna UNAUTHENTICATED sem sessão", async () => {
    mockAuthenticatedUser(null);
    await expect(saveAllocation({ essentialPercentage: 50 })).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
  });

  it("salvar como A não altera a divisão de B", async () => {
    await prisma.allocation.create({ data: { userId: users.userB, essentialPercentage: 20 } });
    await saveAllocation({ essentialPercentage: 90 });
    const allocationOfB = await prisma.allocation.findUniqueOrThrow({
      where: { userId: users.userB },
    });
    expect(allocationOfB.essentialPercentage).toBe(20);
  });
});

describe("partes do Momento Presente (feature 006)", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    mockAuthenticatedUser(users.userA);
  });

  it("savePresentSplit grava Educação e Livre e devolve as três partes", async () => {
    await setAllocation(users.userA, { essentialPercentage: 70 });
    await expect(savePresentSplit({ educationPercentage: 5, freePercentage: 5 })).resolves.toEqual({
      ok: true,
      data: { parts: { essentials: 60, education: 5, free: 5 } },
    });
    await expect(prisma.allocation.findUnique({ where: { userId: users.userA } })).resolves.toMatchObject({
      essentialPercentage: 70,
      educationPercentage: 5,
      freePercentage: 5,
    });
  });

  it("savePresentSplit sem linha cria a divisão com 50% de Momento Presente", async () => {
    await savePresentSplit({ educationPercentage: 10, freePercentage: 0 });
    await expect(prisma.allocation.findUnique({ where: { userId: users.userA } })).resolves.toMatchObject({
      essentialPercentage: 50,
      educationPercentage: 10,
    });
  });

  it("savePresentSplit recusa partes que passam do Momento Presente", async () => {
    await setAllocation(users.userA, { essentialPercentage: 70 });
    await expect(savePresentSplit({ educationPercentage: 40, freePercentage: 40 })).resolves.toEqual({
      ok: false,
      error: {
        code: "VALIDATION",
        fieldErrors: { freePercentage: ["A soma das partes não pode passar do Momento Presente."] },
      },
    });
    await expect(prisma.allocation.findUnique({ where: { userId: users.userA } })).resolves.toMatchObject({
      educationPercentage: 0,
      freePercentage: 0,
    });
  });

  it("savePresentSplit sem sessão devolve UNAUTHENTICATED", async () => {
    mockAuthenticatedUser(null);
    await expect(savePresentSplit({ educationPercentage: 5, freePercentage: 5 })).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
  });

  it("saveAllocation reajusta as partes na proporção (FR-008)", async () => {
    await setAllocation(users.userA, { essentialPercentage: 70, educationPercentage: 5, freePercentage: 5 });
    await expect(saveAllocation({ essentialPercentage: 35 })).resolves.toEqual({
      ok: true,
      data: { essentialPercentage: 35, parts: { essentials: 30, education: 3, free: 2 } },
    });
    await expect(prisma.allocation.findUnique({ where: { userId: users.userA } })).resolves.toMatchObject({
      essentialPercentage: 35,
      educationPercentage: 3,
      freePercentage: 2,
    });
  });
});
