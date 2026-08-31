import type { Salon } from "./types";
import { distanceKm, formatDistance } from "./geo";
import { escapeAttr } from "./utils";
import chevronLeftIcon from "@material-design-icons/svg/filled/chevron_left.svg?raw";
import chevronRightIcon from "@material-design-icons/svg/filled/chevron_right.svg?raw";
import whatsappIcon from "simple-icons/icons/whatsapp.svg?raw";
import instagramIcon from "simple-icons/icons/instagram.svg?raw";

const SERVICE_PHOTOS = [
  "/servicos/servico1.jpg",
  "/servicos/servico2.jpg",
  "/servicos/servico3.jpg",
];

function renderStars(rating: number): string {
  const percent = Math.max(0, Math.min(rating, 5)) * 20;
  return `
    <div class="stars" role="img" aria-label="${rating} de 5 estrelas">
      <div class="stars-bg">★★★★★</div>
      <div class="stars-fg" style="width: ${percent}%">★★★★★</div>
    </div>
  `;
}

export function renderCard(
  salon: Salon,
  userLocation: { lat: number; lng: number } | null,
): string {
  const dist =
    userLocation != null
      ? formatDistance(
          distanceKm(userLocation.lat, userLocation.lng, salon.lat, salon.lng),
        )
      : null;

  const images = salon.photos?.length
    ? salon.photos
    : salon.imageUrl
      ? [salon.imageUrl, ...SERVICE_PHOTOS]
      : SERVICE_PHOTOS;

  const galleryNav =
    images.length > 1
      ? `
        <button type="button" class="gallery-nav gallery-prev" aria-label="Foto anterior">${chevronLeftIcon}</button>
        <button type="button" class="gallery-nav gallery-next" aria-label="Próxima foto">${chevronRightIcon}</button>
        <span class="gallery-counter">1/${images.length}</span>
      `
      : "";

  const imageBlock = `
    <div class="card-gallery" data-index="0" data-images="${escapeAttr(JSON.stringify(images))}">
      <img class="salon-image" src="${images[0]}" alt="${salon.name}" />
      ${galleryNav}
    </div>
  `;

  return `
    <article class="salon-card">
      <div class="salon-card-media">${imageBlock}</div>
      <div class="salon-card-body">
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
          >${whatsappIcon} WhatsApp</a>
          ${
            salon.instagram
              ? `<a
            class="btn btn-instagram"
            href="https://instagram.com/${salon.instagram.replace(/^@/, "")}"
            target="_blank"
            rel="noopener noreferrer"
          >${instagramIcon} Instagram</a>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}
