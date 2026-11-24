
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
  creado_por: string;
  creado_en: string;
  actualizado_en?: string;
};

const API = "http://localhost:3001/api/incidencias";

const estados: { valor: Estado; texto: string }[] = [
  { valor: "abierta", texto: "Abierta" },
  { valor: "en_proceso", texto: "En proceso" },
  { valor: "resuelta", texto: "Resuelta" },
  { valor: "cerrada", texto: "Cerrada" },
];

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

export default function IncidenciasSoporte() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtro, setFiltro] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const encabezados = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = sessionStorage.getItem("mfaToken");

    if (!data.session || !token) {
      throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "X-MFA-Token": token,
      "Content-Type": "application/json",
    };
  }, []);

  const cargarIncidencias = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const headers = await encabezados();
      const respuesta = await fetch(API, { headers });

      if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);
        throw new Error(
          resultado?.message || "No se pudieron consultar las incidencias.",
        );
      }

      const datos = await respuesta.json();
      setIncidencias(Array.isArray(datos) ? datos : []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ocurrió un error al cargar los reportes.",
      );
    } finally {
      setCargando(false);
    }
  }, [encabezados]);

  useEffect(() => {
    cargarIncidencias();
  }, [cargarIncidencias]);

  async function cambiarEstado(id: number, estado: Estado) {
    setActualizando(id);
    setError("");
    setMensaje("");

    try {
      const headers = await encabezados();

      const respuesta = await fetch(`${API}/${id}/estado`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado }),
      });

      if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);
        throw new Error(
          resultado?.message || "No se pudo actualizar el estado.",
        );
      }

      const actualizada = await respuesta.json();

      setIncidencias((anteriores) =>
        anteriores.map((item) =>
          item.id === id ? { ...item, ...actualizada } : item,
        ),
      );

      setMensaje("El estado de la incidencia se actualizó correctamente.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo actualizar la incidencia.",
      );
    } finally {
      setActualizando(null);
    }
  }

  const incidenciasFiltradas =
    filtro === "todas"
      ? incidencias
      : incidencias.filter((item) => item.estado === filtro);

  const contar = (estado: Estado) =>
    incidencias.filter((item) => item.estado === estado).length;

  function fecha(valor: string) {
    if (!valor) return "Fecha no disponible";

    return new Date(valor).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
          Mesa de ayuda
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
          Gestión de incidencias
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Consulta los reportes de los usuarios y actualiza su estado de
          atención.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Total", valor: incidencias.length, color: "text-white" },
          { titulo: "Abiertas", valor: contar("abierta"), color: "text-amber-300" },
          { titulo: "En proceso", valor: contar("en_proceso"), color: "text-blue-300" },
          { titulo: "Resueltas", valor: contar("resuelta"), color: "text-emerald-300" },
        ].map((dato) => (
          <article
            key={dato.titulo}
            className="rounded-2xl border border-white/10 bg-[#111A30] p-5"
          >
            <p className="text-sm text-slate-400">{dato.titulo}</p>
            <p className={`mt-3 text-3xl font-black ${dato.color}`}>
              {dato.valor}
            </p>
          </article>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-white">
            Reportes recibidos
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {incidenciasFiltradas.length} incidencia(s) encontradas
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none focus:border-[#0864F5]"
          >
            <option value="todas">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.texto}
              </option>
            ))}
          </select>

          <button
            onClick={cargarIncidencias}
            disabled={cargando}
            className="rounded-xl bg-[#0864F5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6] disabled:opacity-50"
          >
            {cargando ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center text-slate-400">
          Cargando incidencias...
        </div>
      ) : incidenciasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center">
          <p className="font-semibold text-white">
            No hay incidencias para mostrar
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Cuando los usuarios registren reportes, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidenciasFiltradas.map((incidencia) => (
            <article
              key={incidencia.id}
              className="rounded-2xl border border-white/10 bg-[#111A30] p-5 md:p-6"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#75E5FF]">
                      REPORTE #{incidencia.id}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${coloresEstado[incidencia.estado] || coloresEstado.abierta}`}
                    >
                      {estados.find((e) => e.valor === incidencia.estado)?.texto ||
                        incidencia.estado}
                    </span>
                  </div>

                  <h4 className="mt-4 text-lg font-bold text-white">
                    {incidencia.titulo}
                  </h4>

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
                          coloresPrioridad[incidencia.prioridad] || "text-white"
                        }
                      >
                        {incidencia.prioridad || "media"}
                      </strong>
                    </span>
                    <span>Registrada: {fecha(incidencia.creado_en)}</span>
                  </div>
                </div>

                <div className="w-full shrink-0 md:w-48">
                  <label className="mb-2 block text-xs font-semibold text-slate-400">
                    Actualizar estado
                  </label>

                  <select
                    value={incidencia.estado}
                    disabled={actualizando === incidencia.id}
                    onChange={(e) =>
                      cambiarEstado(incidencia.id, e.target.value as Estado)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-3 py-3 text-sm text-white outline-none focus:border-[#0864F5] disabled:opacity-50"
                  >
                    {estados.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.texto}
                      </option>
                    ))}
                  </select>

                  {actualizando === incidencia.id && (
                    <p className="mt-2 text-xs text-[#75E5FF]">
                      Actualizando...
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
