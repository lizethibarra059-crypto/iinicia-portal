
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service.js";

type Rol =
  | "superadministrador"
  | "administrador"
  | "coordinador"
  | "profesor"
  | "estudiante"
  | "aspirante"
  | "soporte";

type OpcionesListado = {
  busqueda?: string;
  rol?: string;
  rolSolicitante: string;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listarUsuarios(opciones: OpcionesListado) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      throw new InternalServerErrorException(
        "No se pudieron consultar las cuentas de Supabase.",
      );
    }

    const usuariosAuth = data.users;

    if (usuariosAuth.length === 0) {
      return { total: 0, usuarios: [] };
    }

    const ids = usuariosAuth.map((usuario) => usuario.id);

    const { data: perfiles, error: errorPerfiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .in("id", ids);

    if (errorPerfiles) {
      throw new InternalServerErrorException(
        "No se pudieron consultar los perfiles.",
      );
    }

    const perfilesPorId = new Map(
      (perfiles ?? []).map((perfil) => [perfil.id, perfil]),
    );

    let usuarios = usuariosAuth.map((usuario) => {
      const perfil = perfilesPorId.get(usuario.id);

      return {
        id: usuario.id,
        nombre: perfil?.full_name ?? "",
        correo: usuario.email ?? "",
        rol: perfil?.role ?? "sin_asignar",
        fechaRegistro: perfil?.created_at ?? usuario.created_at,
        correoConfirmado: Boolean(usuario.email_confirmed_at),
      };
    });

    if (opciones.rolSolicitante === "administrador") {
      const rolesPermitidos = [
        "profesor",
        "estudiante",
        "aspirante",
        "soporte",
      ];

      usuarios = usuarios.filter((usuario) =>
        rolesPermitidos.includes(usuario.rol),
      );
    }

    if (opciones.rol) {
      usuarios = usuarios.filter(
        (usuario) => usuario.rol === opciones.rol,
      );
    }

    if (opciones.busqueda) {
      const texto = opciones.busqueda.toLowerCase();

      usuarios = usuarios.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(texto) ||
          usuario.correo.toLowerCase().includes(texto),
      );
    }

    return {
      total: usuarios.length,
      usuarios,
    };
  }

  async crearUsuario(nombre: string, correo: string, rol: Rol) {
    const supabase = this.supabaseService.getClient();

    const { data, error } =
      await supabase.auth.admin.inviteUserByEmail(correo, {
        data: {
          full_name: nombre,
        },
        redirectTo:
          "http://localhost:3000/actualizar-password",
      });

    if (error || !data.user) {
      throw new BadRequestException(
        error?.message || "Supabase no pudo enviar la invitación.",
      );
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("profiles")
      .update({
        full_name: nombre,
        role: rol,
      })
      .eq("id", data.user.id)
      .select("id")
      .maybeSingle();

    if (errorPerfil || !perfil) {
      await supabase.auth.admin.deleteUser(data.user.id);

      throw new BadRequestException(
        "No se pudo asignar el rol. La cuenta creada fue cancelada.",
      );
    }

    return {
      mensaje: "Invitación enviada correctamente.",
      usuario: {
        id: data.user.id,
        nombre,
        correo,
        rol,
      },
    };
  }

  async editarUsuario(
    id: string,
    nombre: string,
    rol: Rol,
    rolSolicitante: string,
    solicitanteId: string,
  ) {
    if (id === solicitanteId) {
      throw new ForbiddenException(
        "No puedes modificar tu propia cuenta desde esta sección.",
      );
    }

    const supabase = this.supabaseService.getClient();

    const { data: perfilActual, error: errorConsulta } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();

    if (errorConsulta) {
      throw new InternalServerErrorException(
        "No se pudo consultar el perfil del usuario.",
      );
    }

    if (!perfilActual) {
      throw new NotFoundException("No se encontró el usuario.");
    }

    const rolesProtegidos = [
      "superadministrador",
      "administrador",
      "coordinador",
    ];

    if (
      rolSolicitante === "administrador" &&
      (
        rolesProtegidos.includes(perfilActual.role) ||
        !["profesor", "estudiante", "aspirante", "soporte"].includes(rol)
      )
    ) {
      throw new ForbiddenException(
        "No tienes permisos para modificar este usuario o asignar ese rol.",
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: nombre,
        role: rol,
      })
      .eq("id", id)
      .select("id, full_name, role")
      .single();

    if (error || !data) {
      throw new BadRequestException(
        "No se pudieron guardar los cambios del usuario.",
      );
    }

    return {
      mensaje: "Usuario actualizado correctamente.",
      usuario: {
        id: data.id,
        nombre: data.full_name,
        rol: data.role,
      },
    };
  }
}
