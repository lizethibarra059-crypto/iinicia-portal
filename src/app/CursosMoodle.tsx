
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Curso = {
  id: number;
  shortname: string;
  fullname: string;
  summary?: string;
};

type Actividad = {
  id: number;
  name: string;
  modname: string;
  description?: string;
  url?: string;
  section?: string;
  sectionId?: number;
  sectionNumber?: number;
  visible?: number | boolean;
};

type RespuestaCursos = {
  conectado: boolean;
  total: number;
  cursos: Curso[];
};

type RespuestaActividades = {
  conectado: boolean;
  cursoId: number;
  total: number;
  actividades: Actividad[];
};

function limpiarResumen(html?: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/\s+/g, " ")
    .trim();
}

function nombreTipo(modname: string): string {
  const tipos: Record<string, string> = {
    assign: "Tarea",
    quiz: "Cuestionario",
    resource: "Archivo",
    folder: "Carpeta",
    url: "Enlace",
    forum: "Foro",
    page: "Página",
    book: "Libro",
    lesson: "Lección",
    workshop: "Taller",
    choice: "Consulta",
    feedback: "Encuesta",
    glossary: "Glosario",
    wiki: "Wiki",
    scorm: "SCORM",
    label: "Etiqueta",
    h5pactivity: "Actividad interactiva",
  };

  return tipos[modname] || modname;
}

