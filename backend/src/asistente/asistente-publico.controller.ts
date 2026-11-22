
import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from "@nestjs/common";

import { AsistenteService } from "./asistente.service.js";

@Controller("asistente")
export class AsistentePublicoController {
  constructor(
    private readonly asistenteService: AsistenteService,
  ) {}

  @Post("publico")
  async preguntar(
    @Body() body: { pregunta: string },
  ) {
    const pregunta = body.pregunta?.trim();

    if (!pregunta) {
      throw new BadRequestException(
        "Escribe una pregunta para el asistente.",
      );
    }

    if (pregunta.length > 2000) {
      throw new BadRequestException(
        "La pregunta no puede superar los 2000 caracteres.",
      );
    }

    const respuesta = await this.asistenteService.responder(
      pregunta,
      "visitante",
    );

    return { respuesta };
  }
}
