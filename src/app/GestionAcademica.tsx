
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Rol = {
  shortname?: string;
  name?: string;
};

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
  roles?: Rol[];
};

type CursoDetalle = {
  curso: Curso;
  participantes: Participante[];
};

const API = "http://localhost:3001";

function normalizarTexto(valor?: string) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "");
}

function esProfesor(persona: Participante) {
  return (persona.roles || []).some((rol) => {
    const identificadores = [
      normalizarTexto(rol.shortname),
      normalizarTexto(rol.name),
    ];

    return identificadores.some((valor) =>
      [
        "editingteacher",
        "teacher",
        "profesor",
        "profesora",
        "docente",
        "professorteacher",
      ].includes(valor)
    );
  });
}

function esEstudiante(persona: Participante) {
  return (persona.roles || []).some((rol) => {
    const identificadores = [
      normalizarTexto(rol.shortname),
      normalizarTexto(rol.name),
    ];

    return identificadores.some((valor) =>
      [
        "student",
        "students",
        "alumno",
        "alumna",
        "estudiante",
        "estudiantes",
        "learner",
      ].includes(valor)
    );
  });
}

function combinarParticipantes(
  detalles: CursoDetalle[]
): Participante[] {
  const personas = new Map<number, Participante>();

  detalles.forEach((detalle) => {
    detalle.participantes.forEach((persona) => {
      const anterior = personas.get(persona.id);

      if (!anterior) {
        personas.set(persona.id, {
          ...persona,
          roles: persona.roles || [],
        });
        return;
      }

      const rolesCombinados = [
        ...(anterior.roles || []),
        ...(persona.roles || []),
      ];

      const rolesUnicos = Array.from(
        new Map(
          rolesCombinados.map((rol) => [
            `${normalizarTexto(rol.shortname)}-${normalizarTexto(
              rol.name
            )}`,
            rol,
          ])
        ).values()
      );

      personas.set(persona.id, {
        ...anterior,
        fullname: anterior.fullname || persona.fullname,
        email: anterior.email || persona.email,
        roles: rolesUnicos,
      });
    });
  });

  return Array.from(personas.values());
}

