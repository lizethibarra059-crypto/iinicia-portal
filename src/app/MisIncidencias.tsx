
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Estado = "abierta" | "en_proceso" | "resuelta" | "cerrada";

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: "baja" | "media" | "alta" | "urgente";
  estado: Estado;
  creado_en: string;
  actualizado_en?: string;
};

const API = "http://localhost:3001/api/incidencias";

const estados: Record<Estado, string> = {
  abierta: "Abierta",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  cerrada: "Cerrada",
};

const coloresEstado: Record<Estado, string> = {
  abierta: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  en_proceso: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  resuelta: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cerrada: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

const coloresPrioridad: Record<string, string> = {
  baja: "text-slate-400",
  media: "text-cyan-300",
  alta: "text-orange-300",
  urgente: "text-red-400",
};

export default function MisIncidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarIncidencias = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const { data, error: sesionError } =
        await supabase.auth.getSession();

      const tokenMFA = sessionStorage.getItem("mfaToken");

      if (sesionError || !data.session || !tokenMFA) {
        throw new Error(
          "Tu sesión expiró. Inicia sesión nuevamente."
        );
      }

      const respuesta = await fetch(API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "X-MFA-Token": tokenMFA,
          "Content-Type": "application/json",
        },
      });

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.message ||
            "No se pudieron consultar tus incidencias."
        );
      }

      setIncidencias(
        Array.isArray(resultado) ? resultado : []
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Ocurrió un error al consultar tus reportes."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarIncidencias();
  }, [cargarIncidencias]);

  function fecha(valor?: string) {
    if (!valor) return "Fecha no disponible";

    return new Date(valor).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const contar = (estado: Estado) =>
    incidencias.filter((item) => item.estado === estado).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
            Mesa de ayuda
          </p>

          <h2 className="mt-3 text-2xl font-extrabold text-white">
            Mis incidencias
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-400">
            Consulta tus reportes y revisa el estado de atención
            de cada uno.
          </p>
        </div>

        <button
          onClick={cargarIncidencias}
          disabled={cargando}
          className="rounded-xl bg-[#0864F5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6] disabled:opacity-50"
        >
          {cargando ? "Consultando..." : "Actualizar reportes"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            titulo: "Total",
            valor: incidencias.length,
            color: "text-white",
          },
          {
            titulo: "Abiertas",
            valor: contar("abierta"),
            color: "text-amber-300",
          },
          {
            titulo: "En proceso",
            valor: contar("en_proceso"),
            color: "text-blue-300",
          },
          {
            titulo: "Resueltas",
            valor: contar("resuelta"),
            color: "text-emerald-300",
          },
        ].map((dato) => (
          <article
            key={dato.titulo}
            className="rounded-2xl border border-white/10 bg-[#111A30] p-5"
          >
            <p className="text-sm text-slate-400">
              {dato.titulo}
            </p>

            <p className={`mt-3 text-3xl font-black ${dato.color}`}>
              {dato.valor}
            </p>
          </article>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center text-slate-400">
          Consultando tus incidencias...
        </div>
      ) : incidencias.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center">
          <p className="font-semibold text-white">
            Todavía no tienes reportes registrados
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Cuando envíes una incidencia, aparecerá aquí para
            que puedas consultar su seguimiento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidencias.map((incidencia) => (
            <article
              key={incidencia.id}
              className="rounded-2xl border border-white/10 bg-[#111A30] p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#75E5FF]">
                  REPORTE #{incidencia.id}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    coloresEstado[incidencia.estado] ||
                    coloresEstado.abierta
                  }`}
                >
                  {estados[incidencia.estado] || incidencia.estado}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                {incidencia.titulo}
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {incidencia.descripcion}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                <span>
                  Categoría: {incidencia.categoria || "General"}
                </span>

                <span>
                  Prioridad:{" "}
                  <strong
                    className={
                      coloresPrioridad[incidencia.prioridad] ||
                      "text-white"
                    }
                  >
                    {incidencia.prioridad || "media"}
                  </strong>
                </span>

                <span>
                  Registrada: {fecha(incidencia.creado_en)}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-[#0B1020] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Seguimiento de tu reporte
                </p>

                <p className="mt-2 text-sm text-white">
                  {incidencia.estado === "abierta" &&
                    "Tu reporte fue recibido y está pendiente de atención."}

                  {incidencia.estado === "en_proceso" &&
                    "Soporte está trabajando en la solución de tu reporte."}

                  {incidencia.estado === "resuelta" &&
                    "Tu reporte fue atendido y marcado como resuelto."}

                  {incidencia.estado === "cerrada" &&
                    "Tu reporte ha sido cerrado."}
                </p>

                {incidencia.actualizado_en && (
                  <p className="mt-2 text-xs text-slate-500">
                    Última actualización:{" "}
                    {fecha(incidencia.actualizado_en)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
