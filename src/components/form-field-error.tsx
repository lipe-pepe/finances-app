type FormFieldErrorProps = {
  id: string;
  message?: string;
};

/** Mensagem de erro de um campo de formulário, ligada ao input via aria-describedby. */
export function FormFieldError({ id, message }: FormFieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}
