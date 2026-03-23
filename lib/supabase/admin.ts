'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar si es admin
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (error || userRole?.role !== 'admin') {
    redirect('/')
  }

  return user
}

export async function getAllUsers() {
  const supabase = await createClient()

  // Primero verificar acceso admin
  await checkAdminAccess()

  // Obtener usuarios de Supabase Authentication
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data.users || []
}

export async function getAllOrders() {
  const supabase = await createClient()

  // Verificar acceso admin
  await checkAdminAccess()

  const { data, error } = await supabase
    .from('orders')
    .select('*, user_roles!inner(user_id)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export async function getOrdersByUser(userId: string) {
  const supabase = await createClient()

  // Verificar acceso admin
  await checkAdminAccess()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
    return []
  }

  return data || []
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  // Verificar acceso admin
  await checkAdminAccess()

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order:', error)
    return false
  }

  return true
}

export async function getAdminStats() {
  const supabase = await createClient()

  // Verificar acceso admin
  await checkAdminAccess()

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total, status')

  if (usersError || ordersError) {
    return null
  }

  const totalUsers = users?.users.length || 0
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  const completedOrders = orders?.filter((o) => o.status === 'completed').length || 0

  return {
    totalUsers,
    totalOrders,
    totalRevenue,
    completedOrders,
  }
}
