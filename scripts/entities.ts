import { animals } from "../server/src/configs/entities/animals";
import { buildings } from "../server/src/configs/entities/buildings";
import { cloths } from "../server/src/configs/entities/cloths";
import { creatures } from "../server/src/configs/entities/creatures";
import { crops } from "../server/src/configs/entities/crops";
import { equipment } from "../server/src/configs/entities/equipment";
import { fish } from "../server/src/configs/entities/fish";
import { flora } from "../server/src/configs/entities/flora";
import { food } from "../server/src/configs/entities/food";
import { ingredients } from "../server/src/configs/entities/ingredients";
import { interior } from "../server/src/configs/entities/interior";
import { people } from "../server/src/configs/entities/people";
import { resources } from "../server/src/configs/entities/resources";
import { rocks } from "../server/src/configs/entities/rocks";
import { spawners } from "../server/src/configs/entities/spawners";
import { spellPages } from "../server/src/configs/entities/spellpages";
import { transitions } from "../server/src/configs/entities/transitions";
import { trophies } from "../server/src/configs/entities/trophies";
import { villain } from "../server/src/configs/entities/villain";
import { zones } from "../server/src/configs/entities/zones";
import { configs } from "../server/src/configs";

type Component = {
  name: string;
  config?: Record<string, unknown>;
  key?: string;
};
type Definition = {
  components?: Component[];
  flat?: boolean;
  metadata?: { icon?: { spritesheet: string; row: number; col: number } };
};

const sheets: Record<string, string> = {};
for (const map of Object.values(configs.maps))
  for (const sheet of map.spritesheets ?? []) sheets[sheet.key] = sheet.file;

const modules: Record<string, Partial<Record<string, Definition>>> = {
  animals: animals,
  buildings: buildings,
  cloths: cloths,
  creatures: creatures,
  crops: crops,
  equipment: equipment,
  fish: fish,
  flora: flora,
  food: food,
  ingredients: ingredients,
  interior: interior,
  people: people,
  resources: resources,
  rocks: rocks,
  spawners: spawners,
  spellpages: spellPages,
  transitions: transitions,
  trophies: trophies,
  villain: villain,
  zones: zones,
};

const out: Record<string, unknown> = {};

for (const [file, group] of Object.entries(modules)) {
  for (const [name, def] of Object.entries(group)) {
    if (!def) continue;
    const components = def.components ?? [];
    const texture = components.find((c) => c.name === "texture");
    const body = components.find((c) => c.name === "body");

    out[name] = {
      file,
      states: (def as { states?: string[] }).states ?? [],
      behaviors: ((def as { behaviors?: unknown[] }).behaviors ?? []).length,
      components: components.map((c) => c.name),
      animation: components.find((c) => c.name === "textureAnimation")?.config,
      key: texture?.key,
      texture: texture?.config,
      sheet: texture?.config?.spritesheet
        ? (sheets[texture.config.spritesheet as string] ??
          `${texture.config.spritesheet as string}.png`)
        : undefined,
      body: body?.config,
      growable: components.find((c) => c.name === "growable")?.config,
      connectable: components.find((c) => c.name === "connectable")?.config,
      flat: def.flat,
      icon: def.metadata?.icon,
    };
  }
}

const refs: { sheet: string; row?: number; col?: number }[] = [];
const seen = new Set<unknown>();
const walk = (value: unknown): void => {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const v = value as Record<string, unknown>;
  if (typeof v.spritesheet === "string")
    refs.push({
      sheet: v.spritesheet,
      row: typeof v.row === "number" ? v.row : undefined,
      col: typeof v.col === "number" ? v.col : undefined,
    });
  for (const child of Object.values(v)) walk(child);
};
walk(configs);

const maps: Record<string, unknown> = {};
for (const [name, map] of Object.entries(configs.maps))
  maps[name] = {
    json: map.json,
    sheets: (map.spritesheets ?? []).map((s) => ({
      key: s.key,
      file: s.file,
      frameWidth: s.frameWidth,
      frameHeight: s.frameHeight,
    })),
  };

const strings = new Set<string>();
const visited = new Set<unknown>();
const collect = (value: unknown): void => {
  if (typeof value === "string") strings.add(value);
  if (!value || typeof value !== "object" || visited.has(value)) return;
  visited.add(value);
  for (const child of Object.values(value)) collect(child);
};
collect((configs as unknown as Record<string, unknown>).biomes);
collect((configs as unknown as Record<string, unknown>).setpieces);

process.stdout.write(
  JSON.stringify({ entities: out, refs, maps, biome: [...strings] }),
  () => process.exit(0),
);
