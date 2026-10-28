
"use client";

import { useEffect, useState } from "react";

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

export default function CursosMoodle() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarCursos() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("No está configurada la URL del backend.");
        }

        const respuesta = await fetch(`${apiUrl}/moodle/cursos`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar los cursos.");
        }

        const datos: RespuestaCursos = await respuesta.json();

        if (!datos.conectado || !Array.isArray(datos.cursos)) {
          throw new Error("La respuesta del backend no es válida.");
        }

        setCursos(
          datos.cursos.filter(
            (curso) => curso.id !== 1 && curso.shortname !== "IINICIA",
          ),
        );
      } catch {
        setError(
          "No pudimos cargar los cursos. Comprueba que el backend esté funcionando.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarCursos();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900">Mis cursos</h2>

      <p className="mt-2 text-gray-600">
        Consulta los cursos disponibles en el aula virtual IINICIA.
      </p>

      {cargando && (
        <p className="mt-5 text-gray-600">Cargando cursos...</p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!cargando && !error && cursos.length === 0 && (
        <p className="mt-5 rounded-xl bg-white p-6 text-gray-600">
          No hay cursos disponibles por el momento.
        </p>
      )}

      {!cargando && !error && cursos.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <article
              key={curso.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <span className="font-bold">TI</span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {curso.fullname}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Código: {curso.shortname}
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {curso.summary
                  ? curso.summary.replace(/<[^>]*>/g, "").trim()
                  : "Consulta los materiales y actividades de este curso."}
              </p>

              <a
                href={`http://localhost:8080/course/view.php?id=${curso.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
              >
                Abrir Moodle
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