export default function GestionAcademica() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [detalles, setDetalles] = useState<CursoDetalle[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] =
    useState<CursoDetalle | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const encabezados = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error("Tu sesión ha expirado.");
    }

    const mfaToken = sessionStorage.getItem("mfaToken");

    if (!mfaToken) {
      throw new Error("No se encontró la verificación de seguridad.");
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "X-MFA-Token": mfaToken,
    };
  }, []);

  const cargarInformacion = useCallback(async () => {
    try {
      setActualizando(true);
      setError("");

      const headers = await encabezados();

      const respuesta = await fetch(`${API}/moodle/cursos`, {
        headers,
      });

      if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(
          `Error al consultar cursos (${respuesta.status}): ${detalle}`
        );
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos.cursos)) {
        throw new Error("Moodle devolvió una lista de cursos inválida.");
      }

      const academicos: Curso[] = datos.cursos.filter(
        (curso: Curso) =>
          curso.id !== 1 &&
          curso.shortname?.toUpperCase() !== "IINICIA" &&
          curso.fullname?.trim().toLowerCase() !==
            "portal educativo iinicia"
      );

      setCursos(academicos);

      const resultados = await Promise.all(
        academicos.map(async (curso) => {
          try {
            const respuestaParticipantes = await fetch(
              `${API}/moodle/cursos/${curso.id}/participantes`,
              { headers }
            );

            if (!respuestaParticipantes.ok) {
              const detalle = await respuestaParticipantes.text();
              console.error(
                `No se pudieron consultar los participantes del curso ${curso.id}:`,
                detalle
              );

              return { curso, participantes: [] as Participante[] };
            }

            const datosParticipantes =
              await respuestaParticipantes.json();

            return {
              curso,
              participantes: Array.isArray(
                datosParticipantes.participantes
              )
                ? datosParticipantes.participantes
                : [],
            };
          } catch (e) {
            console.error(
              `Error consultando participantes del curso ${curso.id}:`,
              e
            );

            return { curso, participantes: [] as Participante[] };
          }
        })
      );

      setDetalles(resultados);

      setCursoSeleccionado((actual) =>
        actual
          ? resultados.find(
              (item) => item.curso.id === actual.curso.id
            ) ?? null
          : null
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Ocurrió un error al consultar la información académica."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [encabezados]);

  useEffect(() => {
    cargarInformacion();
  }, [cargarInformacion]);

  const participantes = useMemo(
    () => combinarParticipantes(detalles),
    [detalles]
  );

  const profesores = useMemo(
    () => participantes.filter(esProfesor),
    [participantes]
  );

  const estudiantes = useMemo(
    () => participantes.filter(esEstudiante),
    [participantes]
  );

  const cursosFiltrados = detalles.filter(({ curso }) => {
    const texto = busqueda.toLowerCase();

    return (
      curso.fullname.toLowerCase().includes(texto) ||
      curso.shortname.toLowerCase().includes(texto)
    );
  });

  function nombreRol(persona: Participante) {
    return (
      persona.roles
        ?.map((rol) => rol.name || rol.shortname)
        .filter(Boolean)
        .join(", ") || "Participante"
    );
  }

  function formatearResumen(resumen?: string) {
    return (
      resumen?.replace(/<[^>]*>/g, " ").trim() ||
      "Curso registrado en el campus virtual."
    );
  }

  if (cargando) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111A30] p-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
        <p className="mt-4 text-sm text-slate-300">
          Consultando información académica...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-7 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
            Administración académica
          </p>

          <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
            Gestión académica
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-400">
            Consulta los cursos y participantes registrados en Moodle.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarInformacion}
          disabled={actualizando}
          className="rounded-xl border border-[#0864F5]/40 px-4 py-3 text-sm font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/15 disabled:opacity-50"
        >
          {actualizando ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#0864F5]/30 bg-[#0864F5]/10 p-5">
          <p className="text-sm text-slate-400">Cursos académicos</p>
          <p className="mt-2 text-3xl font-extrabold">{cursos.length}</p>
        </div>

        <div className="rounded-2xl border border-[#00B9E8]/20 bg-[#00B9E8]/5 p-5">
          <p className="text-sm text-slate-400">
            Profesores identificados
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {profesores.length}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-5">
          <p className="text-sm text-slate-400">
            Estudiantes identificados
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {estudiantes.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5 md:p-6">
        <h3 className="text-lg font-bold">Cursos registrados</h3>

        <p className="mt-1 text-xs text-slate-400">
          Información consultada directamente desde Moodle.
        </p>

        <input
          type="text"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar curso por nombre..."
          className="mt-5 w-full rounded-xl border border-white/10 bg-[#111D35] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#0876A8]"
        />

        {cursosFiltrados.length === 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-[#111D35] p-8 text-center">
            <p className="font-semibold text-slate-300">
              No se encontraron cursos
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Comprueba la conexión con Moodle o intenta otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {cursosFiltrados.map((detalle) => (
              <article
                key={detalle.curso.id}
                className={`rounded-xl border bg-[#111D35] p-5 transition ${
                  cursoSeleccionado?.curso.id === detalle.curso.id
                    ? "border-[#00B9E8]/60"
                    : "border-white/10 hover:border-[#0864F5]/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0864F5]/20 font-bold text-[#75E5FF]">
                    AC
                  </div>

                  <span className="rounded-full border border-[#00B9E8]/20 bg-[#00B9E8]/10 px-3 py-1 text-xs text-[#75E5FF]">
                    {detalle.participantes.length} participantes
                  </span>
                </div>

                <h4 className="mt-5 font-bold">
                  {detalle.curso.fullname}
                </h4>

                <p className="mt-2 text-xs text-slate-400">
                  Código: {detalle.curso.shortname}
                </p>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                  {formatearResumen(detalle.curso.summary)}
                </p>

                <button
                  type="button"
                  onClick={() => setCursoSeleccionado(detalle)}
                  className="mt-5 w-full rounded-xl bg-[#0864F5] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0052D6]"
                >
                  Consultar participantes
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5 md:p-6">
        <h3 className="text-lg font-bold">Comunidad académica</h3>

        <p className="mt-1 text-xs text-slate-400">
          Participantes únicos identificados en los cursos consultados.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-bold text-[#75E5FF]">
              Profesores ({profesores.length})
            </h4>

            {profesores.length === 0 ? (
              <p className="rounded-xl bg-[#111D35] p-4 text-sm text-slate-400">
                No se identificaron profesores.
              </p>
            ) : (
              <div className="space-y-2">
                {profesores.map((persona) => (
                  <div
                    key={persona.id}
                    className="rounded-xl border border-white/10 bg-[#111D35] p-4"
                  >
                    <p className="font-semibold">{persona.fullname}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {persona.email || "Correo no disponible"}
                    </p>
                    <p className="mt-1 text-xs text-[#75E5FF]">
                      {nombreRol(persona)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-3 font-bold text-purple-300">
              Estudiantes ({estudiantes.length})
            </h4>

            {estudiantes.length === 0 ? (
              <p className="rounded-xl bg-[#111D35] p-4 text-sm text-slate-400">
                No se identificaron estudiantes.
              </p>
            ) : (
              <div className="space-y-2">
                {estudiantes.map((persona) => (
                  <div
                    key={persona.id}
                    className="rounded-xl border border-white/10 bg-[#111D35] p-4"
                  >
                    <p className="font-semibold">{persona.fullname}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {persona.email || "Correo no disponible"}
                    </p>
                    <p className="mt-1 text-xs text-purple-300">
                      {nombreRol(persona)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {cursoSeleccionado && (
        <div className="rounded-2xl border border-[#00B9E8]/30 bg-[#111A30] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#00B9E8]">
                Detalle del curso
              </p>

              <h3 className="mt-2 text-xl font-extrabold">
                {cursoSeleccionado.curso.fullname}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setCursoSeleccionado(null)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Cerrar consulta
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Participantes registrados:{" "}
            <strong className="text-white">
              {cursoSeleccionado.participantes.length}
            </strong>
          </p>

          <div className="mt-5 space-y-3">
            {cursoSeleccionado.participantes.length === 0 ? (
              <p className="rounded-xl bg-[#0B1224] p-5 text-sm text-slate-400">
                No se encontraron participantes inscritos.
              </p>
            ) : (
              cursoSeleccionado.participantes.map((persona) => (
                <div
                  key={persona.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1224] p-4"
                >
                  <div>
                    <p className="font-semibold">{persona.fullname}</p>
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
        </div>
      )}
    </section>
  );
}
