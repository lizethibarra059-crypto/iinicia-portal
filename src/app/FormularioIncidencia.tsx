
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:3001/api/incidencias";

type Estado = "abierta" | "en_proceso" | "resuelta" | "cerrada";

type Prioridad = "baja" | "media" | "alta" | "urgente";

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: Prioridad;
  estado: Estado;
  creado_por: string;
  creado_en: string;
  actualizado_en?: string;
};

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

const coloresPrioridad: Record<Prioridad, string> = {
  baja: "text-slate-400",
  media: "text-cyan-300",
  alta: "text-orange-300",
  urgente: "text-red-400",
};

export default function FormularioIncidencia() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [prioridad, setPrioridad] = useState<Prioridad>("media");

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargandoIncidencias, setCargandoIncidencias] = useState(true);
  const [errorIncidencias, setErrorIncidencias] = useState("");

  const obtenerEncabezados = useCallback(async () => {
    const { data, error: sesionError } =
      await supabase.auth.getSession();

    const tokenMFA = sessionStorage.getItem("mfaToken");

    if (sesionError || !data.session || !tokenMFA) {
      throw new Error(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "X-MFA-Token": tokenMFA,
      "Content-Type": "application/json",
    };
  }, []);

  const cargarIncidencias = useCallback(async () => {
    setCargandoIncidencias(true);
    setErrorIncidencias("");

    try {
      const headers = await obtenerEncabezados();

      const respuesta = await fetch(API, {
        method: "GET",
        headers,
      });

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.message ||
            "No se pudieron consultar tus reportes."
        );
      }

      setIncidencias(
        Array.isArray(resultado) ? resultado : []
      );
    } catch (e) {
      setErrorIncidencias(
        e instanceof Error
          ? e.message
          : "Ocurrió un error al consultar tus incidencias."
      );
    } finally {
      setCargandoIncidencias(false);
    }
  }, [obtenerEncabezados]);

  useEffect(() => {
    cargarIncidencias();
  }, [cargarIncidencias]);

  async function enviarIncidencia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!titulo.trim() || !descripcion.trim()) {
      setError("Completa el título y la descripción.");
      return;
    }

    setEnviando(true);

    try {
      const headers = await obtenerEncabezados();

      const respuesta = await fetch(API, {
        method: "POST",
        headers,
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          categoria,
          prioridad,
        }),
      });

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.message ||
            "No se pudo registrar el reporte."
        );
      }

      setMensaje("¡Tu reporte se registró correctamente!");

      setTitulo("");
      setDescripcion("");
      setCategoria("general");
      setPrioridad("media");

      await cargarIncidencias();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Ocurrió un error al enviar el reporte."
      );
    } finally {
      setEnviando(false);
    }
  }

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
    <section className="space-y-10">

      {/* FORMULARIO PARA REGISTRAR INCIDENCIAS */}

      <div>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
            Mesa de ayuda
          </p>

          <h2 className="mt-3 text-2xl font-extrabold text-white">
            Reportar una incidencia
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-400">
            Describe el problema que estás presentando para que
            el equipo de soporte pueda ayudarte.
          </p>
        </div>

        <form onSubmit={enviarIncidencia} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Título del reporte
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. No puedo acceder a mi curso"
              maxLength={150}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#0864F5]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica detalladamente qué sucede..."
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#0864F5]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Categoría
            </label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none focus:border-[#0864F5]"
            >
              <option value="general">General</option>
              <option value="acceso">Acceso</option>
              <option value="moodle">Moodle</option>
              <option value="plataforma">Plataforma</option>
              <option value="documentos">Documentos</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Prioridad
            </label>

            <select
              value={prioridad}
              onChange={(e) =>
                setPrioridad(e.target.value as Prioridad)
              }
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none focus:border-[#0864F5]"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
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

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-[#0864F5] px-5 py-3 font-bold text-white transition hover:bg-[#0052D6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? "Enviando reporte..." : "Enviar reporte"}
          </button>
        </form>
      </div>

      {/* SEGUIMIENTO DE INCIDENCIAS DEL USUARIO */}

      <div className="border-t border-white/10 pt-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Seguimiento
            </p>

            <h2 className="mt-3 text-2xl font-extrabold text-white">
              Mis incidencias
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Consulta tus reportes y revisa el estado de atención.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarIncidencias}
            disabled={cargandoIncidencias}
            className="rounded-xl bg-[#0864F5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6] disabled:opacity-50"
          >
            {cargandoIncidencias
              ? "Consultando..."
              : "Actualizar reportes"}
          </button>
        </div>

        {/* CONTADORES */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        {/* MENSAJES */}

        {errorIncidencias && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
            {errorIncidencias}
          </div>
        )}

        {/* LISTA DE REPORTES */}

        {cargandoIncidencias ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center text-slate-400">
            Consultando tus incidencias...
          </div>
        ) : incidencias.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B1020] p-10 text-center">
            <p className="font-semibold text-white">
              Todavía no tienes reportes registrados
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Cuando envíes una incidencia, aparecerá aquí para
              que puedas consultar su seguimiento.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
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

                  <p className="mt-2 text-sm leading-6 text-white">
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
      </div>
    </section>
  );
}
