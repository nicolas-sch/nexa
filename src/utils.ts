export function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// Resizes and re-encodes an image as JPEG on the client before upload, so
// Supabase's free storage tier (1GB) fits far more salon photos — a raw
// phone photo can be 3-5MB, this brings it down to a few hundred KB.
// Falls back to the original file if the browser can't decode it (e.g. some
// HEIC cases) so a photo never silently fails to upload.
export function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82,
): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = file.name.replace(/\.\w+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
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
