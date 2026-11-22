
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Curso = {
  id: number;
  shortname: string;
  fullname: string;
  summary?: string;
};

type RespuestaCursos = {
  conectado: boolean;
  total: number;
  cursos: Curso[];
};

// limpia las etiquetas html y las entidades del resumen de moodle
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

export default function CursosMoodle() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarCursos() {
      try {
        setCargando(true);
        setError("");

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const { data, error: errorSesion } =
          await supabase.auth.getSession();

        if (errorSesion) {
          throw new Error("No se pudo obtener la sesión.");
        }

        if (!data.session) {
          throw new Error(
            "Tu sesión ha expirado. Inicia sesión nuevamente."
          );
        }

      const mfaToken = sessionStorage.getItem("mfaToken");
      const respuesta = await fetch(`${apiUrl}/moodle/cursos`, {
       headers: {
         Authorization: `Bearer ${data.session.access_token}`,
         "X-MFA-Token": mfaToken ?? "",
        },
      });

        if (!respuesta.ok) {
          throw new Error(
            `No se pudieron cargar los cursos. Error ${respuesta.status}.`
          );
        }

        const datos: RespuestaCursos = await respuesta.json();

        if (!datos.conectado || !Array.isArray(datos.cursos)) {
          throw new Error("La respuesta recibida de Moodle no es válida.");
        }

        // excluir el curso principal de moodle
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
  }, []);

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

      {/* encabezado de cursos */}
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
            Consulta tus cursos y accede a tus materiales y actividades.
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

      {/* cursos disponibles */}
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
              className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17233E] to-[#10182C] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-2 hover:border-[#0864F5]/60 hover:shadow-xl hover:shadow-blue-950/30"
            >
              {/* detalle superior */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0864F5] via-[#00B9E8] to-[#0864F5]" />

              <div className="relative flex flex-1 flex-col p-6">

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-lg font-extrabold text-[#75E5FF] transition group-hover:bg-[#0864F5]/30">
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

                <div className="mt-6 border-t border-white/10 pt-5">
                  <a
                    href={`http://localhost:8080/course/view.php?id=${curso.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#0864F5] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#0052D6] focus:outline-none focus:ring-2 focus:ring-[#00B9E8] focus:ring-offset-2 focus:ring-offset-[#10182C]"
                  >
                    Entrar al curso
                    <span
                      aria-hidden="true"
                      className="text-lg transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
