
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  randomInt,
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { CorreoService } from "../correo/correo.service.js";

type AutenticacionPendiente = {
  usuarioId: string;
  correo: string;
  codigoHash: string;
  expira: number;
  intentos: number;
  accessToken: string;
  refreshToken: string;
};

type TokenMfa = {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
};

@Injectable()
export class AutenticacionService {
  private clienteSupabase: SupabaseClient;
  private pendientes = new Map<string, AutenticacionPendiente>();
  private secretoMfa: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly correoService: CorreoService,
  ) {
    const url = this.configService.get<string>("SUPABASE_URL");
    const clave = this.configService.get<string>("SUPABASE_PUBLISHABLE_KEY");
    const secreto = this.configService.get<string>("MFA_JWT_SECRET");

    if (!url || !clave) {
      throw new Error("Falta la configuración pública de Supabase.");
    }

    if (!secreto || secreto.length < 32) {
      throw new Error("MFA_JWT_SECRET debe tener al menos 32 caracteres.");
    }

    this.secretoMfa = secreto;

    this.clienteSupabase = createClient(url, clave, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async iniciar(correo: string, contrasena: string) {
    const { data, error } =
      await this.clienteSupabase.auth.signInWithPassword({
        email: correo.trim().toLowerCase(),
        password: contrasena,
      });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException(
        "Correo o contraseña incorrectos.",
      );
    }

    const codigo = randomInt(100000, 1000000).toString();
    const idVerificacion = randomUUID();

    const codigoHash = createHash("sha256")
      .update(codigo)
      .digest("hex");

    this.pendientes.set(idVerificacion, {
      usuarioId: data.user.id,
      correo: data.user.email ?? correo,
      codigoHash,
      expira: Date.now() + 5 * 60 * 1000,
      intentos: 0,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    try {
      await this.correoService.enviarCodigo(
        data.user.email ?? correo,
        codigo,
      );
    } catch {
      this.pendientes.delete(idVerificacion);
      throw new BadRequestException(
        "No se pudo enviar el código. Inténtalo nuevamente.",
      );
    }

    return {
      mensaje: "Código enviado al correo registrado.",
      idVerificacion,
    };
  }

  async verificar(idVerificacion: string, codigo: string) {
    const pendiente = this.pendientes.get(idVerificacion);

    if (!pendiente) {
      throw new UnauthorizedException(
        "La verificación no existe o ya fue utilizada.",
      );
    }

    if (Date.now() > pendiente.expira) {
      this.pendientes.delete(idVerificacion);
      throw new UnauthorizedException("El código ha caducado.");
    }

    pendiente.intentos++;

    if (pendiente.intentos > 5) {
      this.pendientes.delete(idVerificacion);
      throw new UnauthorizedException(
        "Se superó el límite de intentos.",
      );
    }

    const codigoHash = createHash("sha256")
      .update(codigo)
      .digest("hex");

    const hashEsperado = Buffer.from(pendiente.codigoHash, "hex");
    const hashRecibido = Buffer.from(codigoHash, "hex");

    if (!timingSafeEqual(hashEsperado, hashRecibido)) {
      throw new UnauthorizedException("El código es incorrecto.");
    }

    this.pendientes.delete(idVerificacion);

    const mfaToken = this.generarTokenMfa(pendiente.usuarioId);

    return {
      access_token: pendiente.accessToken,
      refresh_token: pendiente.refreshToken,
      mfa_token: mfaToken,
    };
  }

  private generarTokenMfa(usuarioId: string): string {
    const ahora = Math.floor(Date.now() / 1000);

    const payload: TokenMfa = {
      sub: usuarioId,
      iat: ahora,
      exp: ahora + 8 * 60 * 60,
      jti: randomUUID(),
    };

    const contenido = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );

    const firma = createHmac("sha256", this.secretoMfa)
      .update(contenido)
      .digest("base64url");

    return `${contenido}.${firma}`;
  }

  async validarSegundoFactor(
    accessToken: string,
    mfaToken: string,
  ): Promise<string> {
    if (!accessToken || !mfaToken) {
      throw new UnauthorizedException(
        "Se requiere completar la verificación de correo.",
      );
    }

    const partes = mfaToken.split(".");

    if (partes.length !== 2) {
      throw new UnauthorizedException("El token de verificación no es válido.");
    }

    const [contenido, firmaRecibida] = partes;

    const firmaEsperada = createHmac("sha256", this.secretoMfa)
      .update(contenido)
      .digest();

    let firmaUsuario: Buffer;

    try {
      firmaUsuario = Buffer.from(firmaRecibida, "base64url");
    } catch {
      throw new UnauthorizedException("El token de verificación no es válido.");
    }

    if (
      firmaUsuario.length !== firmaEsperada.length ||
      !timingSafeEqual(firmaEsperada, firmaUsuario)
    ) {
      throw new UnauthorizedException("El token de verificación no es válido.");
    }

    let payload: TokenMfa;

    try {
      payload = JSON.parse(
        Buffer.from(contenido, "base64url").toString("utf8"),
      ) as TokenMfa;
    } catch {
      throw new UnauthorizedException("El token de verificación no es válido.");
    }

    const ahora = Math.floor(Date.now() / 1000);

    if (
      !payload.sub ||
      !payload.exp ||
      payload.exp <= ahora ||
      !payload.jti
    ) {
      throw new UnauthorizedException(
        "La verificación ha caducado. Inicia sesión nuevamente.",
      );
    }

    const { data, error } =
      await this.clienteSupabase.auth.getUser(accessToken);

    if (error || !data.user || data.user.id !== payload.sub) {
      throw new UnauthorizedException(
        "La sesión no corresponde al usuario verificado.",
      );
    }

    return data.user.id;
  }
}
