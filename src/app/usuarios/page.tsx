
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  fechaRegistro: string;
  correoConfirmado: boolean;
};

const nombresRoles: Record<string, string> = {
  superadministrador: "Superadministrador",
  administrador: "Administrador",
  coordinador: "Coordinador",
  profesor: "Profesor",
  estudiante: "Estudiante",
  aspirante: "Aspirante",
  soporte: "Soporte técnico",
};

const coloresRoles: Record<string, string> = {
  superadministrador: "bg-purple-500/15 text-purple-300 border-purple-400/20",
  administrador: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  coordinador: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  profesor: "bg-indigo-500/15 text-indigo-300 border-indigo-400/20",
  estudiante: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  aspirante: "bg-orange-500/15 text-orange-300 border-orange-400/20",
  soporte: "bg-pink-500/15 text-pink-300 border-pink-400/20",
};

export default function UsuariosPage() {
  const router = useRouter();

  const [rolActual, setRolActual] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("estudiante");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");
  const [rolEdicion, setRolEdicion] = useState("estudiante");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargarUsuarios = useCallback(
    async (
      token: string,
      mfaToken: string,
      busquedaActual = "",
      rolActualFiltro = ""
    ) => {
      setCargandoUsuarios(true);
      setError("");

      try {
        const parametros = new URLSearchParams();

        if (busquedaActual.trim()) {
          parametros.set("busqueda", busquedaActual.trim());
        }

        if (rolActualFiltro) {
          parametros.set("rol", rolActualFiltro);
        }

        const respuesta = await fetch(`${API}?${parametros.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-MFA-Token": mfaToken,
          },
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            resultado.message || "No se pudieron consultar los usuarios."
          );
        }

        setUsuarios(resultado.usuarios ?? []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al consultar los usuarios."
        );
      } finally {
        setCargandoUsuarios(false);
      }
    },
    []
  );

  useEffect(() => {
    async function comprobarAcceso() {
      try {
        const { data: sesion } = await supabase.auth.getSession();

        if (!sesion.session) {
          router.replace("/login");
          return;
        }

        const mfaToken = sessionStorage.getItem("mfaToken");

        if (!mfaToken) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        const { data: usuario } = await supabase.auth.getUser();

        if (!usuario.user) {
          router.replace("/login");
          return;
        }

        const { data: perfil, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", usuario.user.id)
          .single();

        if (error || !perfil) {
          setError("No se pudo verificar tu perfil.");
          return;
        }

        if (
          perfil.role !== "superadministrador" &&
          perfil.role !== "administrador"
        ) {
          router.replace("/panel");
          return;
        }

        setRolActual(perfil.role);

        await cargarUsuarios(
          sesion.session.access_token,
          mfaToken
        );
      } catch {
        setError("Ocurrió un error al verificar el acceso.");
      } finally {
        setCargando(false);
      }
    }

    comprobarAcceso();
  }, [router, cargarUsuarios]);

  async function buscarUsuarios() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const mfaToken = sessionStorage.getItem("mfaToken");

    if (!token || !mfaToken) {
      router.replace("/login");
      return;
    }

    await cargarUsuarios(token, mfaToken, busqueda, filtroRol);
  }

  async function crearUsuario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setMensaje("");
    setError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const mfaToken = sessionStorage.getItem("mfaToken");

      if (!token || !mfaToken) {
        router.replace("/login");
        return;
      }

      const respuesta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-MFA-Token": mfaToken,
        },
        body: JSON.stringify({ nombre, correo, rol }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudo crear la cuenta."
        );
      }

      setMensaje(resultado.mensaje || "Invitación enviada correctamente.");
      setNombre("");
      setCorreo("");
      setRol("estudiante");

      await buscarUsuarios();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear la cuenta."
      );
    } finally {
      setEnviando(false);
    }
  }

  function abrirEdicion(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setNombreEdicion(usuario.nombre);
    setRolEdicion(usuario.rol);
    setMensaje("");
    setError("");
  }

  async function guardarEdicion(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!usuarioEditando) return;

    setGuardandoEdicion(true);
    setMensaje("");
    setError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const mfaToken = sessionStorage.getItem("mfaToken");

      if (!token || !mfaToken) {
        router.replace("/login");
        return;
      }

      const respuesta = await fetch(`${API}/${usuarioEditando.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-MFA-Token": mfaToken,
        },
        body: JSON.stringify({
          nombre: nombreEdicion,
          rol: rolEdicion,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message || "No se pudieron guardar los cambios."
        );
      }

      setUsuarioEditando(null);
      setMensaje(resultado.mensaje || "Usuario actualizado correctamente.");

      await buscarUsuarios();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al editar el usuario."
      );
    } finally {
      setGuardandoEdicion(false);
    }
  }

  const rolesDisponibles =
    rolActual === "superadministrador"
      ? [...ROLES]
      : ["profesor", "estudiante", "aspirante", "soporte"];

  const totalUsuarios = usuarios.length;
  const totalEstudiantes = usuarios.filter(
    (u) => u.rol === "estudiante"
  ).length;
  const totalProfesores = usuarios.filter(
    (u) => u.rol === "profesor"
  ).length;
  const totalConfirmados = usuarios.filter(
    (u) => u.correoConfirmado
  ).length;

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />
          <p className="mt-5 text-sm text-slate-400">
            Verificando permisos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080B18] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">

        <header className="mb-9">
          <button
            onClick={() => router.push("/panel")}
            className="mb-7 text-sm font-semibold text-[#75E5FF] hover:text-white"
          >
            ← Volver al panel
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#00B9E8]">
                Administración institucional
              </p>
              <h1 className="mt-3 text-3xl font-black md:text-4xl">
                Gestión de usuarios
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Administra las cuentas, roles y accesos de los integrantes
                de IINICIA desde un solo lugar.
              </p>
            </div>

            <div className="rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/10 px-5 py-3">
              <p className="text-xs text-slate-400">Sesión administrativa</p>
              <p className="mt-1 font-bold text-[#75E5FF]">
                {nombresRoles[rolActual] || rolActual}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { titulo: "Usuarios registrados", total: totalUsuarios },
            { titulo: "Estudiantes", total: totalEstudiantes },
            { titulo: "Profesores", total: totalProfesores },
            { titulo: "Correos confirmados", total: totalConfirmados },
          ].map((tarjeta) => (
            <article
              key={tarjeta.titulo}
              className="rounded-2xl border border-white/10 bg-[#111A30] p-5"
            >
              <p className="text-sm text-slate-400">{tarjeta.titulo}</p>
              <p className="mt-5 text-3xl font-black">{tarjeta.total}</p>
            </article>
          ))}
        </section>

        <section className="mb-9 overflow-hidden rounded-3xl border border-white/10 bg-[#111A30] shadow-2xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-[#10254C] to-[#111A30] px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
              Nuevas cuentas
            </p>
            <h2 className="mt-2 text-xl font-extrabold">Registrar usuario</h2>
            <p className="mt-2 text-sm text-slate-400">
              Completa los datos para enviar una invitación de acceso.
            </p>
          </div>

          <form onSubmit={crearUsuario} className="space-y-6 p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Nombre completo
                </label>
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del usuario"
                  className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3.5 text-white outline-none focus:border-[#00B9E8]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Correo electrónico
                </label>
                <input
                  required
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3.5 text-white outline-none focus:border-[#00B9E8]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Rol de la cuenta
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3.5 text-white outline-none focus:border-[#00B9E8]"
                >
                  {rolesDisponibles.map((r) => (
                    <option key={r} value={r}>
                      {nombresRoles[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {mensaje && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Se enviará una invitación al correo proporcionado.
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="rounded-xl bg-gradient-to-r from-[#0864F5] to-[#00A9D6] px-7 py-3.5 font-bold text-white disabled:opacity-50"
              >
                {enviando ? "Enviando invitación..." : "+ Crear e invitar usuario"}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111A30] shadow-2xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Directorio institucional
              </p>
              <h2 className="mt-2 text-xl font-extrabold">
                Usuarios registrados
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Total de resultados: {usuarios.length}
              </p>
            </div>

            <button
              onClick={buscarUsuarios}
              disabled={cargandoUsuarios}
              className="rounded-xl border border-[#0864F5]/40 bg-[#0864F5]/10 px-5 py-3 text-sm font-bold text-[#75E5FF] disabled:opacity-50"
            >
              {cargandoUsuarios ? "Actualizando..." : "↻ Actualizar"}
            </button>
          </div>

          <div className="grid gap-4 border-b border-white/10 p-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Buscar usuario
              </label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") buscarUsuarios();
                }}
                placeholder="Buscar por nombre o correo..."
                className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3 text-sm text-white outline-none focus:border-[#00B9E8]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Filtrar por rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3 text-sm text-white outline-none focus:border-[#00B9E8]"
              >
                <option value="">Todos los roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {nombresRoles[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                onClick={buscarUsuarios}
                disabled={cargandoUsuarios}
                className="rounded-xl bg-[#0864F5] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Buscar usuarios
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[#0B1020] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-5">Usuario</th>
                  <th className="px-6 py-5">Correo electrónico</th>
                  <th className="px-6 py-5">Rol</th>
                  <th className="px-6 py-5">Registro</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => {
                  const puedeEditar =
                    usuario.id !== undefined &&
                    (rolActual === "superadministrador" ||
                      ["profesor", "estudiante", "aspirante", "soporte"].includes(usuario.rol));

                  return (
                    <tr
                      key={usuario.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 font-bold text-[#75E5FF]">
                            {(usuario.nombre || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">
                            {usuario.nombre || "Sin nombre"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-slate-400">
                        {usuario.correo}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                            coloresRoles[usuario.rol] ||
                            "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {nombresRoles[usuario.rol] || usuario.rol}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-400">
                        {usuario.fechaRegistro
                          ? new Date(usuario.fechaRegistro).toLocaleDateString("es-MX")
                          : "No disponible"}
                      </td>

                      <td className="px-6 py-5">
                        {usuario.correoConfirmado ? (
                          <span className="text-xs font-semibold text-emerald-300">
                            ● Confirmado
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-orange-300">
                            ● Pendiente
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {puedeEditar ? (
                          <button
                            onClick={() => abrirEdicion(usuario)}
                            className="rounded-lg border border-[#00B9E8]/30 bg-[#00B9E8]/10 px-4 py-2 text-xs font-bold text-[#75E5FF] hover:bg-[#00B9E8]/20"
                          >
                            Editar
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Restringido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!cargandoUsuarios && usuarios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {cargandoUsuarios && (
            <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-slate-400">
              Consultando usuarios...
            </div>
          )}

          <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-500">
            IINICIA · Administración de usuarios y roles
          </div>
        </section>

        {usuarioEditando && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
            <form
              onSubmit={guardarEdicion}
              className="w-full max-w-lg space-y-5 rounded-2xl border border-white/10 bg-[#111A30] p-6 shadow-2xl"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#00B9E8]">
                  Administración de cuentas
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Editar usuario
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {usuarioEditando.correo}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Nombre completo
                </label>
                <input
                  required
                  value={nombreEdicion}
                  onChange={(e) => setNombreEdicion(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3 text-white outline-none focus:border-[#00B9E8]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Rol
                </label>
                <select
                  value={rolEdicion}
                  onChange={(e) => setRolEdicion(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080B18] px-4 py-3 text-white outline-none focus:border-[#00B9E8]"
                >
                  {rolesDisponibles.map((r) => (
                    <option key={r} value={r}>
                      {nombresRoles[r]}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  disabled={guardandoEdicion}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardandoEdicion || !nombreEdicion.trim()}
                  className="rounded-xl bg-[#0864F5] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        )}

        {mensaje && (
          <div className="fixed bottom-5 left-5 z-[10001] rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 shadow-xl">
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}
