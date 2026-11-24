
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
      const texto = await response.text();

      let data: any;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `Moodle respondió con contenido no válido: ${texto.slice(0, 500)}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${texto.slice(0, 500)}`,
        );
      }

      if (data?.exception) {
        throw new Error(
          [
            data.message,
            data.errorcode ? `Código: ${data.errorcode}` : "",
            data.debuginfo ? `Detalle: ${data.debuginfo}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        );
      }

      return data;
    } catch (error) {
      const detalle =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[MoodleService] Error en ${functionName}:`,
        detalle,
      );

      throw new InternalServerErrorException(
        `Error al consultar Moodle (${functionName}): ${detalle}`,
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

  async getEnrolledUsers(courseId: number) {
    return this.callMoodle("core_enrol_get_enrolled_users", {
      courseid: String(courseId),
    });
  }

  // Obtiene todas las actividades y recursos de un curso.
  async getAssignments(courseId: number) {
    const secciones = await this.getCourseContents(courseId);

    if (!Array.isArray(secciones)) {
      return [];
    }

    const actividades = secciones.flatMap((seccion: any) => {
      if (!Array.isArray(seccion.modules)) {
        return [];
      }

      return seccion.modules.map((modulo: any) => ({
        ...modulo,
        id: modulo.id,
        name: modulo.name || "Sin nombre",
        modname: modulo.modname || "desconocido",
        description: modulo.description || "",
        url: modulo.url || "",
        visible: modulo.visible,
        section: seccion.name || "General",
        sectionId: seccion.id,
        sectionNumber: seccion.section,
        sectionSummary: seccion.summary || "",
      }));
    });

    return actividades;
  }
}
