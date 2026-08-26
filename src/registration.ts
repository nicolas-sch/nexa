import L from "leaflet";
import type { SalonSubmission } from "./types";
import { geocodeAddress } from "./geocode";
import { signUp } from "./auth";
import { insertSalon, uploadSalonPhotos } from "./salonsApi";

const MAX_PHOTOS = 4;
const BRAZIL_CENTER: L.LatLngTuple = [-14.235, -51.9253];

export function initRegistrationForm(): void {
  const form = document.querySelector<HTMLFormElement>("#registration-form");
  if (!form) return;

  const nameInput = form.querySelector<HTMLInputElement>("#reg-name")!;
  const cnpjInput = form.querySelector<HTMLInputElement>("#reg-cnpj")!;
  const streetInput = form.querySelector<HTMLInputElement>("#reg-street")!;
  const cityInput = form.querySelector<HTMLInputElement>("#reg-city")!;
  const stateInput = form.querySelector<HTMLInputElement>("#reg-state")!;
  const phoneInput = form.querySelector<HTMLInputElement>("#reg-phone")!;
  const instagramInput =
    form.querySelector<HTMLInputElement>("#reg-instagram")!;
  const emailInput = form.querySelector<HTMLInputElement>("#reg-email")!;
  const passwordInput = form.querySelector<HTMLInputElement>("#reg-password")!;
  const photosInput = form.querySelector<HTMLInputElement>("#reg-photos")!;
  const photoPreview = form.querySelector<HTMLElement>("#reg-photo-preview")!;
  const locateBtn = form.querySelector<HTMLButtonElement>(
    "#reg-locate-address",
  )!;
  const mapContainer = form.querySelector<HTMLElement>("#reg-map")!;
  const statusEl = form.querySelector<HTMLElement>("#reg-status")!;
  const submitBtn = form.querySelector<HTMLButtonElement>("#reg-submit")!;

  let selectedFiles: File[] = [];
  let pickedLat: number | null = null;
  let pickedLng: number | null = null;
  let map: L.Map | null = null;
  let marker: L.Marker | null = null;

  function placeMarker(lat: number, lng: number) {
    mapContainer.hidden = false;

    if (!map) {
      map = L.map(mapContainer).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker!.getLatLng();
        pickedLat = pos.lat;
        pickedLng = pos.lng;
      });
    } else {
      map.setView([lat, lng], 15);
      marker!.setLatLng([lat, lng]);
    }

    pickedLat = lat;
    pickedLng = lng;
  }

  locateBtn.addEventListener("click", async () => {
    const street = streetInput.value.trim();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();

    if (!street || !city || !state) {
      statusEl.textContent =
        "Preencha rua, cidade e estado antes de localizar no mapa.";
      return;
    }

    statusEl.textContent = "Buscando endereço...";
    const result = await geocodeAddress(street, city, state);

    if (result) {
      placeMarker(result.lat, result.lng);
      statusEl.textContent =
        "Endereço encontrado. Arraste o pino se precisar ajustar.";
    } else {
      placeMarker(BRAZIL_CENTER[0], BRAZIL_CENTER[1]);
      statusEl.textContent =
        "Não encontramos o endereço automaticamente. Arraste o pino até o local certo.";
    }
  });

  photosInput.addEventListener("change", () => {
    const allFiles = Array.from(photosInput.files ?? []);
    selectedFiles = allFiles.slice(0, MAX_PHOTOS);

    photoPreview.innerHTML = selectedFiles
      .map((file) => `<img src="${URL.createObjectURL(file)}" alt="" />`)
      .join("");

    statusEl.textContent =
      allFiles.length > MAX_PHOTOS
        ? `Só é possível enviar até ${MAX_PHOTOS} fotos. As demais foram ignoradas.`
        : "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (pickedLat == null || pickedLng == null) {
      statusEl.textContent = "Localize o endereço no mapa antes de enviar.";
      return;
    }

    const services = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="reg-service"]:checked',
      ),
    ).map((input) => input.value);

    submitBtn.disabled = true;
    statusEl.textContent = "Enviando cadastro...";

    try {
      const user = await signUp(emailInput.value.trim(), passwordInput.value);
      const photos = selectedFiles.length
        ? await uploadSalonPhotos(selectedFiles)
        : [];

      const submission: SalonSubmission = {
        name: nameInput.value.trim(),
        cnpj: cnpjInput.value.trim(),
        street: streetInput.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        lat: pickedLat,
        lng: pickedLng,
        whatsapp: phoneInput.value.trim(),
        instagram: instagramInput.value.trim() || undefined,
        email: emailInput.value.trim(),
        services,
        photos,
      };

      await insertSalon(user.id, submission);

      form.hidden = true;
      statusEl.textContent =
        "Cadastro enviado! Seu salão vai passar por uma análise antes de aparecer no site.";
    } catch (error) {
      statusEl.textContent =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o cadastro.";
      submitBtn.disabled = false;
    }
  });
}
