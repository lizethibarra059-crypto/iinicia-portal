
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { SupabaseService } from "../supabase/supabase.service.js";
import { AutenticacionService } from "../autenticacion/autenticacion.service.js";
import { ROLES_KEY } from "./roles.decorator.js";

type SolicitudAutenticada = Request & {
  user?: {
    id: string;
    role: string;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly autenticacionService: AutenticacionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request =
      context.switchToHttp().getRequest<SolicitudAutenticada>();

    const authorization = request.headers.authorization;
    const mfaToken = request.headers["x-mfa-token"];

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Se requiere iniciar sesión para realizar esta operación.",
      );
    }

    if (typeof mfaToken !== "string") {
      throw new UnauthorizedException(
        "Debes completar la verificación de correo.",
      );
    }

    const token = authorization.slice(7);

    const usuarioId =
      await this.autenticacionService.validarSegundoFactor(
        token,
        mfaToken,
      );

    const { data: perfil, error: errorPerfil } =
      await this.supabaseService
        .getClient()
        .from("profiles")
        .select("role")
        .eq("id", usuarioId)
        .single();

    if (errorPerfil || !perfil) {
      throw new ForbiddenException("No se encontró el perfil del usuario.");
    }

    request.user = {
      id: usuarioId,
      role: perfil.role,
    };

    if (
      rolesPermitidos &&
      rolesPermitidos.length > 0 &&
      !rolesPermitidos.includes(perfil.role)
    ) {
      throw new ForbiddenException(
        "Tu rol no tiene permiso para realizar esta operación.",
      );
    }

    return true;
  }
}
