
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { MoodleService } from "./moodle.service.js";

@Controller("moodle")
export class MoodleController {
  constructor(private readonly moodleService: MoodleService) {}

  @Get("estado")
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
  async getCursos() {
    const cursos = await this.moodleService.getCourses();

    return {
      conectado: true,
      total: Array.isArray(cursos) ? cursos.length : 0,
      cursos,
    };
  }

  @Get("cursos/:id/contenidos")
  async getContenidos(
    @Param("id", ParseIntPipe) id: number,
  ) {
    const contenidos =
      await this.moodleService.getCourseContents(id);

    return {
      conectado: true,
      cursoId: id,
      contenidos,
    };
  }
}
