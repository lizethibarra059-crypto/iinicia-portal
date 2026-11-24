
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL;

  const allowedOrigins = [
    "http://localhost:3000",
    frontendUrl,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-MFA-Token",
    ],
  });

  const port = Number(process.env.PORT) || 3001;

  await app.listen(port, "0.0.0.0");

  console.log(`IINICIA Backend ejecutándose en el puerto ${port}`);
}

bootstrap();
