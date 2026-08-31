import L from "leaflet";
import type { Salon, SalonSubmission } from "./types";
import { geocodeAddress } from "./geocode";
import { lookupCep } from "./cep";
import { signIn, signUp, signOut, getCurrentUser } from "./auth";
import { fetchOwnSalon, insertSalon, updateOwnSalon, uploadSalonPhotos } from "./salonsApi";

const MAX_PHOTOS = 10;
const BRAZIL_CENTER: L.LatLngTuple = [-14.235, -51.9253];

function parseStoredStreet(value: string): {
  street: string;
  number: string;
  complement: string;
} {
  const match = value.match(/^(.*),\s*([^,-]+?)(?:\s*-\s*(.*))?$/);
  if (!match) return { street: value, number: "", complement: "" };

  return {
    street: match[1].trim(),
    number: match[2].trim(),
    complement: (match[3] ?? "").trim(),
  };
}

export function initRegistrationForm(): void {
  const authView = document.querySelector<HTMLElement>("#salon-auth-view")!;
  const formView = document.querySelector<HTMLElement>("#salon-form-view")!;
  const form = document.querySelector<HTMLFormElement>("#registration-form")!;

  const authForm = document.querySelector<HTMLFormElement>("#salon-auth-form")!;
  const authEmailInput = document.querySelector<HTMLInputElement>("#auth-email")!;
  const authPasswordInput =
    document.querySelector<HTMLInputElement>("#auth-password")!;
  const authStatus = document.querySelector<HTMLElement>("#salon-auth-status")!;
  const authSubmit = document.querySelector<HTMLButtonElement>(
    "#salon-auth-submit",
  )!;
  const authToggle = document.querySelector<HTMLButtonElement>(
    "#salon-auth-toggle",
  )!;
  const authSubtitle = document.querySelector<HTMLElement>(
    "#salon-auth-subtitle",
  )!;

  const headerUser = document.querySelector<HTMLElement>("#header-user")!;
  const headerUserValue = document.querySelector<HTMLElement>(
    "#header-user-value",
  )!;
  const formTitle = document.querySelector<HTMLElement>("#salon-form-title")!;
  const logoutBtn = document.querySelector<HTMLButtonElement>(
    "#header-logout-btn",
  )!;

  const nameInput = form.querySelector<HTMLInputElement>("#reg-name")!;
  const cnpjInput = form.querySelector<HTMLInputElement>("#reg-cnpj")!;
  const cepInput = form.querySelector<HTMLInputElement>("#reg-cep")!;
  const streetInput = form.querySelector<HTMLInputElement>("#reg-street")!;
  const numberInput = form.querySelector<HTMLInputElement>("#reg-number")!;
  const complementInput =
    form.querySelector<HTMLInputElement>("#reg-complement")!;
  const cityInput = form.querySelector<HTMLInputElement>("#reg-city")!;
  const stateInput = form.querySelector<HTMLInputElement>("#reg-state")!;
  const phoneInput = form.querySelector<HTMLInputElement>("#reg-phone")!;
  const instagramInput =
    form.querySelector<HTMLInputElement>("#reg-instagram")!;
  const emailInput = form.querySelector<HTMLInputElement>("#reg-email")!;
  const photosInput = form.querySelector<HTMLInputElement>("#reg-photos")!;
  const photoPreview = form.querySelector<HTMLElement>("#reg-photo-preview")!;
  const mapContainer = form.querySelector<HTMLElement>("#reg-map")!;
  const statusEl = form.querySelector<HTMLElement>("#reg-status")!;
  const submitBtn = form.querySelector<HTMLButtonElement>("#reg-submit")!;

  let selectedFiles: File[] = [];
  let existingPhotos: string[] = [];
  let pickedLat: number | null = null;
  let pickedLng: number | null = null;
  let map: L.Map | null = null;
  let marker: L.Marker | null = null;
  let authMode: "signin" | "signup" = "signin";
  let editingSalonId: string | null = null;

  function streetLine(): string {
    return [streetInput.value.trim(), numberInput.value.trim()]
      .filter(Boolean)
      .join(", ");
  }

  function fullStreetAddress(): string {
    const line = streetLine();
    const complement = complementInput.value.trim();
    return complement ? `${line} - ${complement}` : line;
  }

  function renderPhotoPreview() {
    const existingHtml = existingPhotos
      .map(
        (url, index) => `
          <div class="photo-thumb" data-kind="existing" data-index="${index}">
            <img src="${url}" alt="" />
            <button type="button" class="photo-remove" aria-label="Remover foto">✕</button>
          </div>
        `,
      )
      .join("");

    const newHtml = selectedFiles
      .map(
        (file, index) => `
          <div class="photo-thumb" data-kind="new" data-index="${index}">
            <img src="${URL.createObjectURL(file)}" alt="" />
            <button type="button" class="photo-remove" aria-label="Remover foto">✕</button>
          </div>
        `,
      )
      .join("");

    photoPreview.innerHTML = existingHtml + newHtml;
  }

  photoPreview.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      ".photo-remove",
    );
    if (!btn) return;

    const thumb = btn.closest<HTMLElement>(".photo-thumb")!;
    const index = Number(thumb.dataset.index);

    if (thumb.dataset.kind === "existing") {
      existingPhotos.splice(index, 1);
    } else {
      selectedFiles.splice(index, 1);
    }

    renderPhotoPreview();
  });

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

  function resetForm() {
    form.reset();
    photoPreview.innerHTML = "";
    mapContainer.hidden = true;
    selectedFiles = [];
    existingPhotos = [];
    pickedLat = null;
    pickedLng = null;
    editingSalonId = null;
    statusEl.textContent = "";
  }

  function populateFormForEdit(salon: Salon) {
    editingSalonId = salon.id;
    nameInput.value = salon.name;
    cnpjInput.value = salon.cnpj ?? "";
    cepInput.value = salon.cep ?? "";

    const parsed = parseStoredStreet(salon.street);
    streetInput.value = parsed.street;
    numberInput.value = parsed.number;
    complementInput.value = parsed.complement;

    cityInput.value = salon.city;
    stateInput.value = salon.state;
    phoneInput.value = salon.whatsapp;
    instagramInput.value = salon.instagram ?? "";
    emailInput.value = salon.email ?? "";

    form.querySelectorAll<HTMLInputElement>('input[name="reg-service"]').forEach(
      (checkbox) => {
        checkbox.checked = salon.services.includes(checkbox.value);
      },
    );

    existingPhotos = [...(salon.photos ?? [])];
    renderPhotoPreview();

    placeMarker(salon.lat, salon.lng);

    formTitle.textContent = "Editar meu salão";
    submitBtn.textContent = "Salvar alterações";
  }

  async function showAppropriateView() {
    const user = await getCurrentUser();

    if (!user) {
      authView.hidden = false;
      formView.hidden = true;
      headerUser.hidden = true;
      return;
    }

    authView.hidden = true;
    formView.hidden = false;
    headerUser.hidden = false;
    headerUserValue.textContent = user.email ?? "";

    resetForm();
    formTitle.textContent = "Cadastre seu salão";
    submitBtn.textContent = "Cadastrar salão";
    emailInput.value = user.email ?? "";

    const existing = await fetchOwnSalon(user.id);
    if (existing) populateFormForEdit(existing);
  }

  authToggle.addEventListener("click", () => {
    authMode = authMode === "signin" ? "signup" : "signin";
    authStatus.textContent = "";

    if (authMode === "signup") {
      authSubtitle.textContent =
        "Crie uma conta com e-mail e senha para cadastrar seu salão.";
      authSubmit.textContent = "Criar conta";
      authToggle.textContent = "Já tem conta? Entrar";
    } else {
      authSubtitle.textContent =
        "Entre com seu e-mail e senha para cadastrar ou editar seu salão.";
      authSubmit.textContent = "Entrar";
      authToggle.textContent = "Não tem conta? Criar conta";
    }
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    authSubmit.disabled = true;
    authStatus.textContent =
      authMode === "signup" ? "Criando conta..." : "Entrando...";

    try {
      if (authMode === "signup") {
        const { confirmed } = await signUp(email, password);

        if (!confirmed) {
          authForm.reset();
          authStatus.textContent = `Enviamos um e-mail de confirmação para ${email}. Clique no link recebido para ativar sua conta e continuar o cadastro do salão.`;
          return;
        }
      } else {
        await signIn(email, password);
      }

      authForm.reset();
      authStatus.textContent = "";
      await showAppropriateView();
    } catch (error) {
      authStatus.textContent =
        error instanceof Error ? error.message : "Não foi possível entrar.";
    } finally {
      authSubmit.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut();
    resetForm();
    authForm.reset();
    authStatus.textContent = "";
    await showAppropriateView();
  });

  cepInput.addEventListener("input", () => {
    const digits = cepInput.value.replace(/\D/g, "").slice(0, 8);
    cepInput.value =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;

    if (digits.length !== 8) return;

    statusEl.textContent = "Buscando endereço pelo CEP...";
    lookupCep(digits).then((address) => {
      if (!address) {
        statusEl.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
        return;
      }

      if (address.street) streetInput.value = address.street;
      if (address.city) cityInput.value = address.city;
      if (address.state) stateInput.value = address.state;

      statusEl.textContent = "Endereço preenchido pelo CEP. Complete o número.";
      numberInput.focus();
    });
  });

  async function resolveLocation() {
    if (pickedLat != null && pickedLng != null) return;

    const street = streetLine();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();

    const result = await geocodeAddress(street, city, state);

    if (result) {
      placeMarker(result.lat, result.lng);
    } else {
      placeMarker(BRAZIL_CENTER[0], BRAZIL_CENTER[1]);
    }
  }

  photosInput.addEventListener("change", () => {
    const chosenFiles = Array.from(photosInput.files ?? []);
    const remainingSlots =
      MAX_PHOTOS - existingPhotos.length - selectedFiles.length;
    const filesToAdd = chosenFiles.slice(0, Math.max(0, remainingSlots));

    selectedFiles = [...selectedFiles, ...filesToAdd];
    photosInput.value = "";
    renderPhotoPreview();

    statusEl.textContent =
      chosenFiles.length > filesToAdd.length
        ? `Só é possível ter até ${MAX_PHOTOS} fotos no total. Algumas não foram adicionadas.`
        : "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const services = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="reg-service"]:checked',
      ),
    ).map((input) => input.value);

    submitBtn.disabled = true;
    statusEl.textContent = "Enviando...";

    try {
      await resolveLocation();

      const user = await getCurrentUser();
      if (!user) throw new Error("Sua sessão expirou. Entre novamente.");

      const uploadedUrls = selectedFiles.length
        ? await uploadSalonPhotos(selectedFiles)
        : [];
      const photos = [...existingPhotos, ...uploadedUrls].slice(0, MAX_PHOTOS);

      const submission: SalonSubmission = {
        name: nameInput.value.trim(),
        cnpj: cnpjInput.value.trim(),
        street: fullStreetAddress(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        cep: cepInput.value.trim() || undefined,
        lat: pickedLat,
        lng: pickedLng,
        whatsapp: phoneInput.value.trim(),
        instagram: instagramInput.value.trim() || undefined,
        email: emailInput.value.trim(),
        services,
        photos,
      };

      if (editingSalonId) {
        await updateOwnSalon(editingSalonId, submission);
        statusEl.textContent = "Alterações salvas!";
      } else {
        editingSalonId = await insertSalon(user.id, submission);
        formTitle.textContent = "Editar meu salão";
        submitBtn.textContent = "Salvar alterações";
        statusEl.textContent =
          "Cadastro enviado! Seu salão vai passar por uma análise antes de aparecer no site.";
      }

      existingPhotos = photos;
      selectedFiles = [];
      renderPhotoPreview();
    } catch (error) {
      statusEl.textContent =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o cadastro.";
    } finally {
      submitBtn.disabled = false;
    }
  });

  showAppropriateView();
}
