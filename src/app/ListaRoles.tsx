
"use client";

import { useEffect, useState } from "react";

type Rol = {
  id: string;
  nombre: string;
};

export default function ListaRoles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/roles")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar los roles");
        }

        return respuesta.json();
      })
      .then((datos: Rol[]) => {
        setRoles(datos);
      })
      .catch(() => {
        setError("No fue posible cargar los roles.");
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="text-2xl font-bold text-slate-900">
        Roles de la plataforma
      </h2>

      {cargando && <p className="mt-4">Cargando roles...</p>}

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {!cargando && !error && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {roles.map((rol) => (
            <li
              key={rol.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              {rol.nombre}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
