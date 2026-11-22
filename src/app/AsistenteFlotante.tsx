
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mensaje = {
  id: number;
  tipo: "usuario" | "asistente";
  texto: string;
};

export default function AsistenteFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      tipo: "asistente",
      texto: "¡Hola! Soy el asistente virtual de IINICIA. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const enviarPregunta = async () => {
    const texto = pregunta.trim();

    if (!texto || cargando) return;

    setMensajes((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        tipo: "usuario",
        texto,
      },
    ]);

    setPregunta("");
    setCargando(true);

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error("No fue posible comprobar tu sesión.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      let url = `${apiUrl}/asistente/publico`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const mfaToken = sessionStorage.getItem("mfaToken");

      // Solo se utiliza la ruta privada cuando existen
      // una sesión y un token MFA.
      if (data.session && mfaToken) {
        url = `${apiUrl}/asistente/preguntar`;

        headers.Authorization = `Bearer ${data.session.access_token}`;
        headers["X-MFA-Token"] = mfaToken;
      }

      const respuesta = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          pregunta: texto,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No fue posible obtener una respuesta."
        );
      }

      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          tipo: "asistente",
          texto: resultado.respuesta || "No recibí una respuesta.",
        },
      ]);
    } catch (error) {
      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 2,
          tipo: "asistente",
          texto:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al comunicarse con el asistente.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {abierto && (
        <div className="flex h-[480px] w-[350px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#0864F5] p-4 text-white">
            <div>
              <h3 className="font-bold">Asistente IINICIA</h3>
              <p className="text-xs text-blue-100">
                Tu apoyo académico virtual
              </p>
            </div>

            <button
              onClick={() => setAbierto(false)}
              className="text-2xl"
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-3">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl p-3 text-sm ${
                  mensaje.tipo === "usuario"
                    ? "self-end bg-[#0864F5] text-white"
                    : "self-start border bg-white text-gray-800"
                }`}
              >
                {mensaje.texto}
              </div>
            ))}

            {cargando && (
              <div className="self-start rounded-xl bg-white p-3 text-sm text-gray-500">
                El asistente está escribiendo...
              </div>
            )}
          </div>

          <form
            onSubmit={(evento) => {
              evento.preventDefault();
              enviarPregunta();
            }}
            className="flex gap-2 border-t bg-white p-3"
          >
            <input
              value={pregunta}
              onChange={(evento) => setPregunta(evento.target.value)}
              placeholder="Escribe tu pregunta..."
              maxLength={2000}
              disabled={cargando}
              className="min-w-0 flex-1 rounded-full border px-4 py-2 text-sm text-gray-800 outline-none focus:border-[#0864F5]"
            />

            <button
              type="submit"
              disabled={cargando || !pregunta.trim()}
              className="rounded-full bg-[#0864F5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {cargando ? "..." : "Enviar"}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAbierto(!abierto)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0864F5] text-3xl text-white shadow-xl transition hover:scale-105"
        aria-label="Abrir asistente IINICIA"
      >
        {abierto ? "×" : "✦"}
      </button>
    </div>
  );
}
