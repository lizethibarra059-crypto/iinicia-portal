
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { AutenticacionService } from "./autenticacion.service.js";

@Controller("api/autenticacion")
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
  ) {}

  @Post("iniciar")
  async iniciar(
    @Body() body: { correo: string; contrasena: string },
  ) {
    const correo = body.correo?.trim().toLowerCase();
    const contrasena = body.contrasena;

    if (!correo || !contrasena) {
      throw new BadRequestException(
        "El correo y la contraseña son obligatorios.",
      );
    }

    return this.autenticacionService.iniciar(correo, contrasena);
  }

  @Post("verificar")
  async verificar(
    @Body() body: {
      idVerificacion: string;
      codigo: string;
    },
  ) {
    const idVerificacion = body.idVerificacion?.trim();
    const codigo = body.codigo?.trim();

    if (
      !idVerificacion ||
      !codigo ||
      !/^\d{6}$/.test(codigo)
    ) {
      throw new BadRequestException(
        "Debes proporcionar un identificador y un código de seis dígitos.",
      );
    }

    return this.autenticacionService.verificar(
      idVerificacion,
      codigo,
    );
  }

  @Get("validar")
  async validar(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-mfa-token") mfaToken: string | undefined,
  ) {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Se requiere una sesión válida.",
      );
    }

    const accessToken = authorization.slice(7);

    await this.autenticacionService.validarSegundoFactor(
      accessToken,
      mfaToken ?? "",
    );

    return { valid: true };
  }
}
