import "./style.scss";
import { salons } from "./data";
import { distanceKm } from "./geo";
import { initMap, updateMapSalons, setUserLocation, invalidateMapSize } from "./map";
import { renderAppShell } from "./layout";
import { renderCard } from "./cards";
import { renderPagination, initPagination } from "./pagination";
import { initCardGallery } from "./gallery";
import { initRouter } from "./router";
import { matchesSearch, buildSuggestionsHtml } from "./search";
import { initServiceFilter } from "./serviceFilter";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = renderAppShell();

document.querySelector<HTMLSpanElement>("#footer-year")!.textContent = String(
  new Date().getFullYear(),
);

const pages: Record<string, HTMLElement> = {
  "/": document.querySelector<HTMLElement>("#page-home")!,
  "/quem-somos": document.querySelector<HTMLElement>("#page-about")!,
  "/contato": document.querySelector<HTMLElement>("#page-contact")!,
};

const contactForm = document.querySelector<HTMLFormElement>("#contact-form")!;
contactForm.addEventListener("submit", (event) => event.preventDefault());

const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
const searchBtn = document.querySelector<HTMLButtonElement>("#search-btn")!;
const searchSuggestions =
  document.querySelector<HTMLUListElement>("#search-suggestions")!;
const activeSearch = document.querySelector<HTMLDivElement>("#active-search")!;
const activeSearchTerm =
  document.querySelector<HTMLElement>("#active-search-term")!;
const clearSearchBtn =
  document.querySelector<HTMLButtonElement>("#clear-search-btn")!;
const locateBtn = document.querySelector<HTMLButtonElement>("#locate-btn")!;
const locateStatus =
  document.querySelector<HTMLParagraphElement>("#locate-status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const pagination = document.querySelector<HTMLElement>("#pagination")!;
const mapContainer = document.querySelector<HTMLDivElement>("#map")!;
const sortFilter = document.querySelector<HTMLSelectElement>("#sort-filter")!;
const ratingFilter =
  document.querySelector<HTMLSelectElement>("#rating-filter")!;

initMap(mapContainer);
initCardGallery(results);

initRouter({
  menuBtn: document.querySelector<HTMLButtonElement>("#menu-btn")!,
  navMenu: document.querySelector<HTMLElement>("#nav-menu")!,
  pages,
  onRouteChange: (route) => {
    if (route === "/") invalidateMapSize();
  },
});

const PAGE_SIZE = 9;

let userLocation: { lat: number; lng: number } | null = null;
let searchTerm = "";
let minRating = 0;
let selectedServices = new Set<string>();
let sortBy: "" | "distance" | "rating" = "";
let currentPage = 1;

initServiceFilter((selected) => {
  selectedServices = selected;
  currentPage = 1;
  render();
});

function render() {
  let list = salons.filter(
    (s) =>
      matchesSearch(s, searchTerm) &&
      s.rating >= minRating &&
      (!selectedServices.size ||
        s.services.some((service) => selectedServices.has(service))),
  );

  if (sortBy === "rating") {
    list = [...list].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "distance" && userLocation) {
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
    ? pageItems.map((salon) => renderCard(salon, userLocation)).join("")
    : `<p class="empty-state">Nenhum salão encontrado.</p>`;

  pagination.innerHTML = renderPagination(currentPage, totalPages);
  updateMapSalons(list);
}

initPagination(pagination, (page) => {
  currentPage = page;
  render();
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});

function hideSuggestions() {
  searchSuggestions.hidden = true;
  searchSuggestions.innerHTML = "";
}

function updateSuggestions() {
  const query = searchInput.value.trim();
  const html = query ? buildSuggestionsHtml(salons, query) : null;

  if (!html) {
    hideSuggestions();
    return;
  }

  searchSuggestions.innerHTML = html;
  searchSuggestions.hidden = false;
}

function updateActiveSearchChip() {
  if (searchTerm) {
    activeSearchTerm.textContent = searchTerm;
    activeSearch.hidden = false;
  } else {
    activeSearch.hidden = true;
  }
}

function commitSearch() {
  searchTerm = searchInput.value;
  currentPage = 1;
  hideSuggestions();
  updateActiveSearchChip();
  render();
}

clearSearchBtn.addEventListener("click", () => {
  searchTerm = "";
  searchInput.value = "";
  currentPage = 1;
  updateActiveSearchChip();
  render();
});

searchInput.addEventListener("input", updateSuggestions);

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim()) updateSuggestions();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    commitSearch();
  }
});

searchBtn.addEventListener("click", commitSearch);

searchSuggestions.addEventListener("click", (event) => {
  const item = (event.target as HTMLElement).closest<HTMLLIElement>(
    "li[data-value]",
  );
  if (!item) return;
  searchInput.value = item.dataset.value ?? "";
  commitSearch();
});

document.addEventListener("click", (event) => {
  const target = event.target as Node;
  if (
    !searchInput.contains(target) &&
    !searchSuggestions.contains(target) &&
    target !== searchBtn
  ) {
    hideSuggestions();
  }
});

ratingFilter.addEventListener("change", () => {
  minRating = Number(ratingFilter.value);
  currentPage = 1;
  render();
});

function requestLocation() {
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
}

locateBtn.addEventListener("click", () => {
  sortBy = "distance";
  sortFilter.value = "distance";
  requestLocation();
});

sortFilter.addEventListener("change", () => {
  sortBy = sortFilter.value as "" | "distance" | "rating";
  currentPage = 1;

  if (sortBy === "distance" && !userLocation) {
    requestLocation();
  } else {
    render();
  }
});

render();
