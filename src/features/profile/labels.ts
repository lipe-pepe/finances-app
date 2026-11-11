// Textos da interface do perfil e do menu da conta (specs/005-user-profile/contracts/ui.md)

export const PROFILE_TITLE = "Perfil";
export const MENU_PROFILE = "Perfil";
export const MENU_SIGN_OUT = "Sair";

/** Nome acessível do botão do avatar (FR-008). */
export function accountMenuLabel(name: string): string {
  return `Menu da conta de ${name}`;
}

export const FIELD_LABELS = {
  firstName: "Nome",
  lastName: "Sobrenome",
  email: "Email",
} as const;

export const NAME_NOT_SET = "Nome não informado";
export const VALUE_NOT_SET = "Não informado";
export const COMPLETE_PROFILE_HINT = "Complete seu perfil adicionando seu nome.";

export const EDIT_PROFILE = "Editar perfil";
export const SAVE = "Salvar";
export const SAVING = "Salvando…";
export const CANCEL = "Cancelar";
export const CHOOSE_PHOTO = "Escolher foto";
export const REMOVE_PHOTO = "Remover foto";
export const EMAIL_READ_ONLY_NOTE = "O email não pode ser alterado.";
export const PROFILE_SAVED = "Perfil atualizado.";

export const DISCARD_TITLE = "Descartar alterações?";
export const DISCARD_DESCRIPTION = "As alterações que você fez no perfil não foram salvas.";
export const KEEP_EDITING = "Continuar editando";
export const DISCARD = "Descartar";

/** Texto alternativo da foto do usuário. */
export function avatarAlt(name: string): string {
  return `Foto de ${name}`;
}
