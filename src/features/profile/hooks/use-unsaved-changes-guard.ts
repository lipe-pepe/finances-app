"use client";
// Client Component (hook): escuta eventos do documento e da janela para avisar sobre alterações
// não salvas antes de sair da página.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Link interno que leva a outra página (sem nova aba, download ou teclas modificadoras). */
function internalHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  return url.pathname + url.search + url.hash;
}

/**
 * Enquanto `isDirty`, pede confirmação ao sair da página (FR-023, research.md R9):
 * - recarregar/fechar a aba → aviso nativo do navegador (`beforeunload`);
 * - clique em link interno → navegação suspensa até `confirmDiscard()` ou `cancelDiscard()`.
 * O botão "Voltar" do navegador não é interceptado (o App Router não oferece bloqueio).
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    function handleClick(event: MouseEvent) {
      const href = internalHref(event);
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const confirmDiscard = useCallback(() => {
    if (pendingHref) {
      router.push(pendingHref);
    }
    setPendingHref(null);
  }, [pendingHref, router]);

  const cancelDiscard = useCallback(() => setPendingHref(null), []);

  return { pendingHref, confirmDiscard, cancelDiscard };
}
