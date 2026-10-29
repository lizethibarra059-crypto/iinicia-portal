
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AdminGuard } from "../auth/admin.guard.js";
import { UsuariosService } from "./usuarios.service.js";

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

@Controller("api/usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseGuards(AdminGuard)
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
}
