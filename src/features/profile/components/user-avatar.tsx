"use client";
// Client Component: o fallback para as iniciais depende do evento de carregamento/erro da imagem
// no navegador (Avatar do Radix).

import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SIZE_CLASSES = {
  sm: { root: "size-9", text: "text-sm" },
  lg: { root: "size-24", text: "text-3xl" },
} as const;

type UserAvatarProps = {
  /** URL da foto (assinada ou prévia local); null mostra as iniciais */
  avatarUrl: string | null;
  initials: string;
  alt: string;
  size: keyof typeof SIZE_CLASSES;
  className?: string;
};

/** Foto do usuário em círculo, com borda cinza neutra igual para todos (FR-001/002). */
export function UserAvatar({ avatarUrl, initials, alt, size, className }: UserAvatarProps) {
  return (
    <Avatar
      data-testid="user-avatar"
      className={cn(
        SIZE_CLASSES[size].root,
        "ring-2 ring-avatar-ring ring-offset-2 ring-offset-background after:hidden",
        className,
      )}
    >
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={alt} /> : null}
      <AvatarFallback className={cn("font-semibold", SIZE_CLASSES[size].text)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
