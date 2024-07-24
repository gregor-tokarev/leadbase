import { defineConfig } from "drizzle-kit";
import * as path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*",
  dbCredentials: {
    url: process.env.PG_URL ?? "",
  },
});
