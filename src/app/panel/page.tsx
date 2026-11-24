
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import CursosMoodle from "../CursosMoodle";
import CoordinadorMoodle from "../CoordinadorMoodle";
import IncidenciasSoporte from "../IncidenciasSoporte";
import FormularioIncidencia from "../FormularioIncidencia";
import ProfesorMoodle from "../ProfesorMoodle";
import EntregasDocumentos from "../EntregasDocumentos";
import GestionAcademica from "../GestionAcademica";

type Perfil = {
  full_name: string;
  role: string;
};

type Opcion = {
  titulo: string;
  descripcion: string;
  icono: string;
};

const API = "http://localhost:3001/api/autenticacion";

const opcionesPorRol: Record<string, Opcion[]> = {
  superadministrador: [
    {
      titulo: "Administración global",
      descripcion:
        "Supervisar la configuración y administración general de IINICIA.",
      icono: "GL",
    },
    {
      titulo: "Gestión de usuarios y roles",
      descripcion:
        "Consultar y administrar las cuentas y los roles de la plataforma.",
      icono: "US",
    },
    {
      titulo: "Supervisión del sistema",
      descripcion:
        "Consultar el estado general y los servicios del portal.",
      icono: "SI",
    },
  ],

  administrador: [
    {
      titulo: "Gestión de usuarios",
      descripcion: "Administrar las cuentas y los roles del portal.",
      icono: "US",
    },
    {
      titulo: "Entregas de documentos",
      descripcion: "Revisar y descargar los documentos entregados.",
      icono: "DO",
    },
    {
      titulo: "Gestión académica",
      descripcion:
        "Consultar y organizar las actividades del portal.",
      icono: "AC",
    },
  ],

  profesor: [
    {
      titulo: "Mis documentos",
      descripcion:
        "Consultar y gestionar tus documentos académicos.",
      icono: "DO",
    },
  ],

  estudiante: [
    {
      titulo: "Materiales académicos",
      descripcion:
        "Acceder a los recursos de aprendizaje disponibles.",
      icono: "MA",
    },
  ],

  coordinador: [
    {
      titulo: "Supervisión académica",
      descripcion:
        "Consultar cursos, participantes y actividades académicas.",
      icono: "SA",
    },
    {
      titulo: "Seguimiento de cursos",
      descripcion:
        "Dar seguimiento a los cursos registrados en Moodle.",
      icono: "CU",
    },
  ],

  aspirante: [
    {
      titulo: "Información de ingreso",
      descripcion:
        "Consultar información para ingresar a IINICIA.",
      icono: "AD",
    },
    {
      titulo: "Proceso de admisión",
      descripcion:
        "Consultar información sobre el proceso de ingreso.",
      icono: "IN",
    },
  ],

  soporte: [
    {
      titulo: "Soporte técnico",
      descripcion:
        "Consultar y atender las solicitudes de asistencia técnica.",
      icono: "ST",
    },
    {
      titulo: "Incidencias",
      descripcion:
        "Revisar reportes y dar seguimiento a los problemas técnicos.",
      icono: "IC",
    },
  ],
};

const nombresRoles: Record<string, string> = {
  superadministrador: "Superadministrador",
  administrador: "Administrador",
  profesor: "Profesor",
  estudiante: "Estudiante",
  coordinador: "Coordinador",
  aspirante: "Aspirante",
  soporte: "Soporte técnico",
};

