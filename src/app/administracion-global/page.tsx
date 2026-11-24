
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API = "http://localhost:3001/api/usuarios";

const ROLES = [
  "superadministrador",
  "administrador",
  "coordinador",
  "profesor",
  "estudiante",
  "aspirante",
  "soporte",
] as const;

type Rol = (typeof ROLES)[number];

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  fechaRegistro: string;
  correoConfirmado: boolean;
};

const nombresRoles: Record<string, string> = {
  superadministrador: "Superadministradores",
  administrador: "Administradores",
  coordinador: "Coordinadores",
  profesor: "Profesores",
  estudiante: "Estudiantes",
  aspirante: "Aspirantes",
  soporte: "Soporte técnico",
};

const coloresRoles: Record<string, string> = {
  superadministrador: "bg-purple-400",
  administrador: "bg-blue-400",
  coordinador: "bg-cyan-400",
  profesor: "bg-indigo-400",
  estudiante: "bg-emerald-400",
  aspirante: "bg-orange-400",
  soporte: "bg-pink-400",
};

export default function AdministracionGlobalPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [fechaActualizacion, setFechaActualizacion] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setActualizando(true);
    setError("");

    try {
      const { data: sesionData, error: sesionError } =
        await supabase.auth.getSession();

      if (sesionError || !sesionData.session) {
        router.replace("/login");
        return;
      }

      const mfaToken = sessionStorage.getItem("mfaToken");

      if (!mfaToken) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const { data: usuarioData, error: usuarioError } =
        await supabase.auth.getUser();

      if (usuarioError || !usuarioData.user) {
        router.replace("/login");
        return;
      }

      const { data: perfil, error: errorPerfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", usuarioData.user.id)
        .single();

      if (errorPerfil || !perfil) {
        throw new Error("No se pudo verificar tu perfil.");
      }

      if (perfil.role !== "superadministrador") {
        router.replace("/panel");
        return;
      }

      const respuesta = await fetch(API, {
        headers: {
          Authorization: `Bearer ${sesionData.session.access_token}`,
          "X-MFA-Token": mfaToken,
        },
        cache: "no-store",
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message ||
            "No se pudieron consultar las cuentas de IINICIA."
        );
      }

      setUsuarios(resultado.usuarios ?? []);
      setFechaActualizacion(
        new Date().toLocaleString("es-MX", {
          dateStyle: "short",
          timeStyle: "short",
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al consultar la administración global."
      );
    } finally {
      setActualizando(false);
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const totalesPorRol = useMemo(() => {
    const totales: Record<string, number> = {};

    ROLES.forEach((rol) => {
      totales[rol] = usuarios.filter(
        (usuario) => usuario.rol === rol
      ).length;
    });

    return totales;
  }, [usuarios]);

  const confirmados = usuarios.filter(
    (usuario) => usuario.correoConfirmado
  ).length;

  const pendientes = usuarios.length - confirmados;

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return true;

    return (
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.correo.toLowerCase().includes(texto) ||
      (nombresRoles[usuario.rol] ?? usuario.rol)
        .toLowerCase()
        .includes(texto)
    );
  });

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
          <p className="mt-5 text-sm text-slate-400">
            Cargando administración global...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080B18] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9">
          <Link
            href="/panel"
            className="mb-7 inline-flex text-sm font-semibold text-[#75E5FF] hover:text-white"
          >
            ← Volver al panel
          </Link>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#00B9E8]">
                Control institucional
              </p>

              <h1 className="mt-3 text-3xl font-black md:text-4xl">
                Administración global
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Consulta el estado general de las cuentas y la distribución
                de los integrantes de IINICIA.
              </p>
            </div>

            <button
              onClick={cargarUsuarios}
              disabled={actualizando}
              className="rounded-xl border border-[#0864F5]/40 bg-[#0864F5]/10 px-5 py-3 text-sm font-bold text-[#75E5FF] transition hover:bg-[#0864F5]/20 disabled:opacity-50"
            >
              {actualizando ? "Actualizando..." : "↻ Actualizar datos"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-7 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              titulo: "Usuarios registrados",
              total: usuarios.length,
              detalle: "Cuentas consultadas en Supabase",
              color: "border-blue-400/20",
            },
            {
              titulo: "Correos confirmados",
              total: confirmados,
              detalle: "Usuarios con correo verificado",
              color: "border-emerald-400/20",
            },
            {
              titulo: "Invitaciones pendientes",
              total: pendientes,
              detalle: "Cuentas sin correo confirmado",
              color: "border-orange-400/20",
            },
            {
              titulo: "Roles institucionales",
              total: ROLES.length,
              detalle: "Categorías de acceso configuradas",
              color: "border-purple-400/20",
            },
          ].map((tarjeta) => (
            <article
              key={tarjeta.titulo}
              className={`rounded-2xl border ${tarjeta.color} bg-[#111A30] p-5`}
            >
              <p className="text-sm text-slate-400">{tarjeta.titulo}</p>
              <p className="mt-4 text-3xl font-black">
                {tarjeta.total}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {tarjeta.detalle}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-[#111A30] p-6 md:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Estructura institucional
            </p>

            <h2 className="mt-2 text-xl font-extrabold">
              Distribución por roles
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Cantidad de cuentas registradas en cada categoría.
            </p>
          </div>

          <div className="space-y-6">
            {ROLES.map((rol: Rol) => {
              const total = totalesPorRol[rol] ?? 0;
              const porcentaje =
                usuarios.length > 0
                  ? (total / usuarios.length) * 100
                  : 0;

              return (
                <div key={rol}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-200">
                      {nombresRoles[rol]}
                    </span>

                    <span className="text-sm font-bold text-white">
                      {total}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#080B18]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${coloresRoles[rol]}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-500">
                    {porcentaje.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111A30]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Directorio institucional
              </p>

              <h2 className="mt-2 text-xl font-extrabold">
                Cuentas de IINICIA
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Usuarios encontrados: {usuariosFiltrados.length}
              </p>
            </div>

            <Link
              href="/usuarios"
              className="rounded-xl bg-[#0864F5] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0052D6]"
            >
              Administrar usuarios →
            </Link>
          </div>

          <div className="border-b border-white/10 p-6">
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3 text-sm text-white outline-none focus:border-[#00B9E8]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-[#0B1020] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-t border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {usuario.nombre || "Sin nombre"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {usuario.correo || "Sin correo"}
                    </td>

                    <td className="px-6 py-4">
                      {nombresRoles[usuario.rol] ?? usuario.rol}
                    </td>

                    <td className="px-6 py-4">
                      {usuario.correoConfirmado ? (
                        <span className="text-xs font-semibold text-emerald-300">
                          Confirmado
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-orange-300">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No se encontraron cuentas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-500 md:flex-row">
          <span>IINICIA · Administración global</span>
          <span>
            Última actualización: {fechaActualizacion || "No disponible"}
          </span>
        </footer>
      </div>
    </main>
  );
}
