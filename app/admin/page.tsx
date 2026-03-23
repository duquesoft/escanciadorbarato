import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // Redirigir al dashboard
  redirect('/admin/dashboard')
}
