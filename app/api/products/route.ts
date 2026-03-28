import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { mapProductRecord } from '@/lib/products'

export const revalidate = 60

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, description, price, image_url, gallery, is_active, sort_order, created_at, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/products error:', error)
      return NextResponse.json(
        { error: 'No se pudieron cargar los productos. Verifica la tabla public.products.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        products: Array.isArray(data) ? data.map((row) => mapProductRecord(row)) : [],
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/products exception:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}