export default function PaymentMethods({
  className = "",
  title = "Metodos de pago aceptados",
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white/80 p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{title}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-blue-200 bg-white px-3 shadow-sm">
          <span className="text-sm font-black tracking-wide text-[#1a1f71]">VISA</span>
        </div>

        <div className="inline-flex h-9 min-w-[116px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 shadow-sm">
          <span className="relative inline-flex h-4 w-8 items-center" aria-hidden="true">
            <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
            <span className="absolute left-2 h-4 w-4 rounded-full bg-[#f79e1b] opacity-95" />
          </span>
          <span className="text-xs font-bold tracking-wide text-gray-700">MASTERCARD</span>
        </div>

        <div className="inline-flex h-9 min-w-[96px] items-center justify-center rounded-lg border border-sky-200 bg-white px-3 shadow-sm">
          <span className="text-sm font-black tracking-wide text-[#003087]">PayPal</span>
        </div>

        <div className="inline-flex h-9 min-w-[150px] items-center justify-center rounded-lg border border-emerald-200 bg-white px-3 shadow-sm">
          <span className="text-xs font-black tracking-wide text-emerald-700">CONTRAREEMBOLSO</span>
        </div>
      </div>
    </div>
  );
}