export default function CursosMoodle() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [cursoAbierto, setCursoAbierto] = useState<number | null>(null);
  const [actividades, setActividades] = useState<
    Record<number, Actividad[]>
  >({});
  const [cargandoActividades, setCargandoActividades] = useState<
    number | null
  >(null);
  const [erroresActividades, setErroresActividades] = useState<
    Record<number, string>
  >({});

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  async function obtenerAutorizacion() {
    const { data, error: errorSesion } =
      await supabase.auth.getSession();

    if (errorSesion || !data.session) {
      throw new Error(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );
    }

    const mfaToken =
      typeof window !== "undefined"
        ? sessionStorage.getItem("mfaToken")
        : null;

    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "X-MFA-Token": mfaToken ?? "",
    };
  }

  useEffect(() => {
    let activo = true;

    async function cargarCursos() {
      try {
        setCargando(true);
        setError("");

        const headers = await obtenerAutorizacion();

        const respuesta = await fetch(`${apiUrl}/moodle/cursos`, {
          headers,
        });

        if (!respuesta.ok) {
          throw new Error(
            `No se pudieron cargar los cursos. Error ${respuesta.status}.`
          );
        }

        const datos: RespuestaCursos = await respuesta.json();

        if (
          !datos.conectado ||
          !Array.isArray(datos.cursos)
        ) {
          throw new Error(
            "La respuesta recibida de Moodle no es válida."
          );
        }

        const cursosAcademicos = datos.cursos.filter((curso) => {
          const nombre = curso.fullname.trim().toLowerCase();
          const nombreCorto = curso.shortname.trim().toUpperCase();

          return (
            curso.id !== 1 &&
            nombreCorto !== "IINICIA" &&
            nombre !== "portal educativo iinicia"
          );
        });

        if (activo) {
          setCursos(cursosAcademicos);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Ocurrió un error al cargar los cursos."
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
  }, [apiUrl]);

  async function cargarActividades(cursoId: number) {
    if (actividades[cursoId]) {
      return;
    }

    try {
      setCargandoActividades(cursoId);

      setErroresActividades((anteriores) => ({
        ...anteriores,
        [cursoId]: "",
      }));

      const headers = await obtenerAutorizacion();

      const respuesta = await fetch(
        `${apiUrl}/moodle/cursos/${cursoId}/actividades`,
        { headers }
      );

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron cargar las actividades. Error ${respuesta.status}.`
        );
      }

      const datos: RespuestaActividades = await respuesta.json();

      if (!Array.isArray(datos.actividades)) {
        throw new Error(
          "Moodle devolvió una respuesta de actividades no válida."
        );
      }

      setActividades((anteriores) => ({
        ...anteriores,
        [cursoId]: datos.actividades,
      }));
    } catch (err) {
      setErroresActividades((anteriores) => ({
        ...anteriores,
        [cursoId]:
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las actividades.",
      }));
    } finally {
      setCargandoActividades(null);
    }
  }

  async function alternarActividades(cursoId: number) {
    if (cursoAbierto === cursoId) {
      setCursoAbierto(null);
      return;
    }

    setCursoAbierto(cursoId);

    await cargarActividades(cursoId);
  }

  if (cargando) {
    return (
      <section className="w-full py-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B1224] p-12">
          <div className="mb-5 h-11 w-11 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
          <p className="font-medium text-slate-300">
            Cargando tus cursos...
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Conectando con el campus virtual
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl font-bold text-red-400">
            !
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-300">
              No fue posible cargar los cursos
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-200/80">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00B9E8]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Campus virtual
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Mis cursos
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Consulta tus cursos, materiales y actividades.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0864F5]/20 text-lg text-[#75E5FF]">
            ▦
          </div>

          <div>
            <p className="text-xl font-extrabold leading-none text-white">
              {cursos.length}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {cursos.length === 1 ? "Curso" : "Cursos"}
            </p>
          </div>
        </div>
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B1224] px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0864F5]/30 bg-[#0864F5]/10 text-2xl font-bold text-[#75E5FF]">
            C
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            Aún no tienes cursos disponibles
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Cuando se te asignen cursos en Moodle, aparecerán en este espacio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((curso, index) => (
            <article
              key={curso.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17233E] to-[#10182C] shadow-lg shadow-black/10 transition duration-300 hover:border-[#0864F5]/60"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0864F5] via-[#00B9E8] to-[#0864F5]" />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-lg font-extrabold text-[#75E5FF]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <span className="rounded-full border border-[#00B9E8]/20 bg-[#00B9E8]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#75E5FF]">
                    Curso académico
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-extrabold leading-snug text-white transition group-hover:text-[#75E5FF]">
                  {curso.fullname}
                </h3>

                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-7 text-slate-400">
                  {limpiarResumen(curso.summary) ||
                    "Consulta los materiales, las actividades y los recursos disponibles en este curso."}
                </p>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                  <a
                    href={`http://localhost:8080/course/view.php?id=${curso.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#0864F5] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#0052D6]"
                  >
                    Entrar al curso
                    <span aria-hidden="true" className="text-lg">
                      →
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => alternarActividades(curso.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00B9E8]/30 bg-[#00B9E8]/10 px-5 py-3 text-sm font-bold text-[#75E5FF] transition hover:bg-[#00B9E8]/20"
                  >
                    {cursoAbierto === curso.id
                      ? "Ocultar actividades"
                      : "Ver actividades"}
                    <span>
                      {cursoAbierto === curso.id ? "↑" : "↓"}
                    </span>
                  </button>
                </div>

                {cursoAbierto === curso.id && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-[#0B1224]/80 p-4">
                    <h4 className="mb-4 text-sm font-bold text-white">
                      Actividades del curso
                    </h4>

                    {cargandoActividades === curso.id ? (
                      <div className="flex items-center gap-3 py-5 text-sm text-slate-400">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#00B9E8]" />
                        Cargando actividades...
                      </div>
                    ) : erroresActividades[curso.id] ? (
                      <div className="space-y-3">
                        <p className="text-sm text-red-300">
                          {erroresActividades[curso.id]}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActividades((anteriores) => {
                              const nuevas = { ...anteriores };
                              delete nuevas[curso.id];
                              return nuevas;
                            });
                            cargarActividades(curso.id);
                          }}
                          className="text-xs font-bold text-[#75E5FF] hover:underline"
                        >
                          Intentar nuevamente
                        </button>
                      </div>
                    ) : actividades[curso.id]?.length ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400">
                          {actividades[curso.id].length} elementos encontrados
                        </p>

                        {actividades[curso.id].map((actividad) => (
                          <div
                            key={actividad.id}
                            className="rounded-lg border border-white/10 bg-[#17233E] p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded-md bg-[#0864F5]/20 px-2 py-1 text-[10px] font-bold text-[#75E5FF]">
                                {nombreTipo(actividad.modname)}
                              </span>

                              {actividad.visible === 0 ||
                              actividad.visible === false ? (
                                <span className="text-[10px] text-amber-300">
                                  No visible
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-2 text-sm font-bold text-white">
                              {actividad.name}
                            </p>

                            <p className="mt-1 text-xs text-[#00B9E8]">
                              {actividad.section || "General"}
                            </p>

                            {limpiarResumen(actividad.description) && (
                              <p className="mt-2 text-xs leading-5 text-slate-400">
                                {limpiarResumen(actividad.description)}
                              </p>
                            )}

                            {actividad.url && (
                              <a
                                href={actividad.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex text-xs font-bold text-[#75E5FF] hover:underline"
                              >
                                Abrir actividad →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Este curso todavía no tiene actividades disponibles.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
