
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

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      // Evitar que se reutilice una sesión o verificación anterior.
      sessionStorage.removeItem("mfaToken");
      sessionStorage.removeItem("idVerificacion");

      await supabase.auth.signOut();

      const respuesta = await fetch(
        "http://localhost:3001/api/autenticacion/iniciar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: correo.trim().toLowerCase(),
            contrasena,
          }),
        },
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudo iniciar sesión.",
        );
      }

      sessionStorage.setItem(
        "idVerificacion",
        resultado.idVerificacion,
      );

      router.push("/verificar-correo");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión. Inténtalo nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-8 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#0864F5]/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00B9E8]/10 blur-[140px]" />

      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:55px_55px]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#10182B]/90 shadow-2xl shadow-black/40 lg:grid-cols-2">
        <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#101D3B] via-[#0C1530] to-[#080B18] p-8 md:p-12 lg:min-h-[680px]">
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

            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-[#00B9E8]/30 bg-[#00B9E8]/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00B9E8]" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#75E5FF]">
                Portal académico
              </span>
            </div>

            <h1 className="mt-7 max-w-lg text-4xl font-black leading-tight md:text-5xl">
              El conocimiento abre{" "}
              <span className="bg-gradient-to-r from-[#0864F5] to-[#00B9E8] bg-clip-text text-transparent">
                nuevas posibilidades.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              Accede a tu espacio académico y continúa construyendo tu futuro
              con IINICIA.
            </p>
          </div>

          <div className="relative z-10 mt-12 hidden border-t border-white/10 pt-6 sm:block">
            <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-400">
              <span>✦ Innovación</span>
              <span>✦ Educación</span>
              <span>✦ Tecnología</span>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Instituto de Innovación y Ciencias Aplicadas
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#111A30] px-6 py-12 md:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-[#75E5FF]"
            >
              <span>←</span>
              Volver al inicio
            </Link>

            <div className="mt-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Bienvenido de nuevo
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                Iniciar sesión
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Ingresa tus credenciales para acceder al portal académico
                IINICIA.
              </p>
            </div>

            <form onSubmit={iniciarSesion} className="mt-9 space-y-6">
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
                  autoComplete="current-password"
                  placeholder="Escribe tu contraseña"
                  className="w-full rounded-xl border border-white/10 bg-[#080F20] px-4 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[#0864F5] focus:ring-2 focus:ring-[#0864F5]/20"
                />
              </div>

              {mensaje && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {mensaje}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-xl bg-gradient-to-r from-[#0864F5] to-[#0878ED] px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-[#0052D6] hover:to-[#0864F5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargando ? "Validando..." : "Continuar →"}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-7 text-center">
              <p className="text-sm text-slate-400">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-bold text-[#75E5FF] transition hover:text-white"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <p className="mt-10 text-center text-xs text-slate-600">
              IINICIA · Instituto de Innovación y Ciencias Aplicadas
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
