"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartIcon from "./CartIcon";
import { AuthButton } from "./AuthButton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full bg-white/70 backdrop-blur-md shadow-sm py-3 px-4 flex items-center justify-between sticky top-0 z-50 relative">

      {/* IZQUIERDA: Botón Home o placeholder invisible */}
      {pathname !== "/" ? (
        <Link
          href="/"
          className="text-green-700 hover:text-green-900 font-semibold text-lg sm:text-xl whitespace-nowrap"
        >
          ← Página principal
        </Link>
      ) : (
        // Placeholder invisible (NO ocultar en PC)
        <span className="text-lg sm:text-xl opacity-0 select-none">
          ← Página principal
        </span>
      )}

      {/* DERECHA */}
      <div className="flex items-center gap-4">

        {/* Carrito + Icono */}
        <Link href="/carrito" className="flex items-center gap-1">
          <span className="text-black hover:text-green-900 font-semibold text-lg">
            Carrito
          </span>
          <CartIcon />
        </Link>

        {/* Hamburguesa móvil */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-4">
          <AuthButton />
        </nav>
      </div>

      {/* Menú móvil */}
      {open && (
        <nav className="absolute top-full left-0 w-full bg-white shadow-md flex flex-row items-center justify-around p-4 md:hidden z-50">
          <div onClick={() => setOpen(false)}>
            <AuthButton />
          </div>
        </nav>
      )}
    </header>
  );
}