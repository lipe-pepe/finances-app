"use client";
// Hook de cliente: depende de window.matchMedia, que só existe no navegador. O layout por
// largura é resolvido em CSS (breakpoint `tablet`); este hook só decide comportamento.

import { useSyncExternalStore } from "react";

/** Telas abaixo de 720 px (breakpoint `tablet` = 45rem). */
export const NARROW_MEDIA_QUERY = "(max-width: 44.99rem)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(NARROW_MEDIA_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Indica se a tela está abaixo de 720 px; no servidor, considera tela larga. */
export function useIsNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW_MEDIA_QUERY).matches,
    () => false,
  );
}
