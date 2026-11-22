
import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Req,
} from "@nestjs/common";

import type { Request } from "express";
import { AsistenteService } from "./asistente.service.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";

type SolicitudAutenticada = Request & {
  user?: {
    id: string;
    role: string;
  };
};

const ROLES_PERMITIDOS = [
  "superadministrador",
  "administrador",
  "coordinador",
  "profesor",
  "estudiante",
  "aspirante",
  "soporte",
] as const;

@Controller("asistente")
@UseGuards(RolesGuard)
export class AsistenteController {
  constructor(
    private readonly asistenteService: AsistenteService,
  ) {}

  @Post("preguntar")
  @Roles(...ROLES_PERMITIDOS)
  async preguntar(
    @Req() solicitud: SolicitudAutenticada,
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

    const rol = solicitud.user?.role;

    if (!rol) {
      throw new BadRequestException(
        "No fue posible identificar tu perfil.",
      );
    }

    const respuesta = await this.asistenteService.responder(
      pregunta,
      rol,
    );

    return { respuesta };
  }
}