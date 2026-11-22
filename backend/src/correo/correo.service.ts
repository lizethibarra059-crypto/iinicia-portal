
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class CorreoService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    const usuario = this.configService.get<string>("SMTP_USER");
    const contrasena = this.configService.get<string>("SMTP_PASS");

    if (!usuario || !contrasena) {
      throw new Error("Faltan las credenciales SMTP en el archivo .env");
    }

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: Number(this.configService.get<string>("SMTP_PORT") ?? 465),
      secure: true,
      auth: {
        user: usuario,
        pass: contrasena,
      },
    });
  }

  async enviarCodigo(destinatario: string, codigo: string) {
    try {
      await this.transporter.sendMail({
        from: `"IINICIA" <${this.configService.get<string>("SMTP_USER")}>`,
        to: destinatario,
        subject: "Código de verificación - IINICIA",
        text: `Tu código de verificación es: ${codigo}. Este código es temporal y no debes compartirlo.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; color: #172033;">
            <h2 style="color: #0864F5;">Verificación de seguridad</h2>
            <p>Hola, estás intentando iniciar sesión en el portal académico IINICIA.</p>
            <p>Tu código de verificación es:</p>
            <div style="background: #E3F5FC; padding: 20px; text-align: center; border-radius: 12px;">
              <strong style="font-size: 32px; letter-spacing: 8px; color: #0864F5;">${codigo}</strong>
            </div>
            <p>Este código es temporal. No lo compartas con nadie.</p>
            <p style="color: #64748b;">Instituto de Innovación y Ciencias Aplicadas</p>
          </div>
        `,
      });

      return { enviado: true };
    } catch {
      throw new InternalServerErrorException(
        "No fue posible enviar el correo de verificación.",
      );
    }
  }
}
