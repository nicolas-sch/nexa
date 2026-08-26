// One-time migration: seeds the existing hardcoded salons (src/data.ts) into
// Supabase as approved, ownerless rows. Run once, locally, after the
// `salons` table exists (supabase/migrations/0001_salons.sql applied).
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (service role
// key bypasses RLS — never commit it, never ship it to the browser bundle).
//
// Usage: npx tsx scripts/seedSalons.ts

import { createClient } from "@supabase/supabase-js"
import WebSocket from "ws"
import { salons } from "../src/data"

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
  )
  process.exit(1)
}

// Node 20 has no global WebSocket; the JS client only needs it to init an
// (unused, for this script) realtime channel, so hand it a Node polyfill.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  realtime: { transport: WebSocket as never },
})

async function seed() {
  const rows = salons.map((salon, index) => ({
    name: salon.name,
    // Legacy seed data has no real CNPJ; synthesize a unique placeholder
    // (a shared dummy value would collide with the unique CNPJ index).
    cnpj: `00${String(index).padStart(12, "0")}`,
    street: salon.street,
    city: salon.city,
    state: salon.state,
    lat: salon.lat,
    lng: salon.lng,
    whatsapp: salon.whatsapp,
    instagram: salon.instagram ?? null,
    email: "contato@nexa.com.br",
    services: salon.services,
    photos: [],
    rating: salon.rating,
    status: "approved",
    owner_id: null,
  }))

  const { error, count } = await supabase
    .from("salons")
    .insert(rows, { count: "exact" })

  if (error) {
    console.error("Seed failed:", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${count ?? rows.length} salons.`)
}

seed()
