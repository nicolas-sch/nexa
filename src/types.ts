export interface Salon {
  id: string
  name: string
  street: string
  city: string
  state: string
  cep?: string
  lat: number
  lng: number
  whatsapp: string // digits only, with country code, e.g. 5511999999999
  instagram?: string // handle without @
  imageUrl?: string
  photos?: string[] // owner-uploaded photos, up to 10, takes priority over imageUrl when present
  cnpj?: string
  email?: string
  services: string[]
  rating: number // 0 to 5, half-points allowed
  plan: SalonPlan // controls listing priority and the "Salão Top" badge; owner-chosen at signup during the free launch period, admin-controlled once paid plans ship
}

export type SalonStatus = "pending" | "approved" | "rejected"

export type SalonPlan = "basic" | "top"

export interface SalonSubmission {
  name: string
  cnpj: string
  street: string
  city: string
  state: string
  cep?: string
  lat: number | null
  lng: number | null
  whatsapp: string
  instagram?: string
  email: string
  services: string[]
  photos: string[]
  plan: SalonPlan
}
