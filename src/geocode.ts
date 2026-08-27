export interface GeocodeResult {
  lat: number
  lng: number
}

const BR_STATES: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
}

export async function geocodeAddress(
  street: string,
  city: string,
  state: string,
): Promise<GeocodeResult | null> {
  const stateName = BR_STATES[state.trim().toUpperCase()] ?? state

  const params = new URLSearchParams({
    format: "json",
    countrycodes: "br",
    limit: "1",
    street,
    city,
    state: stateName,
    country: "Brasil",
  })

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`

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
