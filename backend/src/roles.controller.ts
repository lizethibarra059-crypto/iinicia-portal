
import {
  Controller,
  Get,
  UseGuards,
  ServiceUnavailableException,
} from "@nestjs/common";
import { SupabaseService } from "./supabase/supabase.service.js";
import { AdminGuard } from "./auth/admin.guard.js";

@Controller("api/roles")
export class RolesController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  obtenerRoles() {
    return [
      { id: "superadministrador", nombre: "Superadministrador" },
      { id: "administrador", nombre: "Administrador" },
      { id: "coordinador", nombre: "Coordinador" },
      { id: "profesor", nombre: "Profesor" },
      { id: "estudiante", nombre: "Estudiante" },
      { id: "aspirante", nombre: "Aspirante" },
      { id: "soporte", nombre: "Soporte" },
    ];
  }

  @Get("estado-supabase")
  async comprobarSupabase() {
    const { error } = await this.supabaseService
      .getClient()
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error) {
      throw new ServiceUnavailableException(
        "No se pudo comprobar la conexión con Supabase.",
      );
    }

    return {
      conectado: true,
      mensaje: "Conexión con Supabase correcta",
    };
  }
}
