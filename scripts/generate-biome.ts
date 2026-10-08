import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateBiome } from "../server/src/biomes/index";
import { configs } from "../server/src/configs";
import { ComponentName } from "../server/src/types";
import { BiomeName, Entity } from "../server/src/types/generation";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SPRITES = resolve(ROOT, "client/public/assets/sprites");

const args = process.argv.slice(2);
const force = args.includes("--force");
const [biome, seed = biome] = args.filter((arg) => !arg.startsWith("--"));
const name =
  args.find((arg) => arg.startsWith("--out="))?.slice("--out=".length) ?? biome;
const out = resolve(ROOT, `tiled/${name}.tmx`);

if (!Object.values(BiomeName).includes(biome as BiomeName)) {
  console.error(
    `usage: generate:biome <${Object.values(BiomeName).join("|")}> [seed] [--out=name] [--force]`,
  );
  process.exit(1);
}

if (existsSync(out) && !force) {
  console.error(`✗ tiled/${name}.tmx exists, pass --force to overwrite it`);
  process.exit(1);
}

const generated = generateBiome([{ biome: biome as BiomeName, spawn: true }], seed);

if (!generated) {
  console.error(`✗ ${biome}: nothing generated`);
  process.exit(1);
}

const { tilemap, entities } = generated;
const { width, height, tilewidth, tileheight } = tilemap;

const esc = (value: unknown) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const title = (name: string) =>
  name
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("_");

const properties = (list: any[] | undefined, indent: string) => {
  if (!list?.length) return "";

  const rows = list.map((p) => {
    const type = p.type && p.type !== "string" ? ` type="${p.type}"` : "";
    return `${indent} <property name="${esc(p.name)}"${type} value="${esc(p.value)}"/>`;
  });

  return `${indent}<properties>\n${rows.join("\n")}\n${indent}</properties>\n`;
};

const csv = (data: number[]) => {
  const rows: string[] = [];
  for (let y = 0; y < height; y++)
    rows.push(data.slice(y * width, (y + 1) * width).join(","));

  return rows.join(",\n");
};

const tileset = (ts: any) => {
  const tiles = new Map<number, any>();

  for (const tile of ts.tiles ?? []) {
    const merged = tiles.get(tile.id) ?? { id: tile.id, properties: [] };

    for (const p of tile.properties ?? [])
      if (!merged.properties.some((m: any) => m.name === p.name))
        merged.properties.push(p);

    merged.objectgroup ??= tile.objectgroup;
    merged.animation ??= tile.animation;
    tiles.set(tile.id, merged);
  }

  const body = [...tiles.values()].map((tile) => {
    let xml = `  <tile id="${tile.id}">\n${properties(tile.properties, "   ")}`;

    if (tile.objectgroup?.objects?.length) {
      xml += `   <objectgroup draworder="index" id="2">\n`;

      for (const o of tile.objectgroup.objects) {
        const head = `    <object id="${o.id}" x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}"`;
        const props = properties(o.properties, "     ");
        xml += props ? `${head}>\n${props}    </object>\n` : `${head}/>\n`;
      }

      xml += `   </objectgroup>\n`;
    }

    if (tile.animation?.length) {
      const frames = tile.animation.map(
        (f: any) => `    <frame tileid="${f.tileid}" duration="${f.duration}"/>`,
      );
      xml += `   <animation>\n${frames.join("\n")}\n   </animation>\n`;
    }

    return `${xml}  </tile>\n`;
  });

  return (
    ` <tileset firstgid="${ts.firstgid}" name="${ts.name}" tilewidth="${ts.tilewidth}" tileheight="${ts.tileheight}" tilecount="${ts.tilecount}" columns="${ts.columns}">\n` +
    `  <image source="../client/public/assets/sprites/${basename(ts.image)}" width="${ts.imagewidth}" height="${ts.imageheight}"/>\n` +
    body.join("") +
    ` </tileset>\n`
  );
};

const tilesets: any[] = [...tilemap.tilesets];
let nextGid = Math.max(...tilesets.map((ts) => ts.firstgid + ts.tilecount));

