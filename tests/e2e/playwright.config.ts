import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  use: { baseURL: process.env.BASE_URL || "http://localhost:3000" },
  webServer: { command: "make dev", reuseExistingServer: true },
});
