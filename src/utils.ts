export function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

type ValidatableField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function validationMessage(field: ValidatableField): string {
  const validity = field.validity;

  if (validity.valueMissing) {
    return field instanceof HTMLInputElement && field.type === "checkbox"
      ? "Marque esta caixa para continuar."
      : "Preencha este campo.";
  }
  if (validity.typeMismatch) return "Formato inválido. Confira o valor informado.";
  if (validity.tooShort && field instanceof HTMLInputElement) {
    return `Use pelo menos ${field.minLength} caracteres.`;
  }
  if (validity.patternMismatch) return "Formato inválido.";

  return "Valor inválido.";
}

// Native browser validation tooltips (e.g. "Fill out this field") follow the
// browser's UI language, not the page's `lang` attribute — this forces
// Portuguese messages on every required field of a form.
export function localizeFormValidation(form: HTMLFormElement): void {
  form.querySelectorAll<ValidatableField>("[required]").forEach((field) => {
    field.addEventListener("invalid", () => {
      field.setCustomValidity(validationMessage(field));
    });
    field.addEventListener("input", () => field.setCustomValidity(""));
    field.addEventListener("change", () => field.setCustomValidity(""));
  });
}
