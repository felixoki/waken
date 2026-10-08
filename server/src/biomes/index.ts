import { forest, dungeon, cave, mountain, temple } from "../configs/biomes";
import { TilesetLoader } from "../loaders/Tileset";
import { BiomeConfig, BiomeName, LevelBiome } from "../types/generation";
import { MapBuilder } from "./builders/Map";

const loader = new TilesetLoader();

const biomes: Record<BiomeName, BiomeConfig> = {
  [BiomeName.FOREST]: forest,
  [BiomeName.DUNGEON]: dungeon,
  [BiomeName.CAVE]: cave,
  [BiomeName.MOUNTAIN]: mountain,
  [BiomeName.TEMPLE]: temple,
};

export function generateBiome(
  slots: LevelBiome[],
  seed?: string,
  unlocked = 0,
) {
  const active = slots.filter((s) => (s.requires ?? 0) <= unlocked);
  if (!active.length) return;

  const host = Math.max(
    0,
    active.findIndex((s) => s.spawn),
  );

  const configs = active.map(({ biome }, i) => {
    const config = biomes[biome];
    if (!seed) return config;

    const noise = i === host ? seed : `${seed}-${biome}`;
    return { ...config, noise: { ...config.noise, seed: noise } };
  });

  const builder = new MapBuilder(
    configs,
    host,
    loader,
    seed ?? "default",
    unlocked,
  );
  return builder.build();
}
