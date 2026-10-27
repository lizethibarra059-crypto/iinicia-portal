
import { Controller, Get } from "@nestjs/common";
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
}
