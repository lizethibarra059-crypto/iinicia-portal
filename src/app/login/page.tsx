
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena,
      });

      if (error) {
        setMensaje(
          "No se pudo iniciar sesión. Verifica tu correo y contraseña."
        );
        return;
      }

      router.replace("/panel");
      router.refresh();
    } catch {
      setMensaje(
        "Ocurrió un error al iniciar sesión. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link
          href="/"
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-gray-600">
          Ingresa al portal académico IINICIA.
        </p>

        <form onSubmit={iniciarSesion} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="correo"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>

            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-teal-600"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="contrasena"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>

            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-teal-600"
              placeholder="Escribe tu contraseña"
            />
          </div>

          {mensaje && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-teal-700 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  );
}
