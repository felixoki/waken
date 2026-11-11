import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import path from "path";
import { rmSync } from "fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const excludeCollection = (): Plugin => {
  let outDir = "";
  return {
    name: "exclude-collection",
    apply: "build",
    configResolved(config: ResolvedConfig) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      rmSync(path.join(outDir, "assets/sprites/collection"), {
        recursive: true,
        force: true,
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), excludeCollection()],
  base: "./",
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "../server/src"),
    },
  },
});
