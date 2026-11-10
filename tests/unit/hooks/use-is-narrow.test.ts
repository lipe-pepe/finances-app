import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NARROW_MEDIA_QUERY, useIsNarrow } from "@/hooks/use-is-narrow";

type Listener = () => void;

function mockMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  const media = {
    matches: initial,
    media: NARROW_MEDIA_QUERY,
    addEventListener: vi.fn((_: string, listener: Listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: Listener) => listeners.delete(listener)),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => media));
  return {
    media,
    change(matches: boolean) {
      media.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useIsNarrow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("usa a consulta de telas abaixo de 720 px", () => {
    expect(NARROW_MEDIA_QUERY).toBe("(max-width: 44.99rem)");
  });

  it("indica tela estreita e acompanha as mudanças", () => {
    const control = mockMatchMedia(true);
    const { result } = renderHook(() => useIsNarrow());
    expect(result.current).toBe(true);
    act(() => control.change(false));
    expect(result.current).toBe(false);
  });

  it("remove o listener ao desmontar", () => {
    const control = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useIsNarrow());
    expect(result.current).toBe(false);
    unmount();
    expect(control.media.removeEventListener).toHaveBeenCalled();
  });
});
