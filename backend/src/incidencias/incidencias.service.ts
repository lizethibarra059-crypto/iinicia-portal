
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service.js";

type NuevaIncidencia = {
  titulo: string;
  descripcion: string;
  categoria?: string;
  prioridad?: "baja" | "media" | "alta" | "urgente";
};

@Injectable()
export class IncidenciasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(
    usuarioId: string,
    datos: NuevaIncidencia,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("incidencias")
      .insert({
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        categoria: datos.categoria?.trim() || "general",
        prioridad: datos.prioridad || "media",
        creado_por: usuarioId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`No se pudo crear la incidencia: ${error.message}`);
    }

    return data;
  }

  async listar(
    usuarioId: string,
    rol: string,
  ) {
    const supabase = this.supabaseService.getClient();

    let consulta = supabase
      .from("incidencias")
      .select("*")
      .order("creado_en", { ascending: false });

    if (rol !== "soporte" && rol !== "superadministrador") {
      consulta = consulta.eq("creado_por", usuarioId);
    }

    const { data, error } = await consulta;

    if (error) {
      throw new Error(`No se pudieron consultar las incidencias: ${error.message}`);
    }

    return data;
  }

  async actualizarEstado(
    id: number,
    estado: "abierta" | "en_proceso" | "resuelta" | "cerrada",
    rol: string,
  ) {
    if (rol !== "soporte" && rol !== "superadministrador") {
      throw new ForbiddenException(
        "Solo soporte puede gestionar el estado de las incidencias.",
      );
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("incidencias")
      .update({
        estado,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException("No se encontró la incidencia.");
    }

    return data;
  }
}
