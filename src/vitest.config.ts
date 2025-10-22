// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Only measure your app code:
      include: ["src/**/*.ts"],
      extension: [".ts"],
      // Exclude external/generated stuff that causes sourcemap lookups:
      exclude: [
        "**/node_modules/**",
        "**/prisma/**",
        "src/generated/**", // just in case
        "src/**/__tests__/**",
        "src/**/test/**",
      ],
    },
  },
});
