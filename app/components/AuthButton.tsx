'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Verificar si es admin
        if (user) {
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          setIsAdmin(userRole?.role === 'admin')
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.email}</span>
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
          >
            Admin
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Registrarse
      </Link>
    </div>
  )
}
