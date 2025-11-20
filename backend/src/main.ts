import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Relevance Backend")
    .setDescription("API documentation for the Relevance backend")
    .setVersion("1.0")
    .addTag("relevance")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  app.use("/docs/json", (req, res) => {
    res.json(document);
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
