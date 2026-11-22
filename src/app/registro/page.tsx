
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

  async function registrarUsuario(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      // Cerrar cualquier sesión anterior
      const { error: errorSalida } = await supabase.auth.signOut();

      if (errorSalida) {
        throw new Error("No se pudo cerrar la sesión anterior.");
      }

      // Registrar al nuevo usuario
      const { data, error } = await supabase.auth.signUp({
        email: correo.trim().toLowerCase(),
        password: contrasena,
        options: {
          data: {
            full_name: nombre.trim(),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Evitar que quede una sesión activa después del registro
      if (data.session) {
        const { error: errorCierre } = await supabase.auth.signOut();

        if (errorCierre) {
          throw new Error(
            "La cuenta se creó, pero no se pudo cerrar la sesión. Cierra sesión antes de continuar."
          );
        }
      }

      setMensaje(
        "Registro realizado. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."
      );

      setNombre("");
      setCorreo("");
      setContrasena("");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? "Error: " + error.message
          : "Ocurrió un error al realizar el registro. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-8 text-white">

      {/* Fondos tecnológicos */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#0864F5]/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00B9E8]/10 blur-[140px]" />

      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:55px_55px]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#10182B]/90 shadow-2xl shadow-black/40 lg:grid-cols-2">

        {/* Presentación institucional */}
        <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#101D3B] via-[#0C1530] to-[#080B18] p-8 md:p-12 lg:min-h-[720px]">

          <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border border-[#0864F5]/30" />
          <div className="pointer-events-none absolute -right-12 top-32 h-48 w-48 rounded-full border border-[#00B9E8]/30" />
          <div className="pointer-events-none absolute bottom-10 left-10 h-52 w-52 rounded-full bg-[#0864F5]/15 blur-[90px]" />

          <div className="relative z-10">
            <Link href="/" className="inline-block">
              <img
                src="/logo-iinicia.png"
                alt="IINICIA - Instituto de Innovación y Ciencias Aplicadas"
                className="h-32 w-44 object-contain object-left"
              />
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#00B9E8]/30 bg-[#00B9E8]/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00B9E8]" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#75E5FF]">
                Únete a nuestra comunidad
              </span>
            </div>

            <h1 className="mt-7 max-w-lg text-4xl font-black leading-tight md:text-5xl">
              Comienza a construir tu futuro con{" "}
              <span className="bg-gradient-to-r from-[#0864F5] to-[#00B9E8] bg-clip-text text-transparent">
                IINICIA.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              Crea tu cuenta y descubre un espacio donde la educación, la
              innovación y la tecnología se conectan.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 text-xl text-[#75E5FF]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-white">Aprende</p>
                  <p className="text-sm text-slate-400">
                    Amplía tus conocimientos y habilidades.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#00B9E8]/30 bg-[#00B9E8]/10 text-xl text-[#75E5FF]">
                  ◈
                </div>
                <div>
                  <p className="font-bold text-white">Desarrolla</p>
                  <p className="text-sm text-slate-400">
                    Impulsa tu crecimiento profesional.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 text-xl text-[#75E5FF]">
                  ✦
                </div>
                <div>
                  <p className="font-bold text-white">Innova</p>
                  <p className="text-sm text-slate-400">
                    Forma parte de una comunidad tecnológica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500">
              Instituto de Innovación y Ciencias Aplicadas
            </p>
          </div>
        </section>

        {/* Formulario de registro */}
        <section className="flex items-center justify-center bg-[#111A30] px-6 py-12 md:px-12 lg:px-14">

          <div className="w-full max-w-md">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-[#75E5FF]"
            >
              <span>←</span>
              Volver al inicio
            </Link>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Únete a IINICIA
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                Crear cuenta
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Completa tus datos para comenzar a utilizar el portal
                académico.
              </p>
            </div>

            <form onSubmit={registrarUsuario} className="mt-8 space-y-5">

              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-200"
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
                  placeholder="Escribe tu nombre completo"
                  className="w-full rounded-xl border border-white/10 bg-[#080F20] px-4 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[#0864F5] focus:ring-2 focus:ring-[#0864F5]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="correo"
                  className="mb-2 block text-sm font-semibold text-slate-200"
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
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080F20] px-4 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[#0864F5] focus:ring-2 focus:ring-[#0864F5]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="mb-2 block text-sm font-semibold text-slate-200"
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
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-white/10 bg-[#080F20] px-4 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[#0864F5] focus:ring-2 focus:ring-[#0864F5]/20"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Tu contraseña debe contener al menos 8 caracteres.
                </p>
              </div>

              {mensaje && (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 p-4 text-sm leading-6 text-[#A9D9FF]"
                >
                  {mensaje}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-xl bg-gradient-to-r from-[#0864F5] to-[#0878ED] px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-[#0052D6] hover:to-[#0864F5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargando ? "Registrando..." : "Crear mi cuenta →"}
              </button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-400">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#75E5FF] transition hover:text-white"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-600">
              IINICIA · Instituto de Innovación y Ciencias Aplicadas
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
