import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["app/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "app/_client/**/*.ts",
        "app/_lib/**/*.ts",
        "app/_server/**/*.ts",
        "app/_types/**/*.ts",
      ],
      exclude: ["app/**/*.{test,spec}.{ts,tsx}", "app/**/firebase.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
