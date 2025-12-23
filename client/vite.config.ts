import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "../server/src"),
    },
  },
});
