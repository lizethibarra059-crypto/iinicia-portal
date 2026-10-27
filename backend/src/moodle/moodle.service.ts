import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class MoodleService {
  constructor(private readonly configService: ConfigService) {}

  async getSiteInfo() {
    const moodleUrl = this.configService
      .get<string>("MOODLE_URL")
      ?.replace(/\/+$/, "");

    const token = this.configService.get<string>("MOODLE_TOKEN");
    
    if (!moodleUrl || !token) {
      throw new InternalServerErrorException(
        "Falta configurar MOODLE_URL o MOODLE_TOKEN.",
      );
    }

    const url = new URL(`${moodleUrl}/webservice/rest/server.php`);

    url.searchParams.set("wstoken", token);
    url.searchParams.set("wsfunction", "core_webservice_get_site_info");
    url.searchParams.set("moodlewsrestformat", "json");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.exception) {
        console.error("Error de Moodle:", data);
        throw new Error(data.message ?? "Error devuelto por Moodle");
      }

      return data;
    } catch {
      throw new InternalServerErrorException(
        "No fue posible consultar la información de Moodle.",
      );
    }
  }
}
