import { defineConfig } from "drizzle-kit";
import { getEnv } from "@relevance/shared/lib/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getEnv("DATABASE_URL"),
  },
});
