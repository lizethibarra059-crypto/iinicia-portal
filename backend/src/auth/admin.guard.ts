
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service.js";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
    }>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Se requiere iniciar sesión para realizar esta operación.",
      );
    }

    const token = authorization.slice(7);

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("La sesión no es válida.");
    }

    const { data: perfil, error: errorPerfil } = await this.supabaseService
      .getClient()
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
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

    return true;
  }
}
