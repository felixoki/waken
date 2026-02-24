import { writeFileSync } from "fs";
import { generateBiome } from "./biomes";
import { BiomeName } from "./types/generation";

const result = generateBiome(BiomeName.FOREST, "test-seed-123");

writeFileSync(
  "../client/public/assets/maps/test_realm.json",
  JSON.stringify(result?.tilemap, null, 2),
);

console.log("Generated realm map at client/public/assets/maps/test_realm.json");
console.log("Spawn:", result?.spawn);
console.log("Layers:", result?.tilemap?.layers.length);
console.log(
  "Tilesets:",
  result?.tilemap?.tilesets.map((t: any) => t.name),
);
console.log("Entities:", result?.entities.length);

// Count by type
const counts: Record<string, number> = {};
for (const e of result?.entities ?? []) {
  counts[e.name] = (counts[e.name] ?? 0) + 1;
}
console.log("Entity breakdown:", counts);