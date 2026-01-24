import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["app/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "app/_client/**/*.ts",
        "app/_lib/**/*.ts",
        "app/_server/**/*.ts",
        "app/_types/**/*.ts",
        "src/**/*.ts",
      ],
      exclude: [
        "app/**/*.{test,spec}.{ts,tsx}",
        "app/**/firebase.ts",
        "src/**/*.{test,spec}.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
