import { generateBiome } from "../biomes";
import { tryCatchSync } from "../utils/tryCatch";

process.on("message", ({ biome, seed, unlocked }) => {
  const { data, error } = tryCatchSync(() => generateBiome(biome, seed, unlocked));

  if (error) {
    console.error("Worker generation failed:", error);
    process.exit(1);
  }

  process.send?.(data ?? null, undefined, undefined, (err) => {
    if (err) {
      console.error("Worker send failed:", err);
      process.exit(1);
    }

    process.exit(0);
  });
});
