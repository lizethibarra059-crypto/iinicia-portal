
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { RolesController } from "./roles.controller.js";

@Module({
  imports: [],
  controllers: [AppController, RolesController],
  providers: [AppService],
})
export class AppModule {}
