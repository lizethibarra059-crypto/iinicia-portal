
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { MoodleService } from "./moodle.service.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";

@Controller("moodle")
@UseGuards(RolesGuard)
export class MoodleController {
  constructor(private readonly moodleService: MoodleService) {}

  @Get("estado")
  @Roles(
    "superadministrador",
    "administrador",
    "coordinador",
    "profesor",
    "estudiante",
    "soporte",
  )
  async getEstado() {
    const info = await this.moodleService.getSiteInfo();

    return {
      conectado: true,
      mensaje: "Conexión con Moodle correcta",
      sitio: info.sitename,
      version: info.release,
    };
  }

  @Get("cursos")
  @Roles("profesor", "estudiante", "coordinador")
  async getCursos() {
    const cursos = await this.moodleService.getCourses();

    return {
      conectado: true,
      total: Array.isArray(cursos) ? cursos.length : 0,
      cursos,
    };
  }

  @Get("cursos/:id/contenidos")
  @Roles("profesor", "estudiante", "coordinador")
  async getContenidos(
    @Param("id", ParseIntPipe) id: number,
  ) {
    const contenidos = await this.moodleService.getCourseContents(id);

    return {
      conectado: true,
      cursoId: id,
      contenidos,
    };
  }
}
