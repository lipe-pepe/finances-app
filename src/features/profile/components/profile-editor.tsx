"use client";
// Client Component: alterna entre leitura e edição, controla o formulário (React Hook Form) e a
// prévia da foto.

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/features/profile/components/user-avatar";
import {
  COMPLETE_PROFILE_HINT,
  EDIT_PROFILE,
  FIELD_LABELS,
  NAME_NOT_SET,
  VALUE_NOT_SET,
  avatarAlt,
} from "@/features/profile/labels";
import type { ProfileView } from "@/features/profile/queries";

type ProfileEditorProps = {
  profile: ProfileView;
};

/** Perfil do usuário: modo leitura (padrão) e, pelo botão "Editar perfil", modo edição. */
export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [, setIsEditing] = useState(false);
  const hasName = Boolean(profile.firstName);

  return (
    <Card className="flex min-w-0 flex-col items-center gap-6 p-6 tablet:flex-row tablet:items-start">
      <UserAvatar
        avatarUrl={profile.avatarUrl}
        initials={profile.initials}
        alt={avatarAlt(profile.displayName)}
        size="lg"
      />
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
        <div className="min-w-0 text-center tablet:text-left">
          <h2
            className={
              hasName ? "truncate text-xl font-semibold" : "text-xl font-semibold text-muted-foreground"
            }
          >
            {hasName ? profile.displayName : NAME_NOT_SET}
          </h2>
          {!hasName ? <p className="text-sm text-muted-foreground">{COMPLETE_PROFILE_HINT}</p> : null}
        </div>
        <dl className="grid min-w-0 gap-3 text-sm">
          <ProfileField label={FIELD_LABELS.firstName} value={profile.firstName} />
          <ProfileField label={FIELD_LABELS.lastName} value={profile.lastName} />
          <ProfileField label={FIELD_LABELS.email} value={profile.email} />
        </dl>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full tablet:w-fit"
          onClick={() => setIsEditing(true)}
        >
          <Pencil aria-hidden="true" />
          {EDIT_PROFILE}
        </Button>
      </div>
    </Card>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={value ? "truncate font-medium" : "text-muted-foreground"}>
        {value ?? VALUE_NOT_SET}
      </dd>
    </div>
  );
}
