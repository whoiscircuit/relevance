import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DrizzleService } from "./drizzle.service";

export const DRIZZLE = Symbol("DRIZZLE");

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DrizzleService,
    {
      provide: DRIZZLE,
      useFactory: (drizzleService: DrizzleService) => drizzleService.getDb(),
      inject: [DrizzleService],
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
