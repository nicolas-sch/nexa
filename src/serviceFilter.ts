export function initServiceFilter(
  onChange: (selected: Set<string>) => void,
): void {
  const btn = document.querySelector<HTMLButtonElement>("#service-filter-btn")!;
  const panel = document.querySelector<HTMLElement>("#service-filter-panel")!;
  const summary = document.querySelector<HTMLElement>(
    "#service-filter-summary",
  )!;
  const clearBtn = document.querySelector<HTMLButtonElement>(
    "#service-filter-clear",
  )!;

  const selected = new Set<string>();

  function updateSummary() {
    if (selected.size === 0) {
      summary.textContent = "Todos";
    } else if (selected.size === 1) {
      summary.textContent = [...selected][0];
    } else {
      summary.textContent = `${selected.size} selecionados`;
    }
  }

  function closePanel() {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = panel.hidden;
    panel.hidden = !isOpen;
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target as Node) && event.target !== btn) {
      closePanel();
    }
  });

  panel.addEventListener("change", (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.type !== "checkbox") return;

    if (checkbox.checked) {
      selected.add(checkbox.value);
    } else {
      selected.delete(checkbox.value);
    }

    updateSummary();
    onChange(selected);
  });

  clearBtn.addEventListener("click", () => {
    selected.clear();
    panel
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });
    updateSummary();
    onChange(selected);
  });
}
