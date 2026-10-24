import { forest, dungeon, cave, mountain, temple } from "../configs/biomes";
import { TilesetLoader } from "../loaders/Tileset";
import { BiomeConfig, BiomeName, LevelBiome } from "../types/generation";
import { EntityName } from "../types/entities";
import { MapBuilder } from "./builders/Map";

const loader = new TilesetLoader();

const CULTISTS = [
  EntityName.APPRENTICE,
  EntityName.BLOODGEIST1,
  EntityName.HEXGEIST,
];

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
  cult = 0,
) {
  const active = slots.filter((s) => (s.requires ?? 0) <= unlocked);
  if (!active.length) return;

  const host = Math.max(
    0,
    active.findIndex((s) => s.spawn),
  );

  const configs = active.map(({ biome, origin }, i) => {
    const base = biomes[biome];
    const config = {
      ...base,
      origin,
      objects:
        cult > 0 && base.cult
          ? [
              ...base.objects,
              {
                entities: CULTISTS,
                terrain: base.cult,
                count: { min: cult, max: cult },
                spacing: 12,
              },
            ]
          : base.objects,
    };
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
