
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrarUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: {
          full_name: nombre,
        },
      },
    });

    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje(
        "Registro realizado. Revisa tu correo para confirmar tu cuenta si te lo solicita."
      );
      setNombre("");
      setCorreo("");
      setContrasena("");
    }

    setCargando(false);
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
          Crear cuenta
        </h1>

        <p className="mt-2 text-gray-600">
          Bienvenido al portal académico IINICIA.
        </p>

        <form onSubmit={registrarUsuario} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-teal-600"
              placeholder="Escribe tu nombre"
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-teal-600"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {mensaje && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700"
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
          >
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-teal-700 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
