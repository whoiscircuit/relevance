import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

@Injectable()
export class DrizzleService implements OnModuleInit {
  private db;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const pool = new Pool({
      connectionString: this.configService.get<string>("DATABASE_URL"),
    });

    this.db = drizzle(pool, { schema });
  }

  getDb() {
    return this.db;
  }
}
