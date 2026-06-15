import { handlers } from "../../handlers";
import { BiomeConfig, Entity, TerrainName } from "../../types/generation";
import { NoiseGenerator } from "./Noise";

export class TerrainGenerator {
  private noise: NoiseGenerator;
  private config: BiomeConfig;

  constructor(config: BiomeConfig, _seed: string) {
    this.config = config;
    this.noise = new NoiseGenerator(config.noise);
  }

  generate(): { terrain: TerrainName[]; entities: Entity[]; spawn?: { x: number; y: number } } {
    const { width, height, layers } = this.config;
    const noiseMap = this.noise.generateMap(width, height);
    const terrain: TerrainName[] = new Array(width * height);
    const entities: Entity[] = [];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const noise = noiseMap[y][x];
        let t = layers[layers.length - 1].terrain;

        for (let i = 0; i < layers.length - 1; i++)
          if (noise < layers[i].threshold!) {
            t = layers[i].terrain;
            break;
          }

        terrain[handlers.generation.toIndex(x, y, width)] = t;
      }

    return { terrain, entities };
  }
}
