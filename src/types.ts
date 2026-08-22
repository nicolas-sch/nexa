export interface Salon {
  id: string
  name: string
  street: string
  city: string
  state: string
  lat: number
  lng: number
  whatsapp: string // digits only, with country code, e.g. 5511999999999
  instagram: string // handle without @
  imageUrl?: string
  services: string[]
  rating: number // 0 to 5, half-points allowed
}
