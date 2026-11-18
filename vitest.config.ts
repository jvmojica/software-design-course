import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "~": new URL("./app", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
