export function renderPagination(currentPage: number, totalPages: number): string {
  if (totalPages <= 1) return "";

  let pageButtons = "";
  for (let p = 1; p <= totalPages; p++) {
    pageButtons += `<button type="button" class="page-btn${p === currentPage ? " active" : ""}" data-page="${p}">${p}</button>`;
  }

  return `
    <button type="button" class="page-btn page-nav" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹</button>
    ${pageButtons}
    <button type="button" class="page-btn page-nav" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>›</button>
  `;
}

export function initPagination(
  container: HTMLElement,
  onPageChange: (page: number) => void,
): void {
  container.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-page]",
    );
    if (!target || target.disabled) return;

    onPageChange(Number(target.dataset.page));
  });
}
