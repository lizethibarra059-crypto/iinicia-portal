
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BUCKET = "profesor-documentos";

type Profesor = {
  id: string;
  full_name: string | null;
  role: string;
};

type Documento = {
  nombre: string;
  ruta: string;
  profesorId: string;
  profesorNombre: string;
  fecha: string | null;
  tamano: number;
  tipo: string;
};

export default function EntregasDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [abriendo, setAbriendo] = useState<string | null>(null);

  const cargarDocumentos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const { data: carpetas, error: errorCarpetas } =
        await supabase.storage.from(BUCKET).list("", {
          limit: 200,
        });

      if (errorCarpetas) {
        throw new Error(
          "No se pudieron consultar las carpetas de profesores. Revisa los permisos del almacenamiento."
        );
      }

      const { data: perfiles, error: errorPerfiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("role", "profesor");

      if (errorPerfiles) {
        throw new Error(
          "No se pudo consultar la información de los profesores. Revisa los permisos de la tabla profiles."
        );
      }

      const profesores = (perfiles ?? []) as Profesor[];
      const mapaProfesores = new Map(
        profesores.map((profesor) => [profesor.id, profesor])
      );

      const carpetasProfesor = (carpetas ?? []).filter((carpeta) =>
        mapaProfesores.has(carpeta.name)
      );

      const resultados: Documento[] = [];

      for (const carpeta of carpetasProfesor) {
        const profesor = mapaProfesores.get(carpeta.name);

        if (!profesor) continue;

        const { data: archivos, error: errorArchivos } =
          await supabase.storage.from(BUCKET).list(carpeta.name, {
            limit: 200,
            sortBy: {
              column: "created_at",
              order: "desc",
            },
          });

        if (errorArchivos) {
          console.error(
            `No se pudieron consultar los archivos de ${profesor.id}`,
            errorArchivos
          );
          continue;
        }

        for (const archivo of archivos ?? []) {
          if (!archivo.name || archivo.name.startsWith(".")) continue;

          resultados.push({
            nombre: archivo.name.replace(/^\d+_/, ""),
            ruta: `${profesor.id}/${archivo.name}`,
            profesorId: profesor.id,
            profesorNombre: profesor.full_name || "Profesor sin nombre",
            fecha: archivo.created_at ?? null,
            tamano: archivo.metadata?.size ?? 0,
            tipo: archivo.metadata?.mimetype ?? "Archivo",
          });
        }
      }

      resultados.sort((a, b) => {
        const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return fechaB - fechaA;
      });

      setDocumentos(resultados);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al consultar los documentos."
      );
      setDocumentos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  async function abrirDocumento(documento: Documento) {
    setAbriendo(documento.ruta);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(documento.ruta, 60);

    setAbriendo(null);

    if (error || !data?.signedUrl) {
      setError("No se pudo generar el enlace para abrir el documento.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function formatearTamano(bytes: number) {
    if (!bytes) return "Tamaño no disponible";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatearFecha(fecha: string | null) {
    if (!fecha) return "Fecha no disponible";

    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const documentosFiltrados = documentos.filter((documento) => {
    const texto = busqueda.toLowerCase();

    return (
      documento.nombre.toLowerCase().includes(texto) ||
      documento.profesorNombre.toLowerCase().includes(texto)
    );
  });

  return (
    <section className="w-full text-white">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
          Administración académica
        </p>

        <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
          Entregas de documentos
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Consulta los documentos que han compartido los profesores de IINICIA.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Documentos recibidos
          </p>
          <p className="mt-3 text-3xl font-black text-[#75E5FF]">
            {documentos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Profesores con entregas
          </p>
          <p className="mt-3 text-3xl font-black text-[#75E5FF]">
            {new Set(documentos.map((doc) => doc.profesorId)).size}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Documentos recibidos</h3>
            <p className="mt-1 text-xs text-slate-400">
              Archivos enviados desde las cuentas de profesor.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDocumentos}
            disabled={cargando}
            className="rounded-xl border border-[#0864F5]/40 px-4 py-2.5 text-sm font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/15 disabled:opacity-50"
          >
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </div>

        <div className="mt-5">
          <input
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre de archivo o profesor..."
            className="w-full rounded-xl border border-white/10 bg-[#111D35] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#0876A8]"
          />
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="mt-5 rounded-xl border border-white/10 p-8 text-center text-sm text-slate-400">
            Consultando documentos...
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-[#111D35] p-8 text-center">
            <div className="text-3xl text-slate-500">▤</div>
            <p className="mt-3 font-semibold text-slate-300">
              {documentos.length === 0
                ? "Todavía no hay documentos entregados"
                : "No se encontraron documentos"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {documentos.length === 0
                ? "Cuando un profesor suba un archivo, aparecerá aquí."
                : "Intenta buscar con otro nombre de archivo o profesor."}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {documentosFiltrados.map((documento) => (
              <article
                key={documento.ruta}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#111D35] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-xs font-black text-[#75E5FF]">
                    {documento.nombre.split(".").pop()?.toUpperCase() || "FILE"}
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-white">
                      {documento.nombre}
                    </p>

                    <p className="mt-1 text-xs text-[#75E5FF]">
                      {documento.profesorNombre}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatearTamano(documento.tamano)}
                      {" · "}
                      {formatearFecha(documento.fecha)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => abrirDocumento(documento)}
                  disabled={abriendo === documento.ruta}
                  className="shrink-0 rounded-lg border border-[#0864F5]/40 px-4 py-2.5 text-xs font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/15 disabled:opacity-50"
                >
                  {abriendo === documento.ruta
                    ? "Abriendo..."
                    : "Ver / Descargar"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
