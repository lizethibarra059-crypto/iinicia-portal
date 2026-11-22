
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ActualizarPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("Verificando el enlace...");
  const [sesionValida, setSesionValida] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (!activo) return;

      if (sesion) {
        setSesionValida(true);
        setMensaje("");
      } else if (evento === "INITIAL_SESSION") {
        setSesionValida(false);
        setMensaje(
          "No se encontró una sesión válida. El enlace puede haber caducado o no haberse procesado correctamente."
        );
      }
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function guardarPassword(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje("");

    if (password.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);

    try {
      const { data, error: errorSesion } =
        await supabase.auth.getSession();

      if (errorSesion || !data.session) {
        setSesionValida(false);
        setMensaje("La sesión no es válida. Solicita una nueva invitación.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMensaje(error.message);
        return;
      }

      setMensaje(
        "¡Contraseña creada correctamente! Te llevaremos al inicio de sesión."
      );

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch {
      setMensaje("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Crear contraseña
        </h1>

        <p className="mt-3 text-gray-600">
          Establece una contraseña para acceder a tu cuenta de IINICIA.
        </p>

        {sesionValida && (
          <form onSubmit={guardarPassword} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmacion"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmar contraseña
              </label>

              <input
                id="confirmacion"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Escribe la contraseña otra vez"
              />
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}

        {mensaje && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-gray-100 p-4 text-sm text-gray-800"
          >
            {mensaje}
          </p>
        )}
      </section>
    </main>
  );
}
