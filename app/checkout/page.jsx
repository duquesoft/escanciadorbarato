export default function Checkout() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Finalizar compra</h2>

      <div className="bg-white shadow p-6 rounded-lg">
        <p className="mb-4">Producto: <strong>Escanciador automático</strong></p>
        <p className="mb-4">Precio: <strong>79,90 €</strong></p>

        <p className="mb-6 text-gray-600">
          Aquí iría el formulario de pago de Stripe.
        </p>

        <a
          href="/confirmacion"
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow"
        >
          Simular pago completado
        </a>
      </div>
    </div>
  );
}