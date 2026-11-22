
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:3001/api/autenticacion";

type ResultadoVerificacion = {
  access_token?: string;
  refresh_token?: string;
  mfa_token?: string;
  message?: string;
};

export default function VerificarCorreoPage() {
  const router = useRouter();

  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function verificarCodigo(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMensaje("");

    const idVerificacion = sessionStorage.getItem("idVerificacion");

    if (!idVerificacion) {
      setMensaje("La solicitud expiró. Inicia sesión nuevamente.");
      return;
    }

    if (codigo.length !== 6) {
      setMensaje("Introduce los seis dígitos del código.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API}/verificar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idVerificacion,
          codigo,
        }),
      });

      const resultado: ResultadoVerificacion = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudo verificar el código."
        );
      }

      if (
        !resultado.access_token ||
        !resultado.refresh_token ||
        !resultado.mfa_token
      ) {
        throw new Error(
          "El servidor no devolvió todos los datos de autenticación. Revisa el backend."
        );
      }

      const { error } = await supabase.auth.setSession({
        access_token: resultado.access_token,
        refresh_token: resultado.refresh_token,
      });

      if (error) {
        throw new Error(
          "No se pudo establecer la sesión de Supabase: " + error.message
        );
      }

      // Guardar el token MFA después de establecer la sesión.
      sessionStorage.setItem("mfaToken", resultado.mfa_token);

      // Comprobar que el token quedó guardado.
      const tokenGuardado = sessionStorage.getItem("mfaToken");

      if (!tokenGuardado) {
        await supabase.auth.signOut();
        throw new Error("No se pudo guardar el token MFA.");
      }

      sessionStorage.removeItem("idVerificacion");

      // Ir al panel después de completar los dos factores.
      router.replace("/panel");
      router.refresh();

    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al verificar el código."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B18] px-4 py-8 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111A30] p-8 shadow-2xl">

        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0864F5]/15 text-3xl">
            ✉
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#00B9E8]">
            Seguridad IINICIA
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Verifica tu correo
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            Hemos enviado un código de seguridad a tu correo electrónico.
            Escríbelo para continuar.
          </p>
        </div>

        <form onSubmit={verificarCodigo} className="space-y-6">
          <div>
            <label
              htmlFor="codigo"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Código de seis dígitos
            </label>

            <input
              id="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(e) =>
                setCodigo(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              required
              placeholder="000000"
              className="w-full rounded-xl border border-white/10 bg-[#080F20] px-4 py-5 text-center text-3xl font-bold tracking-[0.5em] text-white outline-none focus:border-[#0864F5] focus:ring-2 focus:ring-[#0864F5]/20"
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
            disabled={cargando || codigo.length !== 6}
            className="w-full rounded-xl bg-gradient-to-r from-[#0864F5] to-[#0878ED] px-5 py-4 font-bold text-white transition hover:from-[#0052D6] hover:to-[#0864F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando ? "Verificando..." : "Verificar código →"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-500">
          IINICIA · Instituto de Innovación y Ciencias Aplicadas
        </p>

      </section>
    </main>
  );
}
