import "./style.css";
import { salons } from "./data";
import type { Salon } from "./types";
import { distanceKm, formatDistance } from "./geo";
import { initMap, updateMapSalons, setUserLocation } from "./map";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header id="topbar">
    <h1>Nexa</h1>
    <p class="subtitle">Onde a beleza encontra conexão</p>
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
  </header>

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
`;

const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
const locateBtn = document.querySelector<HTMLButtonElement>("#locate-btn")!;
const locateStatus =
  document.querySelector<HTMLParagraphElement>("#locate-status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const mapContainer = document.querySelector<HTMLDivElement>("#map")!;
const ratingFilter =
  document.querySelector<HTMLSelectElement>("#rating-filter")!;
const serviceFilter =
  document.querySelector<HTMLSelectElement>("#service-filter")!;

initMap(mapContainer);

let userLocation: { lat: number; lng: number } | null = null;
let searchTerm = "";
let minRating = 0;
let serviceTerm = "";

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

  results.innerHTML = list.length
    ? list.map(renderCard).join("")
    : `<p class="empty-state">Nenhum salão encontrado.</p>`;

  updateMapSalons(list);
}

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  render();
});

ratingFilter.addEventListener("change", () => {
  minRating = Number(ratingFilter.value);
  render();
});

serviceFilter.addEventListener("change", () => {
  serviceTerm = serviceFilter.value;
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
      render();
    },
    () => {
      locateStatus.textContent = "Não foi possível obter sua localização.";
    },
  );
});

render();
