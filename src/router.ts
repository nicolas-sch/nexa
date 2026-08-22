interface RouterOptions {
  menuBtn: HTMLButtonElement;
  navMenu: HTMLElement;
  pages: Record<string, HTMLElement>;
  onRouteChange?: (route: string) => void;
}

export function initRouter({
  menuBtn,
  navMenu,
  pages,
  onRouteChange,
}: RouterOptions): void {
  function closeMenu() {
    navMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  function currentRoute(): string {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    return hash in pages ? hash : "/";
  }

  function showRoute() {
    const route = currentRoute();

    for (const [path, section] of Object.entries(pages)) {
      section.hidden = path !== route;
    }

    navMenu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      link.classList.toggle("active", link.dataset.route === route);
    });

    onRouteChange?.(route);
    closeMenu();
  }

  menuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = navMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target as Node) && event.target !== menuBtn) {
      closeMenu();
    }
  });

  window.addEventListener("hashchange", showRoute);
  showRoute();
}
