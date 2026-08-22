const SWIPE_THRESHOLD = 40;

function navigateGallery(gallery: HTMLElement, direction: "next" | "prev") {
  const images: string[] = JSON.parse(gallery.dataset.images ?? "[]");
  const total = images.length;
  if (!total) return;

  const index = Number(gallery.dataset.index ?? "0");
  const nextIndex =
    direction === "next" ? (index + 1) % total : (index - 1 + total) % total;

  gallery.dataset.index = String(nextIndex);
  gallery.querySelector<HTMLImageElement>(".salon-image")!.src =
    images[nextIndex];
  gallery.querySelector<HTMLElement>(".gallery-counter")!.textContent =
    `${nextIndex + 1}/${total}`;
}

export function initCardGallery(container: HTMLElement): void {
  container.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      ".gallery-nav",
    );
    if (!btn) return;

    const gallery = btn.closest<HTMLElement>(".card-gallery")!;
    navigateGallery(
      gallery,
      btn.classList.contains("gallery-next") ? "next" : "prev",
    );
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchGallery: HTMLElement | null = null;

  container.addEventListener(
    "touchstart",
    (event) => {
      const gallery = (event.target as HTMLElement).closest<HTMLElement>(
        ".card-gallery",
      );
      if (!gallery) return;

      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchGallery = gallery;
    },
    { passive: true },
  );

  container.addEventListener(
    "touchend",
    (event) => {
      if (!touchGallery) return;

      const gallery = touchGallery;
      touchGallery = null;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (
        Math.abs(deltaX) < SWIPE_THRESHOLD ||
        Math.abs(deltaX) < Math.abs(deltaY)
      ) {
        return;
      }

      navigateGallery(gallery, deltaX < 0 ? "next" : "prev");
    },
    { passive: true },
  );
}
