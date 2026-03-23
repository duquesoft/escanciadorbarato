import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/orders
 * Crear una nueva orden
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { product, price, quantity, total } = await req.json()

    // Validar datos
    if (!product || !price || !quantity || !total) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Crear orden
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          product,
          price,
          quantity,
          total,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error creando la orden' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, order },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders
 * Obtener órdenes del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Error obteniendo órdenes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
