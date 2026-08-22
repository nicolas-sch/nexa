import "./style.scss";
import { salons } from "./data";
import type { Salon } from "./types";
import { distanceKm, formatDistance } from "./geo";
import { initMap, updateMapSalons, setUserLocation, invalidateMapSize } from "./map";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header id="topbar">
    <div id="header-inner">
      <button id="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-menu">
        <span></span><span></span><span></span>
      </button>
      <div id="header-titles">
        <h1>Nexa</h1>
        <p class="subtitle">Onde a beleza encontra conexão</p>
      </div>
      <nav id="nav-menu">
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
      </nav>
    </div>
  </header>

  <section id="page-home" class="page">
    <div id="search-row">
      <input
        id="search-input"
        type="search"
        placeholder="Buscar por cidade, estado, rua ou nome..."
        autocomplete="off"
      />
      <button id="locate-btn" type="button">📍 Usar minha localização</button>
    </div>
    <p id="locate-status"></p>

    <div id="map"></div>

    <div id="filters-row">
      <label class="filter-field">
        Avaliação
        <select id="rating-filter">
          <option value="0">Qualquer</option>
          <option value="5">5 estrelas</option>
          <option value="4.5">4,5+ estrelas</option>
          <option value="4">4+ estrelas</option>
          <option value="3.5">3,5+ estrelas</option>
          <option value="3">3+ estrelas</option>
        </select>
      </label>
      <label class="filter-field">
        Serviço
        <select id="service-filter">
          <option value="">Todos</option>
          <option value="Escova">Escova</option>
          <option value="Coloração">Coloração</option>
          <option value="Unhas">Unhas</option>
          <option value="Depilação">Depilação</option>
          <option value="Corte">Corte</option>
        </select>
      </label>
    </div>

    <main id="results"></main>
    <nav id="pagination"></nav>
  </section>

  <section id="page-about" class="page">
    <h2>Quem Somos</h2>
    <p>
      O Nexa nasceu para aproximar quem busca cuidado e beleza dos melhores salões do Brasil.
      Reunimos informações de endereço, avaliações e serviços em um só lugar, para que você
      encontre o salão ideal perto de você em poucos cliques.
    </p>
    <p>
      Nosso objetivo é valorizar profissionais da beleza, dando visibilidade a salões de todos
      os tamanhos e regiões, com uma experiência simples, elegante e direta.
    </p>
  </section>

  <section id="page-contact" class="page">
    <h2>Contato</h2>
    <p>Tem alguma dúvida, sugestão ou quer cadastrar seu salão? Fale com a gente.</p>
    <form id="contact-form">
      <label class="form-field">
        Nome
        <input id="contact-name" type="text" name="name" required autocomplete="name" />
      </label>
      <label class="form-field">
        E-mail
        <input id="contact-email" type="email" name="email" required autocomplete="email" />
      </label>
      <label class="form-field">
        Mensagem
        <textarea id="contact-message" name="message" rows="5" required></textarea>
      </label>
      <button type="submit" class="btn btn-whatsapp">Enviar</button>
    </form>
  </section>

  <footer id="site-footer">
    <div id="footer-inner">
      <div class="footer-col">
        <h3>Nexa</h3>
        <p>Onde a beleza encontra conexão.</p>
      </div>
      <div class="footer-col">
        <h4>Navegação</h4>
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
      </div>
      <div class="footer-col">
        <h4>Contato</h4>
        <a href="mailto:contato@nexa.com.br">contato@nexa.com.br</a>
      </div>
    </div>
    <div id="footer-bottom">
      <p>&copy; <span id="footer-year"></span> Nexa. Todos os direitos reservados.</p>
    </div>
  </footer>
