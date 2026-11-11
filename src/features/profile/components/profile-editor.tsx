"use client";
// Client Component: alterna entre leitura e edição, controla o formulário (React Hook Form), a
// prévia da foto e o aviso de alterações não salvas.

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { FormFieldError } from "@/components/form-field-error";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/profile/actions";
import { UserAvatar } from "@/features/profile/components/user-avatar";
import { useUnsavedChangesGuard } from "@/features/profile/hooks/use-unsaved-changes-guard";
import {
  CANCEL,
  CHOOSE_PHOTO,
  COMPLETE_PROFILE_HINT,
  DISCARD,
  DISCARD_DESCRIPTION,
  DISCARD_TITLE,
  EDIT_PROFILE,
  EMAIL_READ_ONLY_NOTE,
  FIELD_LABELS,
  KEEP_EDITING,
  NAME_NOT_SET,
  PROFILE_SAVED,
  REMOVE_PHOTO,
  SAVE,
  SAVING,
  VALUE_NOT_SET,
  avatarAlt,
} from "@/features/profile/labels";
import type { ProfileView } from "@/features/profile/queries";
import {
  PROFILE_NAME_MAX_LENGTH,
  profileSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas";
import { AVATAR_ACCEPT, checkAvatarFile } from "@/lib/avatar-file";
import { applyFieldErrors, runAction } from "@/lib/handle-action-result";

type ProfileEditorProps = {
  profile: ProfileView;
};

/** Foto escolhida no modo edição: arquivo novo com prévia local, ou pedido de remoção. */
type PhotoChange = { file: File; previewUrl: string } | { removed: true } | null;

function formValues(profile: ProfileView): ProfileFormValues {
  return { firstName: profile.firstName ?? "", lastName: profile.lastName ?? "" };
}

/** Perfil do usuário: modo leitura (padrão) e, pelo botão "Editar perfil", modo edição. */
export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  // Ao sair da edição, o botão "Editar perfil" é montado de novo e recebe o foco
  const [restoreFocus, setRestoreFocus] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoChange>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema, undefined, { raw: true }),
    defaultValues: formValues(profile),
  });

  const hasPhotoChange = photo !== null;
  const { pendingHref, confirmDiscard, cancelDiscard } = useUnsavedChangesGuard(
    isEditing && (isDirty || hasPhotoChange),
  );

  // Libera a URL da prévia quando ela é trocada, descartada ou o componente desmonta
  const previewUrl = photo && "previewUrl" in photo ? photo.previewUrl : null;
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Foco no campo "Nome" ao entrar na edição
  useEffect(() => {
    if (isEditing) {
      setFocus("firstName");
    }
  }, [isEditing, setFocus]);

  function startEditing() {
    reset(formValues(profile));
    setPhoto(null);
    setPhotoError(null);
    setFormMessage(null);
    setSavedMessage(null);
    setIsEditing(true);
  }

  function stopEditing() {
    setPhoto(null);
    setPhotoError(null);
    setFormMessage(null);
    setRestoreFocus(true);
    setIsEditing(false);
  }

  function handleCancel() {
    reset(formValues(profile));
    stopEditing();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const error = checkAvatarFile(file);
    setPhotoError(error);
    if (!error) {
      setPhoto({ file, previewUrl: URL.createObjectURL(file) });
    }
  }

  function handleRemovePhoto() {
    setPhotoError(null);
    setPhoto({ removed: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    setPhotoError(null);

    // Só os campos editáveis vão para o servidor; o email nunca é enviado (FR-016)
    const data = new FormData();
    data.set("firstName", values.firstName);
    data.set("lastName", values.lastName ?? "");
    if (photo && "file" in photo) {
      data.set("photo", photo.file);
    } else if (photo && "removed" in photo) {
      data.set("removePhoto", "true");
    }

    const outcome = await runAction(() => updateProfile(data), {
      router,
      onValidationError: (fieldErrors) => {
        const { photo: photoErrors, ...nameErrors } = fieldErrors;
        if (photoErrors?.[0]) setPhotoError(photoErrors[0]);
        applyFieldErrors(nameErrors, setError);
      },
      onSuccess: () => {
        reset(values);
        stopEditing();
        setSavedMessage(PROFILE_SAVED);
      },
    });
    setFormMessage(outcome.message);
  });

  const hasName = Boolean(profile.firstName);
  const shownAvatarUrl =
    previewUrl ?? (photo && "removed" in photo ? null : profile.avatarUrl);
  const canRemovePhoto = Boolean(shownAvatarUrl);

  const firstNameId = `${fieldId}-first-name`;
  const lastNameId = `${fieldId}-last-name`;
  const photoErrorId = `${fieldId}-photo-error`;

  return (
    <>
      <Card className="flex min-w-0 flex-col items-center gap-6 p-6 tablet:flex-row tablet:items-start">
        <div className="flex flex-col items-center gap-3">
          <UserAvatar
            avatarUrl={shownAvatarUrl}
            initials={profile.initials}
            alt={avatarAlt(profile.displayName)}
            size="lg"
          />
          {isEditing && (
            <div className="flex w-full flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                data-testid="photo-input"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                aria-describedby={photoError ? photoErrorId : undefined}
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Camera aria-hidden="true" />
                {CHOOSE_PHOTO}
              </Button>
              {canRemovePhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleRemovePhoto}
                  disabled={isSubmitting}
                >
                  <Trash2 aria-hidden="true" />
                  {REMOVE_PHOTO}
                </Button>
              )}
              <FormFieldError id={photoErrorId} message={photoError ?? undefined} />
            </div>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {isEditing ? (
            <form onSubmit={onSubmit} noValidate className="flex w-full min-w-0 flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={firstNameId}>{FIELD_LABELS.firstName}</Label>
                <Input
                  id={firstNameId}
                  maxLength={PROFILE_NAME_MAX_LENGTH}
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
                  {...register("firstName")}
                />
                <FormFieldError id={`${firstNameId}-error`} message={errors.firstName?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={lastNameId}>{FIELD_LABELS.lastName}</Label>
                <Input
                  id={lastNameId}
                  maxLength={PROFILE_NAME_MAX_LENGTH}
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
                  {...register("lastName")}
                />
                <FormFieldError id={`${lastNameId}-error`} message={errors.lastName?.message} />
              </div>
              <div className="min-w-0 text-sm">
                <p className="text-muted-foreground">{FIELD_LABELS.email}</p>
                <p className="truncate font-medium">{profile.email}</p>
                <p className="text-xs text-muted-foreground">{EMAIL_READ_ONLY_NOTE}</p>
              </div>
              {formMessage && (
                <p role="alert" className="text-sm text-destructive">
                  {formMessage}
                </p>
              )}
              <div className="flex flex-col gap-2 tablet:flex-row">
                <Button type="submit" className="w-full tablet:w-fit" disabled={isSubmitting}>
                  {isSubmitting ? SAVING : SAVE}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full tablet:w-fit"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {CANCEL}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="min-w-0 text-center tablet:text-left">
                <h2
                  className={
                    hasName
                      ? "truncate text-xl font-semibold"
                      : "text-xl font-semibold text-muted-foreground"
                  }
                >
                  {hasName ? profile.displayName : NAME_NOT_SET}
                </h2>
                {!hasName ? (
                  <p className="text-sm text-muted-foreground">{COMPLETE_PROFILE_HINT}</p>
                ) : null}
              </div>
              <dl className="grid min-w-0 gap-3 text-sm">
                <ProfileField label={FIELD_LABELS.firstName} value={profile.firstName} />
                <ProfileField label={FIELD_LABELS.lastName} value={profile.lastName} />
                <ProfileField label={FIELD_LABELS.email} value={profile.email} />
              </dl>
              <Button
                type="button"
                autoFocus={restoreFocus}
                variant="outline"
                className="w-full tablet:w-fit"
                onClick={startEditing}
              >
                <Pencil aria-hidden="true" />
                {EDIT_PROFILE}
              </Button>
            </>
          )}
          <p role="status" className="text-sm text-muted-foreground empty:hidden">
            {savedMessage}
          </p>
        </div>
      </Card>

      <AlertDialog open={pendingHref !== null} onOpenChange={(open) => !open && cancelDiscard()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DISCARD_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{DISCARD_DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{KEEP_EDITING}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>{DISCARD}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
