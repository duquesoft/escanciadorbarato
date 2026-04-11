import React from "react";
export default function PoliticaPrivacidadPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Política de Privacidad</h1>
        <div className="space-y-6 text-gray-800 text-base md:text-lg">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">Recopilamos la siguiente información:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Datos de identificación (nombre, correo electrónico, teléfono)</li>
              <li>Información de envío y facturación</li>
              <li>Datos de navegación y uso del sitio web</li>
              <li>Información de dispositivo e IP</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo Usamos Tu Información</h2>
            <p className="mb-4">Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Procesar y entregar tus pedidos</li>
              <li>Enviar confirmaciones de compra</li>
              <li>Mejorar nuestros servicios</li>
              <li>Enviar información sobre promociones (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizacionales para proteger tu información personal contra acceso, alteración o destrucción no autorizados. Tu información se almacena de forma segura en servidores protegidos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
