import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from "./database/drizzle.module";
import { AppBuilderModule } from "./features/appBuilder/app-builder.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    AppBuilderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
