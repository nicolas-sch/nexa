export interface GeocodeResult {
  lat: number
  lng: number
}

export async function geocodeAddress(
  street: string,
  city: string,
  state: string,
): Promise<GeocodeResult | null> {
  const query = `${street}, ${city}, ${state}, Brasil`
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&q=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const results = (await response.json()) as { lat: string; lon: string }[]
    if (!results.length) return null

    return { lat: Number(results[0].lat), lng: Number(results[0].lon) }
  } catch {
    return null
  }
}
