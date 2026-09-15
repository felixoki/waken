/**
 * Verifies every Tiled source map has a current JSON export.
 *
 * Tiled records its own export path in <editorsettings><export target="..."/>,
 * so the tmx to json mapping is derived, never hardcoded. Comparison is on
 * structure (dimensions, layer names and order, object count), not mtime, so
 * touching a file without changing it is not reported as drift.
 *
 * Exit code 1 if anything is wrong, so it can gate a pre-commit hook.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "tiled");
const MAPS = resolve(ROOT, "client/public/assets/maps");
const rel = (p) => relative(ROOT, p);

const attr = (xml, name) => xml.match(new RegExp(name + '="([^"]*)"'))?.[1];

/**
 * Layer names in document order. Deduped by first appearance because Tiled
 * group layers nest children that repeat the group's own name, while the JSON
 * export collapses them to one entry.
 */
const uniq = (names) => [...new Set(names)];

const tmxLayers = (xml) =>
  uniq(
    [...xml.matchAll(/<(?:layer|objectgroup|imagelayer|group)\b[^>]*\bname="([^"]*)"/g)].map(
      (m) => m[1],
    ),
  );

/** Flatten nested group layers so both sides are compared at the same depth. */
const jsonLayers = (map) => {
  const out = [];
  const walk = (layers) => {
    for (const l of layers ?? []) {
      out.push(l.name);
      if (l.layers) walk(l.layers);
    }
  };
  walk(map.layers);
  return uniq(out);
};

const problems = [];
const claimed = new Set();

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".tmx"))) {
  const path = resolve(SRC, file);
  const xml = readFileSync(path, "utf8");

  const target = xml.match(/<export\b[^>]*\btarget="([^"]*)"/)?.[1];
  if (!target) {
    problems.push(file + "  no export target set. In Tiled: File then Export As");
    continue;
  }

  const out = resolve(dirname(path), target);
  claimed.add(out);

  if (!existsSync(out)) {
    problems.push(file + "  never exported, expected " + rel(out));
    continue;
  }

  let map;
  try {
    map = JSON.parse(readFileSync(out, "utf8"));
  } catch {
    problems.push(file + "  " + rel(out) + " is not valid JSON");
    continue;
  }

  const drift = [];
  for (const key of ["width", "height", "tilewidth", "tileheight"]) {
    const a = Number(attr(xml, key));
    if (a !== map[key]) drift.push(key + " " + a + " vs " + map[key]);
  }

  const a = tmxLayers(xml);
  const b = jsonLayers(map);
  if (a.join(" ") !== b.join(" ")) {
    const missing = a.filter((n) => !b.includes(n));
    const extra = b.filter((n) => !a.includes(n));
    if (missing.length) drift.push("layers missing from export: " + missing.join(", "));
    if (extra.length) drift.push("layers only in export: " + extra.join(", "));
    if (!missing.length && !extra.length) drift.push("layer order differs");
  }

  const srcObjects = (xml.match(/<object\b/g) ?? []).length;
  const outObjects = (map.layers ?? []).reduce((n, l) => n + (l.objects?.length ?? 0), 0);
  if (outObjects > srcObjects) {
    drift.push("export has " + outObjects + " objects, source has " + srcObjects);
  }

  if (drift.length) {
    problems.push(file + "  STALE, exports to " + rel(out) + "\n     " + drift.join("\n     "));
  }
}

/** JSON in the maps dir that no tmx exports to. Dead, or hand-edited. */
if (existsSync(MAPS)) {
  for (const f of readdirSync(MAPS).filter((f) => f.endsWith(".json"))) {
    const p = resolve(MAPS, f);
    if (!claimed.has(p)) problems.push(f + "  orphan, no tmx exports to it");
  }
}

if (problems.length) {
  console.error("\n" + problems.length + " map problem(s):\n");
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}

console.log("All " + claimed.size + " map exports current.");
