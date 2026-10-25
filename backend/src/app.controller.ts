
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "Hello World!";
  }

  @Get("api/estado")
  getEstado() {
    return {
      mensaje: "La API de IINICIA funciona correctamente",
      estado: "activo",
    };
  }
}
