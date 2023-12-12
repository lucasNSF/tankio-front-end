import { configDotenv } from "dotenv";
import { defineConfig } from "vite";

configDotenv();

export default defineConfig({
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
  },
});
