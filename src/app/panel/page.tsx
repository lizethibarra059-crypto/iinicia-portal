
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Perfil = {
  full_name: string;
  role: string;
};

type Opcion = {
  titulo: string;
  descripcion: string;
  icono: string;
};

const opcionesPorRol: Record<string, Opcion[]> = {
  superadministrador: [
    {
      titulo: "Administración global",
      descripcion:
        "Supervisar la configuración y administración general de IINICIA.",
      icono: "Global",
    },
    {
      titulo: "Gestión de usuarios y roles",
      descripcion:
        "Consultar y administrar las cuentas y los roles de la plataforma.",
      icono: "Usuarios",
    },
    {
      titulo: "Supervisión del sistema",
      descripcion:
        "Consultar el estado general y los servicios del portal.",
      icono: "Sistema",
    },
  ],
  administrador: [
    {
      titulo: "Gestión de usuarios",
      descripcion: "Administrar las cuentas y los roles del portal.",
      icono: "Usuarios",
    },
    {
      titulo: "Entregas de documentos",
      descripcion: "Revisar y descargar los documentos entregados.",
      icono: "Documentos",
    },
    {
      titulo: "Gestión académica",
      descripcion: "Consultar y organizar las actividades del portal.",
      icono: "Académico",
    },
  ],
  profesor: [
    {
      titulo: "Mis documentos",
      descripcion: "Consultar y gestionar tus documentos académicos.",
      icono: "Documentos",
    },
    {
      titulo: "Mis cursos",
      descripcion: "Consultar tus cursos y actividades académicas.",
      icono: "Cursos",
    },
  ],
  estudiante: [
    {
      titulo: "Mis cursos",
      descripcion: "Consultar tus cursos y materiales académicos.",
      icono: "Cursos",
    },
    {
      titulo: "Materiales académicos",
      descripcion: "Acceder a los recursos de aprendizaje disponibles.",
      icono: "Materiales",
    },
  ],
  coordinador: [
    {
      titulo: "Supervisión académica",
      descripcion: "Consultar las actividades y entregas académicas.",
      icono: "Supervisión",
    },
    {
      titulo: "Seguimiento de cursos",
      descripcion: "Dar seguimiento a las actividades de los cursos.",
      icono: "Cursos",
    },
  ],
  aspirante: [
    {
      titulo: "Información de ingreso",
      descripcion: "Consultar información para ingresar a IINICIA.",
      icono: "Admisiones",
    },
    {
      titulo: "Proceso de admisión",
      descripcion: "Consultar información sobre el proceso de ingreso.",
      icono: "Ingreso",
    },
  ],
  soporte: [
    {
      titulo: "Soporte técnico",
      descripcion: "Consultar opciones de asistencia técnica.",
      icono: "Ayuda",
    },
    {
      titulo: "Incidencias",
      descripcion: "Preparar el seguimiento de problemas técnicos.",
      icono: "Incidencias",
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
      const { data: sesionData, error: sesionError } =
        await supabase.auth.getSession();

      if (!activo) return;

      if (sesionError || !sesionData.session) {
        router.replace("/login");
        return;
      }

      const { data: usuarioData, error: usuarioError } =
        await supabase.auth.getUser();

      if (!activo) return;

      if (usuarioError || !usuarioData.user) {
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
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [router]);

  async function cerrarSesion() {
    setCerrandoSesion(true);

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando tu perfil...</p>
      </main>
    );
  }

  if (errorPerfil || !perfil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            No pudimos cargar tu perfil
          </h1>

          <p className="mt-3 text-gray-600">
            Comprueba tu conexión e inténtalo de nuevo. Si el problema
            continúa, revisaremos la configuración de Supabase.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Reintentar
          </button>
        </section>
      </main>
    );
  }

  const opciones = opcionesPorRol[perfil.role] ?? [];
  const nombreRol = nombresRoles[perfil.role] ?? perfil.role;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-teal-800">
            IINICIA
          </Link>

          <button
            onClick={cerrarSesion}
            disabled={cerrandoSesion}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl bg-teal-800 px-7 py-9 text-white sm:px-10">
          <p className="text-sm font-medium text-teal-100">
            PORTAL ACADÉMICO
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            ¡Bienvenido/a, {perfil.full_name || "usuario"}!
          </h1>

          <p className="mt-3 text-teal-50">
            Este es tu espacio personal dentro del portal IINICIA.
          </p>

          <div className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            Rol: {nombreRol}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Mi espacio académico
            </h2>

            <p className="mt-2 text-gray-600">
              Estas son las secciones preparadas para tu tipo de cuenta.
            </p>
          </div>

          {opciones.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {opciones.map((opcion) => (
                <article
                  key={opcion.titulo}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                    {opcion.icono.slice(0, 3).toUpperCase()}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-900">
                    {opcion.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {opcion.descripcion}
                  </p>

                  <p className="mt-4 text-xs font-medium text-teal-700">
                    Sección en preparación
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-white p-6 text-gray-600">
              Tu cuenta todavía no tiene secciones asignadas. Contacta al
              administrador del portal.
            </p>
          )}
        </section>

        <footer className="mt-12 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          IINICIA · Portal académico
        </footer>
      </div>
    </main>
  );
}
