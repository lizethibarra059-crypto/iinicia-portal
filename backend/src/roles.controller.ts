
import { Controller, Get } from "@nestjs/common";

@Controller("api/roles")
export class RolesController {
  @Get()
  obtenerRoles() {
    return [
      { id: "superadministrador", nombre: "Superadministrador" },
      { id: "administrador", nombre: "Administrador" },
      { id: "coordinador", nombre: "Coordinador" },
      { id: "profesor", nombre: "Profesor" },
      { id: "estudiante", nombre: "Estudiante" },
      { id: "aspirante", nombre: "Aspirante" },
      { id: "soporte", nombre: "Soporte" },
    ];
  }
}
