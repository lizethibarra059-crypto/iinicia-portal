
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const BUCKET = "profesor-documentos";
const MAX_SIZE = 10 * 1024 * 1024;

const EXTENSIONES_PERMITIDAS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
];

type Documento = {
  name: string;
  id: string;
  created_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
};

function formatearTamano(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function obtenerExtension(nombre: string) {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

function formatearFecha(fecha?: string) {
  if (!fecha) return "Fecha no disponible";

  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ProfesorMoodle() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito">("exito");

  const mostrarMensaje = (
    texto: string,
    tipo: "error" | "exito" = "exito"
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  const cargarDocumentos = useCallback(async (idProfesor: string) => {
    setCargando(true);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(idProfesor, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      mostrarMensaje(
        "No fue posible consultar tus documentos. Revisa los permisos del almacenamiento.",
        "error"
      );
      setDocumentos([]);
      setCargando(false);
      return;
    }

    const archivos = (data ?? []).filter(
      (item) => item.name && !item.name.startsWith(".")
    );

    setDocumentos(archivos as Documento[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    let activo = true;

    async function iniciar() {
      const { data, error } = await supabase.auth.getUser();

      if (!activo) return;

      if (error || !data.user) {
        mostrarMensaje("No se encontró una sesión activa.", "error");
        setCargando(false);
        return;
      }

      setUsuarioId(data.user.id);
      await cargarDocumentos(data.user.id);
    }

    iniciar();

    return () => {
      activo = false;
    };
  }, [cargarDocumentos]);

  function seleccionarArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const seleccionado = event.target.files?.[0];

    setMensaje("");
    setArchivo(null);

    if (!seleccionado) return;

    const extension = obtenerExtension(seleccionado.name);

    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      mostrarMensaje(
        "Formato no permitido. Selecciona PDF, Word o PowerPoint.",
        "error"
      );
      event.target.value = "";
      return;
    }

    if (seleccionado.size > MAX_SIZE) {
      mostrarMensaje(
        "El archivo supera el límite máximo de 10 MB.",
        "error"
      );
      event.target.value = "";
      return;
    }

    setArchivo(seleccionado);
  }

  async function subirDocumento() {
    if (!archivo || !usuarioId) {
      mostrarMensaje("Primero selecciona un documento.", "error");
      return;
    }

    setSubiendo(true);
    setMensaje("");

    const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const ruta = `${usuarioId}/${Date.now()}_${nombreSeguro}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(ruta, archivo, {
        cacheControl: "3600",
        upsert: false,
        contentType: archivo.type || undefined,
      });

    if (error) {
      mostrarMensaje(
        `No se pudo subir el documento: ${error.message}`,
        "error"
      );
      setSubiendo(false);
      return;
    }

    setArchivo(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    await cargarDocumentos(usuarioId);

    mostrarMensaje("Documento cargado correctamente.", "exito");
    setSubiendo(false);
  }

  async function descargarDocumento(nombre: string) {
    if (!usuarioId) return;

    const ruta = `${usuarioId}/${nombre}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(ruta, 60);

    if (error || !data?.signedUrl) {
      mostrarMensaje("No se pudo abrir el documento.", "error");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function eliminarDocumento(nombre: string) {
    if (!usuarioId) return;

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setEliminando(nombre);
    setMensaje("");

    const ruta = `${usuarioId}/${nombre}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([ruta]);

    if (error) {
      mostrarMensaje(
        `No se pudo eliminar el documento: ${error.message}`,
        "error"
      );
      setEliminando(null);
      return;
    }

    setDocumentos((actuales) =>
      actuales.filter((documento) => documento.name !== nombre)
    );

    mostrarMensaje("Documento eliminado correctamente.", "exito");
    setEliminando(null);
  }

  function iconoDocumento(nombre: string) {
    const extension = obtenerExtension(nombre);

    if (extension === "pdf") return "PDF";
    if (["doc", "docx"].includes(extension)) return "DOC";
    if (["ppt", "pptx"].includes(extension)) return "PPT";

    return "FILE";
  }

  return (
    <section className="w-full text-white">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
          Gestión académica
        </p>

        <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
          Mis documentos
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sube, consulta y administra tus documentos académicos.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B1225] p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/15 text-xl text-[#75E5FF]">
            ↑
          </div>

          <div>
            <h3 className="font-bold text-white">
              Cargar documento
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              PDF, Word o PowerPoint · Máximo 10 MB
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#0876A8]/50 bg-[#111D35] p-5 text-center md:p-7">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={seleccionarArchivo}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#0864F5]/20 text-2xl font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/35 disabled:opacity-50"
          >
            +
          </button>

          <p className="mt-3 text-sm font-bold text-white">
            {archivo ? archivo.name : "Seleccionar archivo"}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {archivo
              ? `${formatearTamano(archivo.size)} · Listo para subir`
              : "Busca un documento en tu computadora."}
          </p>

          <button
            type="button"
            onClick={subirDocumento}
            disabled={!archivo || subiendo}
            className="mt-5 w-full rounded-xl bg-[#12418A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1855B5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {subiendo ? "Subiendo documento..." : "Subir documento"}
          </button>
        </div>

        {mensaje && (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              tipoMensaje === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>

      <div className="mt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              Documentos cargados
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Consulta, descarga o elimina tus archivos.
            </p>
          </div>

          <span className="rounded-full border border-[#0864F5]/30 bg-[#0864F5]/10 px-3 py-1.5 text-xs font-bold text-[#75E5FF]">
            {documentos.length} documento(s)
          </span>
        </div>

        {cargando ? (
          <div className="rounded-xl border border-white/10 bg-[#0B1225] p-8 text-center text-sm text-slate-400">
            Cargando documentos...
          </div>
        ) : documentos.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0B1225] p-8 text-center">
            <div className="text-3xl text-slate-500">▤</div>
            <p className="mt-3 font-semibold text-slate-300">
              Todavía no tienes documentos
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Cuando subas un archivo, aparecerá en esta sección.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentos.map((documento) => (
              <article
                key={documento.name}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0B1225] p-4 transition hover:border-[#0864F5]/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-xs font-black text-[#75E5FF]">
                    {iconoDocumento(documento.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-white">
                      {documento.name.replace(/^\d+_/, "")}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {documento.metadata?.size
                        ? formatearTamano(documento.metadata.size)
                        : "Tamaño no disponible"}
                      {" · "}
                      {formatearFecha(documento.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => descargarDocumento(documento.name)}
                    className="rounded-lg border border-[#0864F5]/40 px-3 py-2 text-xs font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/15"
                  >
                    Ver / Descargar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarDocumento(documento.name)}
                    disabled={eliminando === documento.name}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {eliminando === documento.name
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
