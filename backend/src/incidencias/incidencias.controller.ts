
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { IncidenciasService } from "./incidencias.service.js";

type SolicitudAutenticada = Request & {
  user?: {
    id: string;
    role: string;
  };
};

@Controller("api/incidencias")
@UseGuards(RolesGuard)
export class IncidenciasController {
  constructor(
    private readonly incidenciasService: IncidenciasService,
  ) {}

  @Post()
  @Roles(
    "superadministrador",
    "administrador",
    "coordinador",
    "profesor",
    "estudiante",
    "aspirante",
    "soporte",
  )
  crear(
    @Req() solicitud: SolicitudAutenticada,
    @Body()
    body: {
      titulo: string;
      descripcion: string;
      categoria?: string;
      prioridad?: "baja" | "media" | "alta" | "urgente";
    },
  ) {
    const titulo = body.titulo?.trim();
    const descripcion = body.descripcion?.trim();

    if (!titulo || !descripcion) {
      throw new BadRequestException(
        "El título y la descripción son obligatorios.",
      );
    }

    return this.incidenciasService.crear(solicitud.user!.id, {
      titulo,
      descripcion,
      categoria: body.categoria,
      prioridad: body.prioridad,
    });
  }

  @Get()
  @Roles(
    "superadministrador",
    "administrador",
    "coordinador",
    "profesor",
    "estudiante",
    "aspirante",
    "soporte",
  )
  listar(@Req() solicitud: SolicitudAutenticada) {
    return this.incidenciasService.listar(
      solicitud.user!.id,
      solicitud.user!.role,
    );
  }

  @Patch(":id/estado")
  @Roles("soporte", "superadministrador")
  actualizarEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      estado: "abierta" | "en_proceso" | "resuelta" | "cerrada";
    },
    @Req() solicitud: SolicitudAutenticada,
  ) {
    const estadosPermitidos = [
      "abierta",
      "en_proceso",
      "resuelta",
      "cerrada",
    ];

    if (!estadosPermitidos.includes(body.estado)) {
      throw new BadRequestException("El estado indicado no es válido.");
    }

    return this.incidenciasService.actualizarEstado(
      id,
      body.estado,
      solicitud.user!.role,
    );
  }
}
