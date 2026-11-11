"use client";
// Client Component: menu suspenso com estado aberto/fechado, foco e navegação por teclado (Radix).

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";
import { UserAvatar } from "@/features/profile/components/user-avatar";
import { MENU_PROFILE, MENU_SIGN_OUT, accountMenuLabel, avatarAlt } from "@/features/profile/labels";
import type { ProfileView } from "@/features/profile/queries";
import { PROFILE_PATH } from "@/lib/app-routes";

type AccountMenuProps = {
  profile: Pick<ProfileView, "avatarUrl" | "initials" | "displayName" | "email">;
};

/** Avatar do cabeçalho que abre o menu "Perfil" / "Sair" (FR-003 a FR-008). */
export function AccountMenu({ profile }: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={accountMenuLabel(profile.displayName)}
        className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar
          avatarUrl={profile.avatarUrl}
          initials={profile.initials}
          alt={avatarAlt(profile.displayName)}
          size="sm"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={16} className="w-64 max-w-xs">
        <DropdownMenuLabel className="flex min-w-0 flex-col gap-0.5 px-2 py-2">
          <span className="truncate font-semibold text-foreground">{profile.displayName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{profile.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="min-h-11">
          <Link href={PROFILE_PATH}>
            <User aria-hidden="true" />
            {MENU_PROFILE}
          </Link>
        </DropdownMenuItem>
        <form action={signOut}>
          <DropdownMenuItem asChild className="min-h-11 w-full">
            <button type="submit">
              <LogOut aria-hidden="true" />
              {MENU_SIGN_OUT}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
