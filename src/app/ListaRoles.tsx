
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
    let activo = true;

    fetch("http://localhost:3001/api/roles")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar los roles");
        }

        return respuesta.json();
      })
      .then((datos: Rol[]) => {
        if (activo) {
          setRoles(datos);
        }
      })
      .catch(() => {
        if (activo) {
          setError("No fue posible cargar los roles.");
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">

      {/* encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00B9E8]" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
            Administración institucional
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
          Roles de la plataforma
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Conoce los diferentes perfiles y niveles de acceso de IINICIA.
        </p>
      </div>

      {/* cargando */}
      {cargando && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-white/10 bg-[#111A30] p-5"
            >
              <div className="h-4 w-2/3 rounded bg-white/10" />
              <div className="mt-4 h-3 w-1/3 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 font-bold text-red-400">
              !
            </span>

            <div>
              <h3 className="font-bold text-red-300">
                No se pudieron cargar los roles
              </h3>
              <p className="mt-1 text-sm text-red-200/70">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* roles */}
      {!cargando && !error && (
        roles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {roles.map((rol, index) => (
              <article
                key={rol.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17233E] to-[#10182C] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#0864F5]/60 hover:shadow-xl hover:shadow-blue-950/30"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#0864F5]/10 blur-2xl transition group-hover:bg-[#00B9E8]/20" />

                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-sm font-extrabold text-[#75E5FF] transition group-hover:bg-[#0864F5]/30">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold text-white transition group-hover:text-[#75E5FF]">
                      {rol.nombre}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Rol institucional
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#0864F5] to-[#00B9E8] transition-all duration-300 group-hover:w-full" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111A30] px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0864F5]/30 bg-[#0864F5]/10 text-xl font-bold text-[#75E5FF]">
              R
            </div>

            <h3 className="mt-5 font-bold text-white">
              No hay roles disponibles
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              No se encontraron roles para mostrar.
            </p>
          </div>
        )
      )}
    </section>
  );
}
