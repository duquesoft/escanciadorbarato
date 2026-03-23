'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Función para hacer admin a un usuario
 * USAR SOLO EN DESARROLLO O CON CONFIRMACIÓN MANUAL
 */
export async function makeUserAdmin(userId: string) {
  const supabase = await createClient()

  try {
    // Crear o actualizar tabla user_roles
    const { error } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role: 'admin' },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Error making user admin:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

/**
 * Función para revocar permisos de admin
 */
export async function removeAdminFromUser(userId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: 'user' })
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing admin:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}
