export interface Salon {
  id: string
  name: string
  street: string
  city: string
  state: string
  lat: number
  lng: number
  whatsapp: string // digits only, with country code, e.g. 5511999999999
  instagram?: string // handle without @
  imageUrl?: string
  photos?: string[] // owner-uploaded photos, up to 4, takes priority over imageUrl when present
  cnpj?: string
  email?: string
  services: string[]
  rating: number // 0 to 5, half-points allowed
}

export type SalonStatus = "pending" | "approved" | "rejected"

export interface SalonSubmission {
  name: string
  cnpj: string
  street: string
  city: string
  state: string
  lat: number | null
  lng: number | null
  whatsapp: string
  instagram?: string
  email: string
  services: string[]
  photos: string[]
}
