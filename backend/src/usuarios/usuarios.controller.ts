
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AdminGuard } from "../auth/admin.guard.js";
import { UsuariosService } from "./usuarios.service.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";

type SolicitudAutenticada = Request & {
  user?: {
    id: string;
    role: string;
  };
};

const ROLES = [
  "superadministrador",
  "administrador",
  "coordinador",
  "profesor",
  "estudiante",
  "aspirante",
  "soporte",
] as const;

type Rol = (typeof ROLES)[number];

type CrearUsuarioBody = {
  nombre: string;
  correo: string;
  rol: string;
};

type EditarUsuarioBody = {
  nombre: string;
  rol: string;
};

@Controller("api/usuarios")
@UseGuards(AdminGuard, RolesGuard)
@Roles("superadministrador", "administrador")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listar(
    @Req() solicitud: SolicitudAutenticada,
    @Query("busqueda") busqueda?: string,
    @Query("rol") rol?: string,
  ) {
    if (rol && !ROLES.includes(rol as Rol)) {
      throw new BadRequestException("El filtro de rol no es válido.");
    }

    return this.usuariosService.listarUsuarios({
      busqueda: busqueda?.trim(),
      rol,
      rolSolicitante: solicitud.user?.role ?? "",
    });
  }

  @Post()
  async crear(
    @Req() solicitud: SolicitudAutenticada,
    @Body() body: CrearUsuarioBody,
  ) {
    const nombre = body.nombre?.trim();
    const correo = body.correo?.trim().toLowerCase();
    const rol = body.rol?.trim();

    if (!nombre || !correo || !rol) {
      throw new BadRequestException(
        "El nombre, correo y rol son obligatorios.",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new BadRequestException("El correo no es válido.");
    }

    if (!ROLES.includes(rol as Rol)) {
      throw new BadRequestException("El rol seleccionado no es válido.");
    }

    if (
      solicitud.user?.role === "administrador" &&
      !["profesor", "estudiante", "aspirante", "soporte"].includes(rol)
    ) {
      throw new ForbiddenException(
        "El administrador no tiene permiso para asignar este rol.",
      );
    }

    return this.usuariosService.crearUsuario(
      nombre,
      correo,
      rol as Rol,
    );
  }

  @Patch(":id")
  async editar(
    @Param("id") id: string,
    @Body() body: EditarUsuarioBody,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    const nombre = body.nombre?.trim();
    const rol = body.rol?.trim();

    if (!id || !nombre || !rol) {
      throw new BadRequestException(
        "El identificador, nombre y rol son obligatorios.",
      );
    }

    if (!ROLES.includes(rol as Rol)) {
      throw new BadRequestException("El rol seleccionado no es válido.");
    }

    return this.usuariosService.editarUsuario(
      id,
      nombre,
      rol as Rol,
      solicitud.user?.role ?? "",
      solicitud.user?.id ?? "",
    );
  }
}
