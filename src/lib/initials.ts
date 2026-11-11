// Nome exibido e iniciais do avatar a partir dos dados do perfil (funções puras)

export type NameParts = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

/** Primeiro caractere visível em maiúscula (Array.from respeita caracteres fora do BMP). */
function firstLetter(value: string | null): string {
  const trimmed = value?.trim() ?? "";
  const [first] = Array.from(trimmed);
  return first ? first.toLocaleUpperCase("pt-BR") : "";
}

/**
 * Até duas letras: inicial do nome + inicial do sobrenome. Sem nome, a inicial do email
 * (FR-002).
 */
export function getInitials({ firstName, lastName, email }: NameParts): string {
  const first = firstLetter(firstName);
  if (!first) {
    return firstLetter(email);
  }
  return first + firstLetter(lastName);
}

/** "Nome Sobrenome", ou o email quando o nome ainda não foi informado. */
export function getDisplayName({ firstName, lastName, email }: NameParts): string {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return firstName?.trim() ? name : email;
}
