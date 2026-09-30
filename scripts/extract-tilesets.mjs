/**
 * Extracts the mountain tilesets embedded in tiled/*.tmx into tagged tileset
 * files under client/public/assets/tilesets, the format TilesetLoader reads.
 *
 * Image, dimensions and per-tile collision shapes come from the tmx. Semantic
 * tags come from TAGS below, written as 1-based (row, col) the way the Tiled
 * tileset view and .claude/skills/tiled/references/terrain.md count them. Face
 * positions keep the keys terraces.py uses, so its tiling logic ports 1:1.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCES = ["tiled/large-mountain.tmx", "tiled/mountain.tmx"].map((p) => resolve(ROOT, p));
const OUT = resolve(ROOT, "client/public/assets/tilesets");

const blob = (terrain, r, c) => [
  [[r, c], { role: "border_outer", position: "top_left", terrain }],
  [[r, c + 1], { role: "border_outer", position: "top", terrain }],
  [[r, c + 2], { role: "border_outer", position: "top_right", terrain }],
  [[r + 1, c], { role: "border_outer", position: "left", terrain }],
  [[r + 1, c + 2], { role: "border_outer", position: "right", terrain }],
  [[r + 2, c], { role: "border_outer", position: "bottom_left", terrain }],
  [[r + 2, c + 1], { role: "border_outer", position: "bottom", terrain }],
  [[r + 2, c + 2], { role: "border_outer", position: "bottom_right", terrain }],
  [[r, c + 3], { role: "border_inner", position: "top_left", terrain }],
  [[r, c + 4], { role: "border_inner", position: "top_right", terrain }],
  [[r + 1, c + 3], { role: "border_inner", position: "bottom_left", terrain }],
  [[r + 1, c + 4], { role: "border_inner", position: "bottom_right", terrain }],
];

const earthBase = (over, t) => [
  [t.flat, { role: "base", position: "flat", terrain: "earth", over }],
  [t.junctionLeft, { role: "base", position: "junction_left", terrain: "earth", over }],
  [t.junctionRight, { role: "base", position: "junction_right", terrain: "earth", over }],
  [t.capLeft, { role: "base", position: "cap_left", terrain: "earth", over }],
  [t.capRight, { role: "base", position: "cap_right", terrain: "earth", over }],
  [t.innerWest, { role: "base", position: "inner_west", terrain: "earth", over }],
  [t.innerEast, { role: "base", position: "inner_east", terrain: "earth", over }],
];

const snowFace = (over, r) => [
  [[r + 1, 4], { role: "face", position: "flat", terrain: "snow", over, height: 2 }],
  [[r, 16], { role: "face", position: "up_right", terrain: "snow", over, height: 3, anchor_y: 1 }],
  [[r, 17], { role: "face", position: "up_left", terrain: "snow", over, height: 3, anchor_y: 1 }],
  [[r + 1, 3], { role: "end", position: "west", terrain: "snow", over, height: 2 }],
  [[r + 1, 5], { role: "end", position: "east", terrain: "snow", over, height: 2 }],
  [[r + 1, 2], { role: "end_shadow", position: "west", terrain: "snow", over, height: 2 }],
  [[r + 1, 6], { role: "end_shadow", position: "east", terrain: "snow", over, height: 2 }],
];

const snowWall = (over, west, east) => [
  [west[0], { role: "wall", position: "west", terrain: "snow", over }],
  [west[1], { role: "wall_shadow", position: "west", terrain: "snow", over }],
  [east[0], { role: "wall", position: "east", terrain: "snow", over }],
  [east[1], { role: "wall_shadow", position: "east", terrain: "snow", over }],
];

const snowStair = (over, c) => [
  [[40, c], { role: "stair", position: "top_left", terrain: "snow", over }],
  [[40, c + 1], { role: "stair", position: "top_right", terrain: "snow", over }],
  [[41, c], { role: "stair", position: "left", terrain: "snow", over }],
  [[41, c + 1], { role: "stair", position: "right", terrain: "snow", over }],
];

const TAGS = {
  forest_ground_grass: [
    [[21, 3], { role: "fill", terrain: "earth" }],
    [[26, 3], { role: "fill", terrain: "grass" }],
    ...blob("grass", 25, 2),

    [[6, 5], { role: "rim", position: "flat", terrain: "earth" }],
    [[6, 2], { role: "rim", position: "left", terrain: "earth" }],
    [[6, 3], { role: "rim", position: "right", terrain: "earth" }],
    [[6, 4], { role: "rim", position: "cap_left", terrain: "earth" }],
    [[6, 6], { role: "rim", position: "cap_right", terrain: "earth" }],

    ...earthBase("grass", {
      flat: [7, 15], junctionLeft: [15, 12], junctionRight: [15, 13],
      capLeft: [7, 14], capRight: [7, 16], innerWest: [13, 12], innerEast: [13, 13],
    }),
    ...earthBase("earth", {
      flat: [10, 5], junctionLeft: [12, 5], junctionRight: [7, 8],
      capLeft: [10, 4], capRight: [10, 6], innerWest: [7, 2], innerEast: [7, 3],
    }),

    [[21, 2], { role: "crack", position: "west", terrain: "earth" }],
    [[21, 4], { role: "crack", position: "east", terrain: "earth" }],
  ],

  mountains_ground: [
    [[5, 4], { role: "fill", terrain: "snow" }],
    ...snowFace("earth", 5),
    ...snowFace("snow", 11),
    [[6, 8], { role: "corner", position: "west", terrain: "snow" }],
    [[6, 7], { role: "corner", position: "east", terrain: "snow" }],
    ...snowWall("earth", [[16, 10], [16, 9]], [[16, 11], [16, 12]]),
    ...snowWall("snow", [[10, 11], [10, 10]], [[10, 12], [10, 13]]),
    ...snowStair("earth", 14),
    ...snowStair("snow", 20),
  ],

  stairs_grass: [
    [[7, 6], { role: "stair", position: "top_left", terrain: "earth" }],
    [[7, 7], { role: "stair", position: "top_right", terrain: "earth" }],
    [[5, 6], { role: "stair", position: "left", terrain: "earth", over: "grass" }],
    [[5, 7], { role: "stair", position: "right", terrain: "earth", over: "grass" }],
    [[6, 6], { role: "stair", position: "bottom_left", terrain: "earth", over: "grass" }],
    [[6, 7], { role: "stair", position: "bottom_right", terrain: "earth", over: "grass" }],
    [[4, 15], { role: "stair", position: "left", terrain: "earth", over: "earth" }],
    [[4, 16], { role: "stair", position: "right", terrain: "earth", over: "earth" }],
  ],

  snow_details: [],
};

const SHAPES = {
  mountains_ground: [[[6, 7], { x: 6, y: 0, width: 10, height: 10 }]],
};

const SOLID = new Set(["rim", "crack", "face", "end", "wall", "corner"]);
const SOLID_BASES = new Set(["inner_west", "inner_east"]);

const attr = (xml, name) => xml.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const num = (xml, name) => Number(attr(xml, name) ?? 0);

const parseTilesets = (path) => {
  const xml = readFileSync(path, "utf-8");
  const out = new Map();

  for (const [, head, body] of xml.matchAll(/<tileset\b([^>]*)>([\s\S]*?)<\/tileset>/g)) {
    const image = body.match(/<image\b[^>]*\/>/)?.[0] ?? "";
    const shapes = new Map();

    for (const [, id, tile] of body.matchAll(/<tile id="(\d+)">([\s\S]*?)<\/tile>/g)) {
      const objects = [...tile.matchAll(/<object\b([^>]*?)(\/>|>([\s\S]*?)<\/object>)/g)];
      const rects = [];

      for (const [, o, , inner] of objects) {
        if (inner && /<(polygon|ellipse|polyline)/.test(inner))
          throw new Error(`${relative(ROOT, path)}: non-rect shape on tile ${id}`);
        rects.push({ x: num(o, "x"), y: num(o, "y"), width: num(o, "width"), height: num(o, "height") });
      }

      if (rects.length) shapes.set(Number(id), rects);
    }

    const name = attr(head, "name");
    out.set(name, {
      name,
      columns: num(head, "columns"),
      tilecount: num(head, "tilecount"),
      tilewidth: num(head, "tilewidth"),
      tileheight: num(head, "tileheight"),
      margin: num(head, "margin"),
      spacing: num(head, "spacing"),
      file: attr(image, "source").split("/").pop(),
      imagewidth: num(image, "width"),
      imageheight: num(image, "height"),
      shapes,
    });
  }

  return out;
};

const merge = (sources) => {
  const merged = new Map();

  for (const path of sources)
    for (const [name, ts] of parseTilesets(path)) {
      const existing = merged.get(name);
      if (!existing) {
        merged.set(name, ts);
        continue;
      }

      for (const key of ["columns", "tilecount", "imagewidth", "imageheight"])
        if (existing[key] !== ts[key])
          throw new Error(`${name}: ${key} differs between sources (${existing[key]} vs ${ts[key]})`);

      for (const [id, rects] of ts.shapes)
        if (!existing.shapes.has(id)) existing.shapes.set(id, rects);
    }

  return merged;
};

const property = (name, value) => ({
  name,
  type: typeof value === "number" ? "int" : typeof value === "boolean" ? "bool" : "string",
  value,
});

const objectgroup = (rects) => ({
  draworder: "index",
  id: 2,
  name: "",
  objects: rects.map((r, i) => ({
    height: r.height,
    id: i + 1,
    name: "",
    rotation: 0,
    type: "",
    visible: true,
    width: r.width,
    x: r.x,
    y: r.y,
  })),
  opacity: 1,
  type: "objectgroup",
  visible: true,
  x: 0,
  y: 0,
});

const build = (ts, tags, extra) => {
  const props = new Map();
  const problems = [];

  for (const [[r, c], rect] of extra) {
    const id = (r - 1) * ts.columns + (c - 1);
    if (ts.shapes.has(id)) problems.push(`(${r},${c}) already has a shape in the tmx, drop it from SHAPES`);
    else ts.shapes.set(id, [rect]);
  }

  for (const [[r, c], p] of tags) {
    const id = (r - 1) * ts.columns + (c - 1);
    if (c < 1 || c > ts.columns || id < 0 || id >= ts.tilecount) {
      problems.push(`(${r},${c}) is outside the sheet`);
      continue;
    }
    if (props.has(id)) {
      problems.push(`(${r},${c}) is tagged twice`);
      continue;
    }
    props.set(id, p);

    const solid = SOLID.has(p.role) || (p.role === "base" && SOLID_BASES.has(p.position));
    if (solid && !ts.shapes.has(id)) problems.push(`(${r},${c}) ${p.role}/${p.position} has no collision shape`);
  }

  const ids = [...new Set([...props.keys(), ...ts.shapes.keys()])].sort((a, b) => a - b);

  const tiles = ids.map((id) => {
    const tile = { id };
    const shapes = ts.shapes.get(id);
    const p = props.get(id);

    if (shapes) tile.objectgroup = objectgroup(shapes);
    if (p)
      tile.properties = Object.entries(p)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => property(k, v));

    return tile;
  });

  const json = {
    columns: ts.columns,
    image: `../sprites/${ts.file}`,
    imageheight: ts.imageheight,
    imagewidth: ts.imagewidth,
    margin: ts.margin,
    name: ts.name,
    spacing: ts.spacing,
    tilecount: ts.tilecount,
    tileheight: ts.tileheight,
    ...(tiles.length ? { tiles } : {}),
    tilewidth: ts.tilewidth,
  };

  return { json, problems, tagged: props.size, shaped: ts.shapes.size };
};

const tilesets = merge(SOURCES);
let failed = false;

for (const [name, tags] of Object.entries(TAGS)) {
  const ts = tilesets.get(name);
  if (!ts) {
    console.error(`✗ ${name}: not embedded in any source tmx`);
    failed = true;
    continue;
  }

  const { json, problems, tagged, shaped } = build(ts, tags, SHAPES[name] ?? []);

  if (problems.length) {
    failed = true;
    console.error(`✗ ${name}`);
    for (const p of problems) console.error(`    ${p}`);
    continue;
  }

  const path = resolve(OUT, `${name}.json`);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  console.log(`✓ ${relative(ROOT, path)}  ${tagged} tagged, ${shaped} with collision`);
}

process.exit(failed ? 1 : 0);
