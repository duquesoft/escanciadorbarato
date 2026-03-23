import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/make-admin
 * Convertir a un usuario en admin
 * PRIVADO: Solo para admins o desarrolladores
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar que sea admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que el usuario actual sea admin
    const { data: currentUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      )
    }

    // Hacer admin al usuario
    const { error } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role: 'admin' },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json(
        { error: 'Error actualizando usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
