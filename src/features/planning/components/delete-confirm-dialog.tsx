"use client";
// Client Component: diálogo de confirmação interativo (abrir, cancelar, confirmar e mostrar
// erro), que depende de estado e eventos no navegador.

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { runAction } from "@/lib/handle-action-result";

type DeleteConfirmDialogProps = {
  itemName: string;
  /** Server Action já vinculada ao id do item (ex.: deleteIncome.bind(null, id)) */
  action: () => Promise<ActionResult>;
};

export function DeleteConfirmDialog({ itemName, action }: DeleteConfirmDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setMessage(null);
    const outcome = await runAction(action, { router });
    setPending(false);
    if (outcome.ok) {
      setOpen(false);
    } else {
      setMessage(outcome.message);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setMessage(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Apagar ${itemName}`}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar &quot;{itemName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        {message && (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          {/* Botão comum (não AlertDialogAction) para manter o diálogo aberto até concluir */}
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "Apagando…" : "Apagar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
