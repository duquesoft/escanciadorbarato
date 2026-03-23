'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Checkout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const product = {
    name: 'Escanciador automático',
    price: 79.90,
  }

  const total = product.price * quantity

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product.name,
          price: product.price,
          quantity: parseInt(quantity),
          total: total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pedido')
        return
      }

      // Redirigir a confirmación
      router.push('/confirmacion')
    } catch (err) {
      setError('Error al procesar el pedido')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Finalizar compra</h2>

      <div className="bg-white shadow p-6 rounded-lg">
        <div className="mb-6">
          <p className="mb-2 text-gray-600">Producto:</p>
          <p className="text-xl font-semibold text-gray-900">{product.name}</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Cantidad:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-20"
          />
        </div>

        <div className="mb-6 border-t border-b border-gray-300 py-4">
          <div className="flex justify-between mb-2">
            <span>Precio unitario:</span>
            <span>€{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow transition"
          >
            {loading ? 'Procesando...' : 'Procesar pago'}
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}