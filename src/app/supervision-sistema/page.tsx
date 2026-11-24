
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:3001";

type EstadoServicio = {
  nombre: string;
  descripcion: string;
  estado: "cargando" | "disponible" | "error";
  mensaje: string;
  codigo?: number;
  tiempo?: number;
  ultimaRevision?: string;
};

const serviciosIniciales: EstadoServicio[] = [
  {
    nombre: "Portal IINICIA",
    descripcion: "Interfaz principal de la plataforma.",
    estado: "disponible",
    mensaje: "La página de supervisión está funcionando.",
  },
  {
    nombre: "Servidor NestJS",
    descripcion: "Comunicación con el servidor backend.",
    estado: "cargando",
    mensaje: "Comprobando conexión...",
  },
  {
    nombre: "Base de datos Supabase",
    descripcion: "Conexión del backend con Supabase.",
    estado: "cargando",
    mensaje: "Comprobando conexión...",
  },
  {
    nombre: "Moodle",
    descripcion: "Estado de la integración con la plataforma académica.",
    estado: "cargando",
    mensaje: "Comprobando conexión...",
  },
];

function formatoHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SupervisionSistemaPage() {
  const router = useRouter();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [servicios, setServicios] =
    useState<EstadoServicio[]>(serviciosIniciales);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaRevision, setUltimaRevision] = useState("");
  const [errorAcceso, setErrorAcceso] = useState("");

  useEffect(() => {
    let activo = true;

    async function verificarAcceso() {
      try {
        const { data: sesionData, error: sesionError } =
          await supabase.auth.getSession();

        if (!activo) return;

        if (sesionError || !sesionData.session) {
          router.replace("/login");
          return;
        }

        const mfaToken = sessionStorage.getItem("mfaToken");

        if (!mfaToken) {
          await supabase.auth.signOut();
          if (activo) router.replace("/login");
          return;
        }

        const respuestaMfa = await fetch(
          `${API}/api/autenticacion/validar`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sesionData.session.access_token}`,
              "X-MFA-Token": mfaToken,
            },
          }
        );

        if (!activo) return;

        if (!respuestaMfa.ok) {
          sessionStorage.removeItem("mfaToken");
          sessionStorage.removeItem("idVerificacion");
          await supabase.auth.signOut();

          if (activo) router.replace("/login");
          return;
        }

        const { data: usuarioData, error: usuarioError } =
          await supabase.auth.getUser();

        if (!activo) return;

        if (usuarioError || !usuarioData.user) {
          router.replace("/login");
          return;
        }

        const { data: perfil, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", usuarioData.user.id)
          .single();

        if (!activo) return;

        if (error || !perfil) {
          setErrorAcceso("No fue posible consultar tu perfil.");
          setCargandoPerfil(false);
          return;
        }

        if (perfil.role !== "superadministrador") {
          router.replace("/panel");
          return;
        }

        setNombreUsuario(perfil.full_name || "Superadministrador");
        setCargandoPerfil(false);
      } catch {
        if (!activo) return;
        setErrorAcceso("Ocurrió un problema al verificar tu acceso.");
        setCargandoPerfil(false);
      }
    }

    verificarAcceso();

    return () => {
      activo = false;
    };
  }, [router]);

  const comprobarServicios = useCallback(async () => {
    setActualizando(true);

    const ahora = new Date().toISOString();

    setServicios((anteriores) =>
      anteriores.map((servicio) =>
        servicio.nombre === "Portal IINICIA"
          ? {
              ...servicio,
              estado: "disponible",
              mensaje: "Interfaz funcionando correctamente.",
              ultimaRevision: ahora,
            }
          : {
              ...servicio,
              estado: "cargando",
              mensaje: "Comprobando conexión...",
            }
      )
    );

    const { data: sesionData } = await supabase.auth.getSession();
    const mfaToken = sessionStorage.getItem("mfaToken");

    if (!sesionData.session || !mfaToken) {
      setActualizando(false);
      router.replace("/login");
      return;
    }

    const headers = {
      Authorization: `Bearer ${sesionData.session.access_token}`,
      "X-MFA-Token": mfaToken,
    };

    const comprobar = async (
      nombre: string,
      ruta: string
    ): Promise<EstadoServicio> => {
      const inicio = performance.now();

      try {
        const respuesta = await fetch(`${API}${ruta}`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const tiempo = Math.round(performance.now() - inicio);

        return {
          nombre,
          descripcion:
            nombre === "Servidor NestJS"
              ? "Comunicación con el servidor backend."
              : nombre === "Base de datos Supabase"
                ? "Conexión del backend con Supabase."
                : "Estado de la integración con la plataforma académica.",
          estado: respuesta.ok ? "disponible" : "error",
          mensaje: respuesta.ok
            ? "El servicio respondió correctamente."
            : `El servicio respondió con un error HTTP ${respuesta.status}.`,
          codigo: respuesta.status,
          tiempo,
          ultimaRevision: new Date().toISOString(),
        };
      } catch {
        return {
          nombre,
          descripcion:
            nombre === "Servidor NestJS"
              ? "Comunicación con el servidor backend."
              : nombre === "Base de datos Supabase"
                ? "Conexión del backend con Supabase."
                : "Estado de la integración con la plataforma académica.",
          estado: "error",
          mensaje: "No fue posible establecer conexión con el servicio.",
          ultimaRevision: new Date().toISOString(),
        };
      }
    };

    const resultados = await Promise.all([
      comprobar("Servidor NestJS", "/api/estado"),
      comprobar("Base de datos Supabase", "/api/roles/estado-supabase"),
      comprobar("Moodle", "/moodle/estado"),
    ]);

    setServicios((anteriores) => {
      const portal = anteriores.find(
        (servicio) => servicio.nombre === "Portal IINICIA"
      );

      return portal ? [portal, ...resultados] : resultados;
    });

    setUltimaRevision(new Date().toISOString());
    setActualizando(false);
  }, [router]);

  useEffect(() => {
    if (!cargandoPerfil && !errorAcceso) {
      comprobarServicios();
    }
  }, [cargandoPerfil, errorAcceso, comprobarServicios]);

  if (cargandoPerfil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
          <p className="mt-5 text-sm text-slate-400">
            Verificando acceso...
          </p>
        </div>
      </main>
    );
  }

  if (errorAcceso) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] px-4 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111A30] p-8 text-center">
          <h1 className="text-xl font-bold">
            No se pudo abrir la supervisión
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {errorAcceso}
          </p>
          <Link
            href="/panel"
            className="mt-6 inline-block rounded-xl bg-[#0864F5] px-6 py-3 font-bold text-white"
          >
            Volver al panel
          </Link>
        </section>
      </main>
    );
  }

  const disponibles = servicios.filter(
    (servicio) => servicio.estado === "disponible"
  ).length;

  const errores = servicios.filter(
    (servicio) => servicio.estado === "error"
  ).length;

  const pendientes = servicios.filter(
    (servicio) => servicio.estado === "cargando"
  ).length;

  const todoCorrecto = errores === 0 && pendientes === 0;

  return (
    <main className="min-h-screen bg-[#080B18] text-white">
      <header className="border-b border-white/10 bg-[#0B1020]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/panel">
              <img
                src="/logo-iinicia.png"
                alt="IINICIA"
                className="h-16 w-28 object-contain"
              />
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Superadministrador
              </p>
              <h1 className="mt-1 text-xl font-extrabold">
                Supervisión del sistema
              </h1>
            </div>
          </div>

          <Link
            href="/panel"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            ← Volver al panel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-[#0864F5]/30 bg-gradient-to-br from-[#10254C] via-[#10203E] to-[#10182C] p-7 md:p-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-[#00B9E8]/20" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#75E5FF]">
              Centro de monitoreo
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Estado general de IINICIA
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Bienvenido/a, {nombreUsuario}. Desde aquí puedes revisar
              la disponibilidad de los servicios principales de la
              plataforma y detectar posibles problemas de conexión.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-xs font-bold ${
                  todoCorrecto
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : errores > 0
                      ? "border-red-400/30 bg-red-400/10 text-red-300"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                }`}
              >
                {pendientes > 0
                  ? "Comprobando servicios"
                  : todoCorrecto
                    ? "Todos los servicios disponibles"
                    : `${errores} servicio(s) con problemas`}
              </span>

              <button
                onClick={comprobarServicios}
                disabled={actualizando}
                className="rounded-xl bg-[#0864F5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actualizando ? "Comprobando..." : "↻ Actualizar estado"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111A30] p-6">
            <p className="text-sm text-slate-400">
              Servicios disponibles
            </p>
            <p className="mt-3 text-4xl font-black text-emerald-400">
              {disponibles}
              <span className="ml-2 text-base font-semibold text-slate-500">
                / {servicios.length}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111A30] p-6">
            <p className="text-sm text-slate-400">
              Servicios con errores
            </p>
            <p className="mt-3 text-4xl font-black text-red-400">
              {errores}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111A30] p-6">
            <p className="text-sm text-slate-400">
              Comprobaciones pendientes
            </p>
            <p className="mt-3 text-4xl font-black text-amber-400">
              {pendientes}
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Infraestructura
            </p>

            <h2 className="mt-3 text-2xl font-extrabold">
              Servicios del sistema
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Resultado de las comprobaciones de conexión realizadas
              desde el portal.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {servicios.map((servicio) => (
              <article
                key={servicio.nombre}
                className="rounded-2xl border border-white/10 bg-[#111A30] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {servicio.nombre}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {servicio.descripcion}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      servicio.estado === "disponible"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : servicio.estado === "error"
                          ? "border-red-400/30 bg-red-400/10 text-red-300"
                          : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {servicio.estado === "disponible"
                      ? "Disponible"
                      : servicio.estado === "error"
                        ? "Error"
                        : "Comprobando"}
                  </span>
                </div>

                <div className="mt-6 rounded-xl border border-white/5 bg-[#080B18]/70 p-4">
                  <p className="text-sm text-slate-300">
                    {servicio.mensaje}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                    {servicio.codigo !== undefined && (
                      <span>HTTP: {servicio.codigo}</span>
                    )}

                    {servicio.tiempo !== undefined && (
                      <span>Respuesta: {servicio.tiempo} ms</span>
                    )}

                    {servicio.ultimaRevision && (
                      <span>
                        Revisión: {formatoHora(servicio.ultimaRevision)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-[#111A30] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">
                Última comprobación general
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {ultimaRevision
                  ? `${new Date(ultimaRevision).toLocaleDateString("es-MX")} · ${formatoHora(ultimaRevision)}`
                  : "Esperando la primera comprobación..."}
              </p>
            </div>

            <span className="rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 px-4 py-2 text-xs font-semibold text-[#75E5FF]">
              IINICIA · Monitoreo
            </span>
          </div>
        </section>

        <footer className="mt-14 border-t border-white/10 py-7 text-center text-xs text-slate-500">
          Instituto de Innovación y Ciencias Aplicadas · IINICIA
        </footer>
      </div>
    </main>
  );
}