`;

document.querySelector<HTMLSpanElement>("#footer-year")!.textContent = String(
  new Date().getFullYear(),
);

const menuBtn = document.querySelector<HTMLButtonElement>("#menu-btn")!;
const navMenu = document.querySelector<HTMLElement>("#nav-menu")!;
const pages: Record<string, HTMLElement> = {
  "/": document.querySelector<HTMLElement>("#page-home")!,
  "/quem-somos": document.querySelector<HTMLElement>("#page-about")!,
  "/contato": document.querySelector<HTMLElement>("#page-contact")!,
};
const contactForm = document.querySelector<HTMLFormElement>("#contact-form")!;

const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
const locateBtn = document.querySelector<HTMLButtonElement>("#locate-btn")!;
const locateStatus =
  document.querySelector<HTMLParagraphElement>("#locate-status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const pagination = document.querySelector<HTMLElement>("#pagination")!;
const mapContainer = document.querySelector<HTMLDivElement>("#map")!;
const ratingFilter =
  document.querySelector<HTMLSelectElement>("#rating-filter")!;
const serviceFilter =
  document.querySelector<HTMLSelectElement>("#service-filter")!;

initMap(mapContainer);

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

  document.querySelectorAll<HTMLAnchorElement>("#nav-menu a").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });

  if (route === "/") {
    invalidateMapSize();
  }

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

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

const PAGE_SIZE = 9;

let userLocation: { lat: number; lng: number } | null = null;
let searchTerm = "";
let minRating = 0;
let serviceTerm = "";
let currentPage = 1;

function matchesSearch(salon: Salon, term: string): boolean {
  if (!term) return true;
  const haystack =
    `${salon.name} ${salon.street} ${salon.city} ${salon.state}`.toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function renderStars(rating: number): string {
  const percent = Math.max(0, Math.min(rating, 5)) * 20;
  return `
    <div class="stars" role="img" aria-label="${rating} de 5 estrelas">
      <div class="stars-bg">★★★★★</div>
      <div class="stars-fg" style="width: ${percent}%">★★★★★</div>
    </div>
  `;
}

function renderCard(salon: Salon): string {
  const dist =
    userLocation != null
      ? formatDistance(
          distanceKm(userLocation.lat, userLocation.lng, salon.lat, salon.lng),
        )
      : null;

  const imageBlock = salon.imageUrl
    ? `<img class="salon-image" src="${salon.imageUrl}" alt="${salon.name}" />`
    : `<div class="salon-image salon-image-placeholder" aria-hidden="true">📷</div>`;

  return `
    <article class="salon-card">
      ${imageBlock}
      <div class="salon-card-header">
        <h2>${salon.name}</h2>
        ${dist ? `<span class="salon-distance">${dist}</span>` : ""}
      </div>
      <div class="salon-rating">
        ${renderStars(salon.rating)}
        <span class="salon-rating-value">${salon.rating.toFixed(1).replace(".0", "")}</span>
      </div>
      <p class="salon-address">${salon.street} — ${salon.city}/${salon.state}</p>
      <ul class="salon-services">
        ${salon.services.map((service) => `<li>${service}</li>`).join("")}
      </ul>
      <div class="salon-actions">
        <a
          class="btn btn-whatsapp"
          href="https://wa.me/${salon.whatsapp}"
          target="_blank"
          rel="noopener noreferrer"
        >WhatsApp</a>
        <a
          class="btn btn-instagram"
          href="https://instagram.com/${salon.instagram}"
          target="_blank"
          rel="noopener noreferrer"
        >Instagram</a>
      </div>
    </article>
  `;
}

function renderPagination(totalPages: number): string {
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

function render() {
  let list = salons.filter(
    (s) =>
      matchesSearch(s, searchTerm) &&
      s.rating >= minRating &&
      (!serviceTerm || s.services.includes(serviceTerm)),
  );

  if (userLocation) {
    const loc = userLocation;
    list = [...list].sort(
      (a, b) =>
        distanceKm(loc.lat, loc.lng, a.lat, a.lng) -
        distanceKm(loc.lat, loc.lng, b.lat, b.lng),
    );
  }

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const pageItems = list.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  results.innerHTML = pageItems.length
    ? pageItems.map(renderCard).join("")
    : `<p class="empty-state">Nenhum salão encontrado.</p>`;

  pagination.innerHTML = renderPagination(totalPages);
  updateMapSalons(list);
}

pagination.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-page]",
  );
  if (!target || target.disabled) return;

  currentPage = Number(target.dataset.page);
  render();
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  currentPage = 1;
  render();
});

ratingFilter.addEventListener("change", () => {
  minRating = Number(ratingFilter.value);
  currentPage = 1;
  render();
});

serviceFilter.addEventListener("change", () => {
  serviceTerm = serviceFilter.value;
  currentPage = 1;
  render();
});

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locateStatus.textContent = "Geolocalização não suportada neste navegador.";
    return;
  }

  locateStatus.textContent = "Obtendo sua localização...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locateStatus.textContent = "Mostrando salões ordenados por proximidade.";
      setUserLocation(userLocation.lat, userLocation.lng);
      currentPage = 1;
      render();
    },
    () => {
      locateStatus.textContent = "Não foi possível obter sua localização.";
    },
  );
});

render();
