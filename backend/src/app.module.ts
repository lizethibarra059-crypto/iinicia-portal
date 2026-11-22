
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { RolesController } from "./roles.controller.js";
import { SupabaseService } from "./supabase/supabase.service.js";
import { MoodleService } from "./moodle/moodle.service.js";
import { MoodleController } from "./moodle/moodle.controller.js";
import { UsuariosController } from "./usuarios/usuarios.controller.js";
import { UsuariosService } from "./usuarios/usuarios.service.js";
import { AdminGuard } from "./auth/admin.guard.js";
import { RolesGuard } from "./auth/roles.guard.js";
import { IncidenciasController } from "./incidencias/incidencias.controller.js";
import { IncidenciasService } from "./incidencias/incidencias.service.js";
import { CorreoService } from "./correo/correo.service.js";
import { AutenticacionController } from "./autenticacion/autenticacion.controller.js";
import { AutenticacionService } from "./autenticacion/autenticacion.service.js";
import { AsistenteModule } from "./asistente/asistente.module.js";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), ".env"),
        join(process.cwd(), "backend", ".env"),
      ],
    }),
    AsistenteModule,
  ],
  controllers: [
    AppController,
    RolesController,
    MoodleController,
    UsuariosController,
    IncidenciasController,
    AutenticacionController,
  ],
  providers: [
    AppService,
    SupabaseService,
    MoodleService,
    AdminGuard,
    RolesGuard,
    UsuariosService,
    IncidenciasService,
    CorreoService,
    AutenticacionService,
  ],
})
export class AppModule {}
