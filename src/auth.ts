import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

export interface SignUpResult {
  user: User
  /** false when the project requires email confirmation and the account isn't active yet. */
  confirmed: boolean
}

export async function signUp(
  email: string,
  password: string,
): Promise<SignUpResult> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/#/cadastro` },
  })
  if (error) throw error
  if (!data.user) throw new Error("Não foi possível criar a conta.")

  return { user: data.user, confirmed: data.session != null }
}

export async function signIn(email: string, password: string): Promise<User> {
  if (!supabase) throw new Error("Supabase não configurado.")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      throw new Error(
        "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
      )
    }
    throw error
  }

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
