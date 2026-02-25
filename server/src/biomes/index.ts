import { forest } from "../configs/biomes";
import { TilesetLoader } from "../loaders/Tileset";
import { BiomeConfig } from "../types/generation";
import { MapBuilder } from "./builders/Map";

const loader = new TilesetLoader();

const biomes: Record<string, BiomeConfig> = {
  forest,
};

export function generateBiome(id: string, seed?: string) {
  const config = biomes[id];
  if (!config) return;

  const seededConfig = seed
    ? { ...config, noise: { ...config.noise, seed } }
    : config;

  const builder = new MapBuilder(seededConfig, loader);
  return builder.build();
}
