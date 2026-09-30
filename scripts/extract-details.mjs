/**
 * Regenerates server/src/configs/details.ts from the detail sheets' pixels.
 *
 * A detail is not always one tile: sheets hold clumps spanning 2x2, 2x3, 3x3.
 * Connected runs of opaque pixels recover each clump (a formation), and blobs
 * sharing a tile are merged. Formations are then sorted into surfaces by colour.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { inflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const SPRITES = resolve(ROOT, "client/public/assets/sprites");
const OUT = resolve(ROOT, "server/src/configs/details.ts");
const TILE = 16;
const OPAQUE = 40;
const FAINT = 128;

const SETS = [
  { name: "groundStamps", sheet: "ground_grass_details", keep: (f) => !f.green },
  { name: "grassStamps", sheet: "ground_grass_details", keep: (f) => f.green },
  { name: "snowStamps", sheet: "snow_details", keep: () => true },
  {
    name: "flowerStamps",
    sheet: "village_home",
    keep: (f) => !f.plain && (f.within([53, 14, 54, 17]) || f.within([55, 1, 56, 17])),
  },
];

const decode = (path) => {
  const buf = readFileSync(path);
  let pos = 8;
  let width = 0;
  let height = 0;
  const idat = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const [depth, color, , , interlace] = data.subarray(8, 13);
      if (depth !== 8 || color !== 6 || interlace !== 0)
        throw new Error(`${relative(ROOT, path)}: only 8-bit RGBA, non-interlaced PNGs are supported`);
    }
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;

    pos += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = y * stride;

    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? pixels[out + i - 4] : 0;
      const b = y ? pixels[out - stride + i] : 0;
      const c = i >= 4 && y ? pixels[out - stride + i - 4] : 0;
      let value = line[i];

      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }

      pixels[out + i] = value & 0xff;
    }
  }

  return { width, height, pixels };
};

const formations = (sheet) => {
  const { width, height, pixels } = decode(resolve(SPRITES, `${sheet}.png`));
  const columns = width / TILE;
  const seen = new Uint8Array(width * height);
  const alpha = (x, y) => pixels[(y * width + x) * 4 + 3];
  const blobs = [];

  for (let y0 = 0; y0 < height; y0++)
    for (let x0 = 0; x0 < width; x0++) {
      if (seen[y0 * width + x0] || alpha(x0, y0) <= OPAQUE) continue;

      const stack = [[x0, y0]];
      const tiles = new Set();
      let red = 0;
      let green = 0;
      let alphas = 0;
      let count = 0;
      const colours = new Set();

      seen[y0 * width + x0] = 1;

      while (stack.length) {
        const [x, y] = stack.pop();
        const p = (y * width + x) * 4;

        tiles.add(Math.floor(y / TILE) * columns + Math.floor(x / TILE));
        red += pixels[p];
        green += pixels[p + 1];
        alphas += pixels[p + 3];
        count++;
        colours.add((pixels[p] << 16) | (pixels[p + 1] << 8) | pixels[p + 2]);

        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (seen[ny * width + nx] || alpha(nx, ny) <= OPAQUE) continue;

            seen[ny * width + nx] = 1;
            stack.push([nx, ny]);
          }
      }

      blobs.push({ tiles, red, green, alphas, count, colours });
    }

  const merged = [];

  for (const blob of blobs) {
    const touching = merged.filter((m) => [...blob.tiles].some((t) => m.tiles.has(t)));
    const into = { ...blob, tiles: new Set(blob.tiles), colours: new Set(blob.colours) };

    for (const m of touching) {
      merged.splice(merged.indexOf(m), 1);
      for (const t of m.tiles) into.tiles.add(t);
      into.red += m.red;
      into.green += m.green;
      into.alphas += m.alphas;
      into.count += m.count;
      for (const c of m.colours) into.colours.add(c);
    }

    merged.push(into);
  }

  return merged.map((m) => {
    const ids = [...m.tiles].sort((a, b) => a - b);
    const rows = ids.map((id) => Math.floor(id / columns));
    const cols = ids.map((id) => id % columns);
    const top = Math.min(...rows);
    const left = Math.min(...cols);

    return {
      ids,
      green: m.green > m.red * 1.1,
      faint: m.alphas / m.count < FAINT,
      plain: m.colours.size < 2,
      within: ([r0, c0, r1, c1]) =>
        rows.every((r) => r + 1 >= r0 && r + 1 <= r1) &&
        cols.every((c) => c + 1 >= c0 && c + 1 <= c1),
      stamp: {
        width: Math.max(...cols) - left + 1,
        height: Math.max(...rows) - top + 1,
        tiles: ids.map((id, i) => ({ dx: cols[i] - left, dy: rows[i] - top, tileId: id })),
      },
    };
  });
};

const cache = new Map();
const sections = [];
const summary = [];

for (const { name, sheet, keep } of SETS) {
  if (!cache.has(sheet)) cache.set(sheet, formations(sheet));
  const stamps = cache
    .get(sheet)
    .filter((f) => !f.faint && keep(f))
    .map((f) => f.stamp);

  if (!stamps.length) throw new Error(`${name}: no formations found in ${sheet}`);

  const multi = stamps.filter((s) => s.tiles.length > 1).length;
  summary.push(` * ${name}: ${stamps.length} from ${sheet} (${multi} multi-tile)`);

  const body = stamps
    .map(
      (s) =>
        `  { width: ${s.width}, height: ${s.height}, tiles: [${s.tiles
          .map((t) => `{ dx: ${t.dx}, dy: ${t.dy}, tileId: ${t.tileId} }`)
          .join(", ")}] },`,
    )
    .join("\n");

  sections.push(`export const ${name}: DetailStamp[] = [\n${body}\n];`);
}

writeFileSync(
  OUT,
  `/**
 * AUTO-GENERATED by scripts/extract-details.mjs (npm run extract:details).
 * Do not edit manually.
${summary.join("\n")}
 */

import { DetailStamp } from "../types/generation";

${sections.join("\n\n")}
`,
);

console.log(`✓ ${relative(ROOT, OUT)}`);
for (const line of summary) console.log(line.replace(" * ", "  "));
