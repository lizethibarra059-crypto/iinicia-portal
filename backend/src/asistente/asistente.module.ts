
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AsistenteService } from "./asistente.service.js";
import { AsistenteController } from "./asistente.controller.js";
import { AsistentePublicoController } from "./asistente-publico.controller.js";

import { SupabaseService } from "../supabase/supabase.service.js";
import { AutenticacionService } from "../autenticacion/autenticacion.service.js";
import { CorreoService } from "../correo/correo.service.js";
import { RolesGuard } from "../auth/roles.guard.js";

@Module({
  imports: [ConfigModule],
  controllers: [
    AsistenteController,
    AsistentePublicoController,
  ],
  providers: [
    AsistenteService,
    SupabaseService,
    AutenticacionService,
    CorreoService,
    RolesGuard,
  ],
})
export class AsistenteModule {}
