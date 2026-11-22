
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SupabaseService } from "../supabase/supabase.service.js";
import { AutenticacionService } from "../autenticacion/autenticacion.service.js";

type SolicitudAutenticada = Request & {
  user?: {
    id: string;
    role: string;
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly autenticacionService: AutenticacionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    if (
      perfil.role !== "superadministrador" &&
      perfil.role !== "administrador"
    ) {
      throw new ForbiddenException(
        "No tienes permisos para realizar esta operación.",
      );
    }

    request.user = {
      id: usuarioId,
      role: perfil.role,
    };

    return true;
  }
}
