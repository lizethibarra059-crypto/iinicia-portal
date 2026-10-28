
import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MoodleService {
  constructor(private readonly configService: ConfigService) {}

  private getMoodleConfig() {
    const moodleUrl = this.configService
      .get<string>("MOODLE_URL")
      ?.replace(/\/+$/, "");

    const token = this.configService.get<string>("MOODLE_TOKEN");

    if (!moodleUrl || !token) {
      throw new InternalServerErrorException(
        "Falta configurar MOODLE_URL o MOODLE_TOKEN.",
      );
    }

    return { moodleUrl, token };
  }

  private async callMoodle(
    functionName: string,
    extraParams: Record<string, string> = {},
  ) {
    const { moodleUrl, token } = this.getMoodleConfig();
    const url = new URL(`${moodleUrl}/webservice/rest/server.php`);

    url.searchParams.set("wstoken", token);
    url.searchParams.set("wsfunction", functionName);
    url.searchParams.set("moodlewsrestformat", "json");

    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.exception) {
        throw new Error(data.message ?? "Error devuelto por Moodle");
      }

      return data;
    } catch {
      throw new InternalServerErrorException(
        "No fue posible consultar la información de Moodle.",
      );
    }
  }

  async getSiteInfo() {
    return this.callMoodle("core_webservice_get_site_info");
  }

  async getCourses() {
    return this.callMoodle("core_course_get_courses");
  }

  async getCourseContents(courseId: number) {
    return this.callMoodle("core_course_get_contents", {
      courseid: String(courseId),
    });
  }
}
