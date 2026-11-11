import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { useUnsavedChangesGuard } from "@/features/profile/hooks/use-unsaved-changes-guard";

function addLink(href: string, attrs: Record<string, string> = {}): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.href = href;
  for (const [name, value] of Object.entries(attrs)) anchor.setAttribute(name, value);
  anchor.textContent = "link";
  document.body.appendChild(anchor);
  return anchor;
}

function click(anchor: HTMLAnchorElement, init: MouseEventInit = {}): MouseEvent {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  act(() => {
    anchor.dispatchEvent(event);
  });
  return event;
}

describe("useUnsavedChangesGuard", () => {
  beforeEach(() => {
    push.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("não intercepta nada sem alterações", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(false));
    const event = click(addLink("/planning"));
    expect(event.defaultPrevented).toBe(false);
    expect(result.current.pendingHref).toBeNull();
  });

  it("suspende a navegação por link interno e confirma depois (FR-023)", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    const event = click(addLink("/planning"));
    expect(event.defaultPrevented).toBe(true);
    expect(result.current.pendingHref).toBe("/planning");

    act(() => result.current.confirmDiscard());
    expect(push).toHaveBeenCalledWith("/planning");
    expect(result.current.pendingHref).toBeNull();
  });

  it("cancelar mantém o usuário na página", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    click(addLink("/control"));
    act(() => result.current.cancelDiscard());
    expect(result.current.pendingHref).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("ignora links externos, nova aba e cliques com Ctrl/Meta", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    expect(click(addLink("https://externo.test/x")).defaultPrevented).toBe(false);
    expect(click(addLink("/planning", { target: "_blank" })).defaultPrevented).toBe(false);
    expect(click(addLink("/planning"), { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(click(addLink("/planning"), { metaKey: true }).defaultPrevented).toBe(false);
    expect(result.current.pendingHref).toBeNull();
  });

  it("avisa ao recarregar ou fechar a aba", () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("remove os listeners ao desmontar", () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true));
    unmount();
    expect(click(addLink("/planning")).defaultPrevented).toBe(false);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
