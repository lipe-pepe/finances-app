import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestUsers, prisma, resetDatabase, type TestUsers } from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import { saveAllocation } from "@/features/allocation/actions";

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
      data: { essentialPercentage: 70 },
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
