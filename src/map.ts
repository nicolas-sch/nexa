import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Salon } from './types'

const BRAZIL_CENTER: L.LatLngTuple = [-14.235, -51.9253]

const salonIcon = L.divIcon({
  className: 'salon-marker-icon',
  html: '<span></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const userIcon = L.divIcon({
  className: 'user-marker-icon',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

let map: L.Map
let markersLayer: L.LayerGroup
let userMarker: L.Marker | null = null

export function initMap(container: HTMLElement): void {
  map = L.map(container, { scrollWheelZoom: false }).setView(BRAZIL_CENTER, 4)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
}

export function updateMapSalons(salons: Salon[]): void {
  markersLayer.clearLayers()

  const markers = salons.map((salon) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${salon.lat},${salon.lng}`

    return L.marker([salon.lat, salon.lng], { icon: salonIcon })
      .bindPopup(
        `<strong>${salon.name}</strong><br>${salon.street} — ${salon.city}/${salon.state}` +
          `<div class="popup-directions">` +
          `<a class="popup-directions-btn" href="${googleMapsUrl}" target="_blank" rel="noopener">Ir até o salão</a>` +
          `</div>`,
      )
      .addTo(markersLayer)
  })

  if (markers.length) {
    const bounds = L.featureGroup(markers).getBounds()
    map.fitBounds(bounds.pad(0.3), { maxZoom: 12 })
  } else {
    map.setView(BRAZIL_CENTER, 4)
  }
}

export function invalidateMapSize(): void {
  map.invalidateSize()
}

export function setUserLocation(lat: number, lng: number): void {
  if (userMarker) {
    userMarker.setLatLng([lat, lng])
  } else {
    userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('Você está aqui')
  }
}