export default function PanelPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      try {
        const { data: sesionData, error: sesionError } =
          await supabase.auth.getSession();

        if (!activo) return;

        if (sesionError || !sesionData.session) {
          router.replace("/login");
          return;
        }

        const mfaToken = sessionStorage.getItem("mfaToken");

        if (!mfaToken) {
          await supabase.auth.signOut();
          if (activo) router.replace("/login");
          return;
        }

        const respuestaMfa = await fetch(`${API}/validar`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sesionData.session.access_token}`,
            "X-MFA-Token": mfaToken,
          },
        });

        if (!activo) return;

        if (!respuestaMfa.ok) {
          sessionStorage.removeItem("mfaToken");
          sessionStorage.removeItem("idVerificacion");

          await supabase.auth.signOut();

          if (activo) router.replace("/login");
          return;
        }

        const { data: usuarioData, error: usuarioError } =
          await supabase.auth.getUser();

        if (!activo) return;

        if (usuarioError || !usuarioData.user) {
          sessionStorage.removeItem("mfaToken");
          await supabase.auth.signOut();

          if (activo) router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", usuarioData.user.id)
          .single();

        if (!activo) return;

        if (error || !data) {
          setErrorPerfil(true);
          setCargando(false);
          return;
        }

        setPerfil(data as Perfil);
        setCargando(false);
      } catch {
        if (!activo) return;

        setErrorPerfil(true);
        setCargando(false);
      }
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [router]);

  async function cerrarSesion() {
    setCerrandoSesion(true);

    sessionStorage.removeItem("mfaToken");
    sessionStorage.removeItem("idVerificacion");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setCerrandoSesion(false);
      alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      return;
    }

    router.replace("/login");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#00B9E8]" />

          <p className="mt-5 text-sm text-slate-400">
            Cargando tu perfil...
          </p>
        </div>
      </main>
    );
  }

  if (errorPerfil || !perfil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] px-4 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111A30] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">
            !
          </div>

          <h1 className="mt-6 text-xl font-bold">
            No pudimos cargar tu perfil
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Comprueba tu conexión e inténtalo de nuevo. Si el problema
            continúa, revisaremos la configuración de Supabase.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#0864F5] px-6 py-3 font-bold text-white transition hover:bg-[#0052D6]"
          >
            Reintentar
          </button>

          <button
            onClick={cerrarSesion}
            className="mt-3 block w-full rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Volver al inicio de sesión
          </button>
        </section>
      </main>
    );
  }

  const opciones = opcionesPorRol[perfil.role] ?? [];
  const nombreRol = nombresRoles[perfil.role] ?? perfil.role;

  return (
    <main className="flex min-h-screen bg-[#080B18] text-white">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#0B1020] lg:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <Link href="/" className="inline-block">
            <img
              src="/logo-iinicia.png"
              alt="IINICIA"
              className="h-24 w-40 object-contain object-left"
            />
          </Link>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00B9E8]">
            Portal académico
          </p>
        </div>

        <div className="flex-1 px-4 py-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Menú principal
          </p>

          <nav className="space-y-2">
            <a
              href="#inicio-panel"
              className="flex items-center gap-3 rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 px-4 py-3 font-semibold text-[#75E5FF]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0864F5]/25">
                ◈
              </span>
              Inicio
            </a>

            <a
              href="#espacio-academico"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                ◉
              </span>
              Mi espacio académico
            </a>

            <a
              href="#mis-opciones"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                ▪
              </span>
              Mis secciones
            </a>
          </nav>

          <div className="mt-12 rounded-2xl border border-[#0864F5]/20 bg-gradient-to-br from-[#0864F5]/15 to-[#00B9E8]/5 p-4">
            <p className="text-xs font-bold text-[#75E5FF]">
              IINICIA
            </p>

            <p className="mt-2 text-sm font-semibold text-white">
              Educación e innovación
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Tu espacio para aprender, crecer y desarrollar nuevas ideas.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0864F5]/20 font-bold text-[#75E5FF]">
              {perfil.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {perfil.full_name || "Usuario"}
              </p>

              <p className="text-xs text-slate-400">
                {nombreRol}
              </p>
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            disabled={cerrandoSesion}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >
            {cerrandoSesion ? "Cerrando sesión..." : "↪ Cerrar sesión"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080B18]/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Link href="/">
                <img
                  src="/logo-iinicia.png"
                  alt="IINICIA"
                  className="h-14 w-20 object-contain"
                />
              </Link>
            </div>

            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00B9E8]">
                Plataforma institucional
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Instituto de Innovación y Ciencias Aplicadas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-white">
                  {perfil.full_name || "Usuario"}
                </p>

                <p className="text-xs text-slate-400">
                  {nombreRol}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 font-bold text-[#75E5FF]">
                {perfil.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <button
                onClick={cerrarSesion}
                disabled={cerrandoSesion}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 lg:hidden"
              >
                {cerrandoSesion ? "Saliendo..." : "Salir"}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <section
            id="inicio-panel"
            className="relative overflow-hidden rounded-3xl border border-[#0864F5]/30 bg-gradient-to-br from-[#10254C] via-[#10203E] to-[#10182C] p-7 shadow-2xl shadow-blue-950/20 md:p-10"
          >
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#00B9E8]/20" />

            <div className="pointer-events-none absolute -right-8 -top-20 h-60 w-60 rounded-full border border-[#0864F5]/30" />

            <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[#0864F5]/20 blur-[80px]" />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00B9E8]/30 bg-[#00B9E8]/10 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#00B9E8]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#75E5FF]">
                  Portal académico IINICIA
                </span>
              </div>

              <h1 className="mt-7 text-3xl font-black leading-tight text-white md:text-5xl">
                ¡Bienvenido/a,{" "}
                <span className="bg-gradient-to-r from-[#75E5FF] to-[#0864F5] bg-clip-text text-transparent">
                  {perfil.full_name || "usuario"}
                </span>
                !
              </h1>

              <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                Este es tu espacio personal dentro del portal IINICIA.
                Desde aquí puedes consultar tus recursos y acceder a las
                herramientas disponibles para tu cuenta.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Tu rol
                </span>

                <span className="rounded-lg bg-[#0864F5]/20 px-3 py-1 text-sm font-bold text-[#75E5FF]">
                  {nombreRol}
                </span>
              </div>
            </div>
          </section>

          <section id="espacio-academico" className="mt-12">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Tu plataforma
              </p>

              <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
                Mi espacio académico
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Accede a tus cursos, materiales y recursos académicos.
              </p>
            </div>

            {perfil.role === "administrador" && (
              <>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                  <EntregasDocumentos />
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                  <GestionAcademica />
                </div>
              </>
            )}

            {perfil.role === "coordinador" && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                <CoordinadorMoodle />
              </div>
            )}

            {(perfil.role === "estudiante" ||
              perfil.role === "profesor") && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                <CursosMoodle />
              </div>
            )}

            {perfil.role === "profesor" && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                <ProfesorMoodle />
              </div>
            )}

            {(perfil.role === "profesor" ||
              perfil.role === "estudiante" ||
              perfil.role === "coordinador" ||
              perfil.role === "aspirante") && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                <FormularioIncidencia />
              </div>
            )}

            {perfil.role === "soporte" && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-4 md:p-6">
                <IncidenciasSoporte />
              </div>
            )}
          </section>

          <section id="mis-opciones" className="mt-12">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B9E8]">
                Herramientas disponibles
              </p>

              <h2 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
                Mis secciones
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Estas son las secciones disponibles para tu tipo de cuenta.
              </p>
            </div>

            {opciones.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {opciones.map((opcion) => {
                  const esGestionUsuarios =
                    opcion.titulo === "Gestión de usuarios y roles" ||
                    opcion.titulo === "Gestión de usuarios";

                  const esEntregaDocumentos =
                    opcion.titulo === "Entregas de documentos";

                  const esGestionAcademica =
                    opcion.titulo === "Gestión académica";

                  const esAdministracionGlobal =
                    opcion.titulo === "Administración global";

                  const esSupervisionSistema =
                    opcion.titulo === "Supervisión del sistema";

                  return (
                    <article
                      key={opcion.titulo}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111A30] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#0864F5]/60 hover:bg-[#151F39] hover:shadow-xl hover:shadow-blue-950/20"
                    >
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0864F5]/10 blur-2xl transition group-hover:bg-[#00B9E8]/15" />

                      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#0864F5]/30 bg-[#0864F5]/15 text-sm font-black tracking-wider text-[#75E5FF]">
                        {opcion.icono}
                      </div>

                      <h3 className="relative mt-6 text-lg font-bold text-white">
                        {opcion.titulo}
                      </h3>

                      <p className="relative mt-3 text-sm leading-7 text-slate-400">
                        {opcion.descripcion}
                      </p>

                      {esAdministracionGlobal ? (
                        <Link
                          href="/administracion-global"
                          className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#75E5FF] transition hover:gap-4"
                        >
                          Abrir administración global →
                        </Link>
                      ) : esSupervisionSistema ? (
                        <Link
                          href="/supervision-sistema"
                          className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#75E5FF] transition hover:gap-4"
                        >
                          Abrir supervisión del sistema →
                        </Link>
                      ) : esGestionUsuarios ? (
                        <Link
                          href="/usuarios"
                          className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#75E5FF] transition hover:gap-4"
                        >
                          Abrir gestión de usuarios →
                        </Link>
                      ) : esEntregaDocumentos ? (
                        <a
                          href="#espacio-academico"
                          className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#75E5FF] transition hover:gap-4"
                        >
                          Consultar entregas →
                        </a>
                      ) : esGestionAcademica ? (
                        <a
                          href="#espacio-academico"
                          className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#75E5FF] transition hover:gap-4"
                        >
                          Consultar gestión académica →
                        </a>
                      ) : (
                        <p className="relative mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#00B9E8]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00B9E8]" />

                          {perfil.role === "coordinador" ||
                          perfil.role === "soporte" ||
                          perfil.role === "profesor"
                            ? "Consulta disponible en espacio académico"
                            : "Sección en preparación"}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-[#111A30] p-6 text-slate-400">
                Tu cuenta todavía no tiene secciones asignadas. Contacta
                al administrador del portal.
              </p>
            )}
          </section>

          <footer className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 py-8 text-center md:flex-row md:text-left">
            <Link href="/">
              <img
                src="/logo-iinicia.png"
                alt="IINICIA"
                className="h-16 w-28 object-contain"
              />
            </Link>

            <p className="text-xs text-slate-500">
              Instituto de Innovación y Ciencias Aplicadas · Portal académico
            </p>

            <a
              href="#inicio-panel"
              className="text-sm font-semibold text-[#75E5FF] transition hover:text-white"
            >
              Volver arriba ↑
            </a>
          </footer>
        </div>
      </div>
    </main>
  );
}
