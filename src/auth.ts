import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

export async function signUp(
  email: string,
  password: string,
): Promise<User> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error("Não foi possível criar a conta.")

  return data.user
}

export async function signIn(email: string, password: string): Promise<User> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error

  return data.user
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null

  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}
