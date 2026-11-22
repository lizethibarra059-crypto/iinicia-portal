
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Curso = {
  id: number;
  fullname: string;
  shortname: string;
  summary?: string;
};

type Participante = {
  id: number;
  fullname: string;
  email?: string;
  roles?: { shortname: string; name: string }[];
};

type Actividad = {
  id: number;
  name: string;
  duedate?: number;
  allowsubmissionsfromdate?: number;
  cutoffdate?: number;
  submissiondrafts?: number;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CoordinadorMoodle() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [vista, setVista] = useState<"participantes" | "actividades">("participantes");
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  async function encabezados() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    const mfaToken = sessionStorage.getItem("mfaToken");

    if (!mfaToken) {
      throw new Error("No se encontró la verificación de seguridad.");
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "X-MFA-Token": mfaToken,
    };
  }

  useEffect(() => {
    let activo = true;

    async function cargarCursos() {
      try {
        setCargando(true);
        setError("");

        const headers = await encabezados();

        const respuesta = await fetch(`${API}/moodle/cursos`, {
          headers,
        });

        if (!respuesta.ok) {
          throw new Error("No fue posible consultar los cursos de Moodle.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos.cursos)) {
          throw new Error("Moodle devolvió una lista de cursos inválida.");
        }

        const academicos = datos.cursos.filter((curso: Curso) => {
          const nombre = curso.fullname?.trim().toLowerCase();
          const corto = curso.shortname?.trim().toUpperCase();

          return (
            curso.id !== 1 &&
            corto !== "IINICIA" &&
            nombre !== "portal educativo iinicia"
          );
        });

        if (activo) {
          setCursos(academicos);
        }
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error ? e.message : "Ocurrió un error inesperado."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarCursos();

    return () => {
      activo = false;
    };
  }, []);

  async function consultarCurso(curso: Curso) {
    try {
      setCursoSeleccionado(curso);
      setCargandoDetalle(true);
      setError("");
      setParticipantes([]);
      setActividades([]);
      setVista("participantes");

      const headers = await encabezados();

      const [respuestaParticipantes, respuestaActividades] =
        await Promise.all([
          fetch(`${API}/moodle/cursos/${curso.id}/participantes`, {
            headers,
          }),
          fetch(`${API}/moodle/cursos/${curso.id}/actividades`, {
            headers,
          }),
        ]);

      if (!respuestaParticipantes.ok || !respuestaActividades.ok) {
        throw new Error(
          "No se pudo consultar toda la información. Verifica los permisos del servicio web de Moodle."
        );
      }

      const [datosParticipantes, datosActividades] = await Promise.all([
        respuestaParticipantes.json(),
        respuestaActividades.json(),
      ]);

      setParticipantes(
        Array.isArray(datosParticipantes.participantes)
          ? datosParticipantes.participantes
          : []
      );

      setActividades(
        Array.isArray(datosActividades.actividades)
          ? datosActividades.actividades
          : []
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el curso."
      );
    } finally {
      setCargandoDetalle(false);
    }
  }

  function nombreRol(persona: Participante) {
    if (!persona.roles?.length) return "Participante";

    return persona.roles
      .map((rol) => rol.name || rol.shortname)
      .join(", ");
  }

  function fecha(timestamp?: number) {
    if (!timestamp) return "Sin fecha definida";

    return new Date(timestamp * 1000).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (cargando) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111A30] p-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
        <p className="mt-4 text-sm text-slate-300">
          Consultando cursos de Moodle...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
          Supervisión académica
        </p>

        <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
          Seguimiento de cursos
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          Consulta los cursos, sus participantes y las actividades registradas
          en el campus virtual.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#0864F5]/30 bg-[#0864F5]/10 p-5">
          <p className="text-sm text-slate-400">Cursos académicos</p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {cursos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#00B9E8]/20 bg-[#00B9E8]/5 p-5">
          <p className="text-sm text-slate-400">Curso seleccionado</p>
          <p className="mt-2 truncate text-lg font-bold text-white">
            {cursoSeleccionado?.fullname || "Ninguno"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-white">
          Cursos disponibles
        </h3>

        {cursos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B1224] p-8 text-center text-sm text-slate-400">
            No hay cursos académicos disponibles en Moodle.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => (
              <article
                key={curso.id}
                className={`rounded-2xl border bg-[#111A30] p-5 transition ${
                  cursoSeleccionado?.id === curso.id
                    ? "border-[#00B9E8]/60"
                    : "border-white/10 hover:border-[#0864F5]/50"
                }`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0864F5]/20 font-bold text-[#75E5FF]">
                  C
                </div>

                <h4 className="font-bold text-white">{curso.fullname}</h4>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                  {curso.summary?.replace(/<[^>]*>/g, " ").trim() ||
                    "Curso registrado en el campus virtual."}
                </p>

                <button
                  onClick={() => consultarCurso(curso)}
                  className="mt-5 w-full rounded-xl bg-[#0864F5] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6]"
                >
                  Consultar curso
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {cursoSeleccionado && (
        <div className="rounded-2xl border border-white/10 bg-[#111A30] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#00B9E8]">
                Información académica
              </p>

              <h3 className="mt-2 text-xl font-extrabold text-white">
                {cursoSeleccionado.fullname}
              </h3>
            </div>

            <button
              onClick={() => setCursoSeleccionado(null)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Cerrar consulta
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setVista("participantes")}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                vista === "participantes"
                  ? "bg-[#0864F5] text-white"
                  : "border border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              Participantes ({participantes.length})
            </button>

            <button
              onClick={() => setVista("actividades")}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                vista === "actividades"
                  ? "bg-[#0864F5] text-white"
                  : "border border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              Actividades ({actividades.length})
            </button>
          </div>

          {cargandoDetalle ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Consultando información del curso...
            </p>
          ) : vista === "participantes" ? (
            <div className="mt-5 space-y-3">
              {participantes.length === 0 ? (
                <p className="rounded-xl bg-[#0B1224] p-5 text-sm text-slate-400">
                  No se encontraron participantes inscritos.
                </p>
              ) : (
                participantes.map((persona) => (
                  <div
                    key={persona.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1224] p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {persona.fullname}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {persona.email || "Correo no disponible"}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#00B9E8]/20 bg-[#00B9E8]/10 px-3 py-1 text-xs text-[#75E5FF]">
                      {nombreRol(persona)}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {actividades.length === 0 ? (
                <p className="rounded-xl bg-[#0B1224] p-5 text-sm text-slate-400">
                  No se encontraron tareas en este curso.
                </p>
              ) : (
                actividades.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="rounded-xl border border-white/10 bg-[#0B1224] p-4"
                  >
                    <p className="font-semibold text-white">
                      {actividad.name}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Fecha límite: {fecha(actividad.duedate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