const sheet = (name: string) => {
  const existing = tilesets.find((ts) => ts.name === name);
  if (existing) return existing;

  const png = readFileSync(resolve(SPRITES, `${name}.png`));
  const imagewidth = png.readUInt32BE(16);
  const imageheight = png.readUInt32BE(20);
  const columns = Math.floor(imagewidth / tilewidth);
  const tilecount = columns * Math.floor(imageheight / tileheight);

  const added = {
    firstgid: nextGid,
    name,
    tilewidth,
    tileheight,
    tilecount,
    columns,
    image: `${name}.png`,
    imagewidth,
    imageheight,
  };

  nextGid += tilecount;
  tilesets.push(added);

  return added;
};

const stamps = new Array(width * height).fill(0);

const stamp = (entity: Entity) => {
  for (const component of configs.entities[entity.name]?.components ?? []) {
    if (
      component.name !== ComponentName.TEXTURE &&
      component.name !== ComponentName.TEXTURE_ANIMATION
    )
      continue;

    const { spritesheet, tiles, tileSize } = component.config;
    if (tileSize !== tilewidth) return;

    const ts = sheet(spritesheet);
    const columns = Math.max(...tiles.map((t) => t.end - t.start + 1));
    const left = Math.round((entity.x - (columns * tileSize) / 2) / tilewidth);
    const top = Math.round((entity.y - (tiles.length * tileSize) / 2) / tileheight);

    tiles.forEach((row, dy) => {
      for (let col = row.start; col <= row.end; col++) {
        const x = left + col - row.start;
        const y = top + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;

        stamps[y * width + x] = ts.firstgid + (row.row - 1) * ts.columns + col - 1;
      }
    });

    return;
  }
};

for (const entity of entities) stamp(entity);

let layerId = 1;
let xml = "";

for (const layer of tilemap.layers) {
  xml +=
    ` <layer id="${layerId++}" name="${layer.name}" width="${width}" height="${height}">\n` +
    properties(layer.properties, "  ") +
    `  <data encoding="csv">\n${csv(layer.data)}\n</data>\n </layer>\n`;
}

xml +=
  ` <layer id="${layerId++}" name="objects" width="${width}" height="${height}">\n` +
  `  <data encoding="csv">\n${csv(stamps)}\n</data>\n </layer>\n`;

xml += ` <objectgroup id="${layerId++}" name="objects">\n`;

entities.forEach((entity, i) => {
  const head = `  <object id="${i + 1}" name="${title(entity.name)}" x="${entity.x}" y="${entity.y}" width="1" height="1"`;
  const rolled = (entity.loot ?? [])
    .filter((item) => Math.random() <= item.chance)
    .map(({ name, quantity }) => ({ name, quantity }));

  const props = properties(
    [
      ...(entity.link
        ? [{ name: "link", type: "string", value: entity.link }]
        : []),
      ...(rolled.length
        ? [{ name: "contents", type: "string", value: JSON.stringify(rolled) }]
        : []),
    ],
    "   ",
  );

  xml += props ? `${head}>\n${props}  </object>\n` : `${head}/>\n`;
});

xml += ` </objectgroup>\n`;

writeFileSync(
  out,
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<map version="1.10" tiledversion="1.11.2" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="${tilewidth}" tileheight="${tileheight}" infinite="0" nextlayerid="${layerId}" nextobjectid="${entities.length + 1}">\n` +
    ` <editorsettings>\n  <export target="../client/public/assets/maps/${name}.json" format="json"/>\n </editorsettings>\n` +
    tilesets.map(tileset).join("") +
    xml +
    `</map>\n`,
);

console.log(`✓ tiled/${name}.tmx  ${width}x${height}  seed "${seed}"`);
for (const layer of tilemap.layers)
  console.log(`  ${layer.name.padEnd(14)} ${layer.data.filter((gid: number) => gid).length}`);
console.log(`  ${entities.length} entities`);

process.exit(0);
