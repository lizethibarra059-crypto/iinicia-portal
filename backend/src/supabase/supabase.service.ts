import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseSecretKey = this.configService.get<string>(
      "SUPABASE_SECRET_KEY",
    );

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error(
        "Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en el archivo .env",
      );
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseSecretKey);
  }

  getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error("El cliente de Supabase no está inicializado");
    }

    return this.supabaseClient;
  }
}
