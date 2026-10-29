import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { RolesController } from "./roles.controller.js";
import { SupabaseService } from "./supabase/supabase.service.js";
import { MoodleService } from "./moodle/moodle.service.js";
import { MoodleController } from "./moodle/moodle.controller.js";
import { AdminGuard } from "./auth/admin.guard.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), ".env"),
        join(process.cwd(), "backend", ".env"),
      ],
    }),
  ],
  controllers: [AppController, RolesController, MoodleController],
  providers: [AppService, SupabaseService, MoodleService, AdminGuard],
})
export class AppModule {}
