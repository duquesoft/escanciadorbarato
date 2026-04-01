export default function PaymentMethods({
  className = "",
  title = "Metodos de pago aceptados",
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white/80 p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{title}</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-blue-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <img
            src="/img/payments/visa-logo.svg"
            alt="Visa"
            className="h-4 w-auto max-w-[76px] object-contain md:h-5 md:max-w-[88px]"
          />
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <span className="relative inline-flex h-4 w-6 shrink-0 items-center" aria-hidden="true">
            <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
            <span className="absolute left-2 h-4 w-4 rounded-full bg-[#f79e1b] opacity-95" />
          </span>
          <span className="whitespace-nowrap text-[9px] font-bold tracking-[0.01em] text-gray-700 md:text-[10px]">MASTERCARD</span>
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-sky-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <img
            src="/img/payments/paypal-logo.svg"
            alt="PayPal"
            className="h-5 w-auto max-w-[96px] object-contain md:h-6 md:max-w-[112px]"
          />
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-emerald-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <span className="text-[10px] font-black tracking-[0.02em] text-emerald-700 md:text-[11px]">CONTRA REEMBOLSO</span>
        </div>
      </div>
    </div>
  );
}
