import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { mapProductRecord, normalizeProductInput } from '@/lib/products'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const supabaseAdmin = getAdminClient()

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, description, price, image_url, gallery, is_active, sort_order, created_at, updated_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/admin/products error:', error)
      return NextResponse.json(
        { error: 'No se pudieron cargar los productos. Verifica la tabla public.products.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: Array.isArray(data) ? data.map((row) => mapProductRecord(row)) : [],
    })
  } catch (error) {
    console.error('GET /api/admin/products exception:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const body = await req.json()
    const normalized = normalizeProductInput(body)

    if (!normalized.data) {
      return NextResponse.json({ error: normalized.error || 'Datos inválidos' }, { status: 400 })
    }

    const supabaseAdmin = getAdminClient()

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(normalized.data)
      .select('id, name, description, price, image_url, gallery, is_active, sort_order, created_at, updated_at')
      .single()

    if (error) {
      console.error('POST /api/admin/products error:', error)
      return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: mapProductRecord(data) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/products exception:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}