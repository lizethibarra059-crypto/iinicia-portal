
"use client";

import { useEffect, useState } from "react";

type EstadoAPI = {
  mensaje: string;
  estado: string;
};

export default function EstadoAPI() {
  const [resultado, setResultado] = useState<EstadoAPI | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function comprobarAPI() {
      try {
        const respuesta = await fetch("http://localhost:3001/api/estado");

        if (!respuesta.ok) {
          throw new Error("No se pudo conectar con la API");
        }

        const datos: EstadoAPI = await respuesta.json();
        setResultado(datos);
      } catch {
        setError(true);
      }
    }

    comprobarAPI();
  }, []);

  if (error) {
    return (
      <p className="mt-4 text-sm text-red-700">
        No se pudo conectar con el backend de IINICIA.
      </p>
    );
  }

  if (!resultado) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        Comprobando conexión con el servidor...
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg bg-teal-50 p-4">
      <p className="font-semibold text-teal-800">
        {resultado.mensaje}
      </p>
      <p className="mt-1 text-sm text-teal-700">
        Estado: {resultado.estado}
      </p>
    </div>
  );
}
