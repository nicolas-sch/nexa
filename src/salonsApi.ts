import type { Salon, SalonSubmission } from "./types"
import { supabase, SALON_PHOTOS_BUCKET } from "./supabaseClient"

const SALON_COLUMNS =
  "id,name,cnpj,street,city,state,cep,lat,lng,whatsapp,instagram,email,services,photos,rating"

interface SalonRow {
  id: string
  name: string
  cnpj: string | null
  street: string
  city: string
  state: string
  cep: string | null
  lat: number | null
  lng: number | null
  whatsapp: string
  instagram: string | null
  email: string | null
  services: string[]
  photos: string[]
  rating: number
}

function rowToSalon(row: SalonRow): Salon | null {
  if (row.lat == null || row.lng == null) return null

  return {
    id: row.id,
    name: row.name,
    street: row.street,
    city: row.city,
    state: row.state,
    cep: row.cep ?? undefined,
    lat: row.lat,
    lng: row.lng,
    whatsapp: row.whatsapp,
    instagram: row.instagram ?? undefined,
    email: row.email ?? undefined,
    cnpj: row.cnpj ?? undefined,
    photos: row.photos.length ? row.photos : undefined,
    services: row.services,
    rating: row.rating,
  }
}

export async function fetchApprovedSalons(): Promise<Salon[]> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase
    .from("salons")
    .select(SALON_COLUMNS)
    .eq("status", "approved")

  if (error) throw error

  return (data as SalonRow[]).map(rowToSalon).filter((s): s is Salon => s !== null)
}

export async function fetchOwnSalon(ownerId: string): Promise<Salon | null> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase
    .from("salons")
    .select(SALON_COLUMNS)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return rowToSalon(data as SalonRow)
}

export async function insertSalon(
  ownerId: string,
  submission: SalonSubmission,
): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase
    .from("salons")
    .insert({
      owner_id: ownerId,
      name: submission.name,
      cnpj: submission.cnpj,
      street: submission.street,
      city: submission.city,
      state: submission.state,
      cep: submission.cep || null,
      lat: submission.lat,
      lng: submission.lng,
      whatsapp: submission.whatsapp,
      instagram: submission.instagram || null,
      email: submission.email,
      services: submission.services,
      photos: submission.photos,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function updateOwnSalon(
  id: string,
  patch: Partial<SalonSubmission>,
): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { error } = await supabase.from("salons").update(patch).eq("id", id)
  if (error) throw error
}

export async function uploadSalonPhotos(files: File[]): Promise<string[]> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const limited = files.slice(0, 10)
  const urls: string[] = []

  for (const file of limited) {
    const path = `${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage
      .from(SALON_PHOTOS_BUCKET)
      .upload(path, file)

    if (error) throw error

    const { data } = supabase.storage.from(SALON_PHOTOS_BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}
