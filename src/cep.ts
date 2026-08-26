export interface CepAddress {
  street: string
  city: string
  state: string
}

export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) return null

    const data = await response.json()
    if (data.erro) return null

    return {
      street: data.logradouro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    }
  } catch {
    return null
  }
}
