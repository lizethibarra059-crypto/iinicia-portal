
import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class UsuariosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crearUsuario(
    nombre: string,
    correo: string,
    rol: Rol,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data, error } =
      await supabase.auth.admin.inviteUserByEmail(correo, {
        data: {
          full_name: nombre,
        },
      });

    if (error || !data.user) {
      throw new BadRequestException(
        "No se pudo enviar la invitación. Verifica el correo y la configuración de Supabase.",
      );
    }

    const { error: errorPerfil } = await supabase
      .from("profiles")
      .update({
        full_name: nombre,
        role: rol,
      })
      .eq("id", data.user.id);

    if (errorPerfil) {
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
}
