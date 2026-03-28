import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { mapProductRecord, normalizeProductInput } from '@/lib/products'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function isCurrentUserAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, status: 401 as const }
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || roleData?.role !== 'admin') {
    return { ok: false, status: 403 as const }
  }

  return { ok: true as const }
}

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isLikelyUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const { id } = await context.params

    if (!isLikelyUuid(id)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 })
    }

    const body = await req.json()
    const normalized = normalizeProductInput(body)

    if (!normalized.data) {
      return NextResponse.json({ error: normalized.error || 'Datos inválidos' }, { status: 400 })
    }

    const supabaseAdmin = getAdminClient()

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        ...normalized.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, name, description, price, image_url, gallery, is_active, sort_order, created_at, updated_at')
      .single()

    if (error) {
      console.error('PUT /api/admin/products/[id] error:', error)
      return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: mapProductRecord(data) })
  } catch (error) {
    console.error('PUT /api/admin/products/[id] exception:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const { id } = await context.params

    if (!isLikelyUuid(id)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 })
    }

    const supabaseAdmin = getAdminClient()

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE /api/admin/products/[id] error:', error)
      return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] exception:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}