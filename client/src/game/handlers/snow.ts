import {
  KICK_COUNT,
  KICK_DEPTH,
  KICK_GRAVITY,
  KICK_LIFESPAN,
  KICK_LIFT,
  KICK_SPEED,
  KICK_SPREAD,
  PATH_ALPHA,
  PATH_BRUSHES,
  PATH_CELL,
  PATH_CLUMPS,
  PATH_FADE_ALPHA,
  PATH_FADE_INTERVAL,
  PATH_FLOOR,
  PATH_JITTER,
  PATH_RIM,
  PATH_SHADE,
  PATH_SPILL,
  PATH_TEXTURE,
  PATH_WALL,
  PATH_WIDTH,
} from "@server/globals";
import type { Scene } from "../scenes/Scene";
import type { TileManager } from "../managers/Tile";

export interface SnowTracks {
  path: Phaser.Textures.DynamicTexture;
  spill?: Phaser.Textures.DynamicTexture;
  images: Phaser.GameObjects.Image[];
  kicks: Phaser.GameObjects.Particles.ParticleEmitter;
  fader: Phaser.GameObjects.Rectangle;
  treads: number[];
  spills: number[];
  faded: number;
  x: number;
  y: number;
}

const fract = (value: number): number => value - Math.floor(value);

export const snow = {
  noise: (x: number, y: number, seed: number): number =>
    fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453),

  create: (scene: Scene, tiles: TileManager): SnowTracks | null => {
    const surfaces = tiles.surfaceGrid;
    const base = tiles.surfaceLayer;
    if (!surfaces || !base) return null;

    const { width, height, tileWidth, tileHeight } = tiles.map;

    let x0 = width;
    let y0 = height;
    let x1 = -1;
    let y1 = -1;

    for (let i = 0; i < surfaces.length; i++) {
      if (!surfaces[i]) continue;

      const x = i % width;
      const y = (i - x) / width;

      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }

    if (x1 < 0) return null;

    snow.brushes(scene);

    const w = (x1 - x0 + 1) * tileWidth;
    const h = (y1 - y0 + 1) * tileHeight;
    const key = `path:${scene.scene.key}`;
    const spilled = `spill:${scene.scene.key}`;

    if (scene.textures.exists(key)) scene.textures.remove(key);
    if (scene.textures.exists(spilled)) scene.textures.remove(spilled);

    const path = scene.textures.addDynamicTexture(key, w, h);
    if (!path) return null;

    const spill = scene.textures.addDynamicTexture(spilled, w, h) ?? undefined;
    const originX = x0 * tileWidth;
    const originY = y0 * tileHeight;
    const images: Phaser.GameObjects.Image[] = [];

    if (spill) {
      const clumps = scene.add.image(originX, originY, spilled);

      clumps.setOrigin(0, 0);
      clumps.setTint(PATH_RIM);
      clumps.setAlpha(PATH_ALPHA);
      clumps.setDepth(base.depth + 1.4);

      images.push(clumps);
    }

    const layers: [number, number, number][] = [
      [PATH_WALL, 0, -1],
      [PATH_SHADE, 0, 0],
      [PATH_FLOOR, 0, 2],
    ];

    layers.forEach(([tint, dx, dy], index) => {
      const image = scene.add.image(originX + dx, originY + dy, key);

      image.setOrigin(0, 0);
      image.setTint(tint);
      image.setAlpha(PATH_ALPHA);
      image.setDepth(base.depth + 1 + index * 0.1);

      images.push(image);
    });

    const kicks = scene.add.particles(0, 0, "particle_circle", {
      tint: [0xffffff, 0xdfeaec, 0xc5dadd],
      alpha: { start: 0.95, end: 0.15 },
      scale: { start: 0.11, end: 0.05 },
      lifespan: { min: KICK_LIFESPAN * 0.6, max: KICK_LIFESPAN },
      gravityY: KICK_GRAVITY,
      emitting: false,
    });

    kicks.setDepth(KICK_DEPTH);

    const fader = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      0,
      w,
      h,
      0xffffff,
      PATH_FADE_ALPHA,
    );
    fader.setOrigin(0, 0);

    return {
      path,
      spill,
      images,
      kicks,
      fader,
      treads: [],
      spills: [],
      faded: 0,
      x: originX,
      y: originY,
    };
  },

  brushes: (scene: Scene): void => {
    if (scene.textures.exists(PATH_TEXTURE)) return;

    const g = scene.add.graphics();
    const centre = PATH_CELL / 2;

    g.fillStyle(0xffffff);

    for (let brush = 0; brush < PATH_BRUSHES + PATH_CLUMPS; brush++) {
      const clump = brush >= PATH_BRUSHES;
      const radius = clump
        ? 1 + snow.noise(brush, 0, 9) * 1.4
        : PATH_WIDTH / 2 - 1 + snow.noise(brush, 0, 9);
      const lobe = clump ? 0.4 : 0.6 + snow.noise(brush, 0, 11) * 0.8;
      const phase = snow.noise(brush, 0, 13) * Math.PI * 2;

      for (let y = 0; y < PATH_CELL; y++)
        for (let x = 0; x < PATH_CELL; x++) {
          const dx = x + 0.5 - centre;
          const dy = y + 0.5 - centre;
          const angle = Math.atan2(dy, dx);
          const edge =
            radius +
            lobe * Math.sin(angle * 3 + phase) +
            lobe * 0.6 * Math.sin(angle * 5 - phase) +
            (snow.noise(x, y, brush) - 0.5);

          if (Math.sqrt(dx * dx + dy * dy) <= edge)
            g.fillRect(brush * PATH_CELL + x, y, 1, 1);
        }
    }

    g.generateTexture(
      PATH_TEXTURE,
      (PATH_BRUSHES + PATH_CLUMPS) * PATH_CELL,
      PATH_CELL,
    );
    g.destroy();

    const texture = scene.textures.get(PATH_TEXTURE);

    for (let brush = 0; brush < PATH_BRUSHES + PATH_CLUMPS; brush++)
      texture.add(brush, 0, brush * PATH_CELL, 0, PATH_CELL, PATH_CELL);
  },

  tread: (
    tracks: SnowTracks,
    x: number,
    y: number,
    dx: number,
    dy: number,
  ): void => {
    const cx = Math.round(x);
    const cy = Math.round(y);
    const brush = Math.floor(snow.noise(cx, cy, 3) * PATH_BRUSHES);
    const tx = cx + Math.round((snow.noise(cx, cy, 1) - 0.5) * PATH_JITTER * 2);
    const ty = cy + Math.round((snow.noise(cx, cy, 2) - 0.5) * PATH_JITTER * 2);
    const { treads } = tracks;
    const last = treads.length;

    if (last && treads[last - 3] === tx && treads[last - 2] === ty) return;

    treads.push(tx, ty, brush);

    if (!dx && !dy) return;
    if (snow.noise(cx, cy, 5) > PATH_SPILL) return;

    const side = snow.noise(cx, cy, 6) < 0.5 ? 1 : -1;
    const reach =
      PATH_WIDTH / 2 + 1 + snow.noise(cx, cy, 7) * PATH_WIDTH * 0.8;
    const clump =
      PATH_BRUSHES + Math.floor(snow.noise(cx, cy, 8) * PATH_CLUMPS);

    tracks.spills.push(
      Math.round(cx - dy * side * reach),
      Math.round(cy + dx * side * reach),
      clump,
    );
  },

  kick: (
    tracks: SnowTracks,
    x: number,
    y: number,
    dx: number,
    dy: number,
  ): void => {
    const count = 1 + Math.floor(Math.random() * KICK_COUNT);

    for (let i = 0; i < count; i++) {
      const particle = tracks.kicks.emitParticleAt(x, y);

      if (!particle) continue;

      const spread = (Math.random() - 0.5) * KICK_SPREAD;
      const speed = KICK_SPEED * (0.5 + Math.random());

      particle.velocityX = (-dx - dy * spread) * speed;
      particle.velocityY = (-dy + dx * spread) * speed - KICK_LIFT;
    }
  },

  flush: (tracks: SnowTracks): void => {
    const offset = PATH_CELL / 2;

    snow.draw(tracks.path, tracks.treads, tracks.x + offset, tracks.y + offset);
    tracks.treads.length = 0;

    if (tracks.spill)
      snow.draw(tracks.spill, tracks.spills, tracks.x + offset, tracks.y + offset);
    tracks.spills.length = 0;
  },

  draw: (
    target: Phaser.Textures.DynamicTexture,
    stamps: number[],
    x: number,
    y: number,
  ): void => {
    if (!stamps.length) return;

    target.beginDraw();

    for (let i = 0; i < stamps.length; i += 3)
      target.batchDrawFrame(
        PATH_TEXTURE,
        stamps[i + 2],
        stamps[i] - x,
        stamps[i + 1] - y,
      );

    target.endDraw();
  },

  fade: (tracks: SnowTracks, delta: number): void => {
    tracks.faded += delta;
    if (tracks.faded < PATH_FADE_INTERVAL) return;

    tracks.faded = 0;
    tracks.path.erase(tracks.fader);
    tracks.spill?.erase(tracks.fader);
  },

  destroy: (tracks: SnowTracks): void => {
    tracks.images.forEach((image) => image.destroy());
    tracks.kicks.destroy();
    tracks.spill?.destroy();
    tracks.path.destroy();
    tracks.fader.destroy();
  },
};
