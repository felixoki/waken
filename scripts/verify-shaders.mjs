import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIR = resolve(ROOT, "client/src/game/pipelines");
const SQUARE = /^2(\.0*)?$/;

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : [],
  );

const exponent = (src, open) => {
  let depth = 0;
  let comma = -1;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return comma < 0 ? null : src.slice(comma + 1, i).trim();
    else if (c === "," && depth === 1) comma = i;
  }
  return null;
};

const problems = [];

for (const file of files(DIR)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/(?<![.\w])pow\s*\(/g)) {
    const exp = exponent(src, m.index + m[0].length - 1);
    if (exp === null || !SQUARE.test(exp)) continue;
    const line = src.slice(0, m.index).split("\n").length;
    problems.push(`${relative(ROOT, file)}:${line} pow(…, ${exp}) is NaN on Metal for a negative base; write x * x`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log("shaders ok");
