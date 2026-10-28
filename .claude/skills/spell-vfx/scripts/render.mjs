import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [fragPath, framesPath, size = "300x300", zoomArg = "2", colsArg, outArg] = process.argv.slice(2);

if (!fragPath || !framesPath) {
  console.error("usage: node render.mjs <frag.ts> <frames.json> <WxH> [zoom] [cols] [outDir]");
  process.exit(1);
}

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [W, H] = size.split("x").map(Number);
const zoom = Number(zoomArg);
const frames = JSON.parse(readFileSync(framesPath, "utf8"));
const layers = Number(process.env.LAYERS || 1);
const cells = Math.ceil(frames.length / layers);
const cols = Number(colsArg || Math.min(cells, 4));
const rows = Math.ceil(cells / cols);
const outDir = resolve(outArg || "vfx-render");
const name = basename(fragPath).replace(/\.ts$/, "");
mkdirSync(outDir, { recursive: true });

const bundle = execFileSync("npx", ["esbuild", resolve(fragPath), "--bundle", "--format=iife", "--global-name=F"], { encoding: "utf8" });

const backgrounds = { dark: [0.106, 0.102, 0.125], grass: [0.341, 0.475, 0.255], light: [0.78, 0.78, 0.8], grey: [0.27, 0.27, 0.27] };
const bg = backgrounds[process.env.BG || "dark"] || backgrounds.dark;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head><body>
<canvas id="c" width="${cols * W * zoom}" height="${rows * H * zoom}"></canvas>
<pre id="log"></pre>
<script>${bundle}</script>
<script>
const W = ${W}, H = ${H}, Z = ${zoom}, COLS = ${cols}, ROWS = ${rows}, LAYERS = ${layers};
const frames = ${JSON.stringify(frames)};
const log = (m) => (document.getElementById("log").textContent += m + "\\n");
const getter = Object.values(F).find((v) => typeof v === "function");
const fragSrc = getter();
const c = document.getElementById("c");
const gl = c.getContext("webgl", { premultipliedAlpha: true, preserveDrawingBuffer: true });
const vert = "attribute vec2 inPosition; uniform vec2 resolution; varying vec2 fragCoord; void main(){ fragCoord = inPosition; gl_Position = vec4(inPosition / resolution * 2.0 - 1.0, 0.0, 1.0); }";
const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { log("ERROR " + gl.getShaderInfoLog(s)); throw new Error("compile"); } return s; };
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { log("ERROR " + gl.getProgramInfoLog(prog)); throw new Error("link"); }
gl.useProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, W, 0, 0, H, 0, H, W, 0, W, H]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, "inPosition");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
gl.uniform2f(gl.getUniformLocation(prog, "resolution"), W, H);
gl.clearColor(${bg.join(",")}, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.SCISSOR_TEST);
for (let i = 0; i < frames.length; i++) {
  const cell = Math.floor(i / LAYERS);
  const x = (cell % COLS) * W * Z;
  const y = (ROWS - 1 - Math.floor(cell / COLS)) * H * Z;
  gl.viewport(x, y, W * Z, H * Z);
  gl.scissor(x, y, W * Z, H * Z);
  if (i % LAYERS === 0) { gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.BLEND); }
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let u = 0; u < count; u++) {
    const info = gl.getActiveUniform(prog, u);
    if (info.type === gl.FLOAT && info.name !== "resolution") gl.uniform1f(gl.getUniformLocation(prog, info.name), 0);
  }
  for (const [k, v] of Object.entries(frames[i])) {
    const u = gl.getUniformLocation(prog, k);
    if (u) gl.uniform1f(u, v);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
log("OK");
</script></body></html>`;

const htmlPath = resolve(outDir, `${name}.html`);
writeFileSync(htmlPath, html);

const flags = ["--headless=new", "--disable-gpu-sandbox", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--allow-file-access-from-files", "--hide-scrollbars", "--force-device-scale-factor=1"];
const url = pathToFileURL(htmlPath).href;
const dom = execFileSync(CHROME, [...flags, "--dump-dom", url], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const status = (dom.match(/<pre id="log">([\s\S]*?)<\/pre>/) || [])[1] || "";

if (!status.includes("OK")) {
  console.error(status.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") || "render failed");
  process.exit(1);
}

const png = resolve(outDir, `${name}.png`);
execFileSync(CHROME, [...flags, `--window-size=${cols * W * zoom},${rows * H * zoom}`, `--screenshot=${png}`, url], { stdio: "ignore" });
console.log(png);
