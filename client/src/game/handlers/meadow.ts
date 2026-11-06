import {
  MEADOW_BAKE_MARGIN,
  MEADOW_BAKE_RATE,
  MEADOW_CHARACTERS,
  MEADOW_GRADE_BLUR,
  MEADOW_GRADE_PASSES,
  type MeadowGrade,
  type MeadowPalette,
} from "@server/globals";
import { PipelineName } from "@server/types";
import type { Scene } from "../scenes/Scene";
import type { Entity } from "../Entity";
import { water } from "./water";

export const BLADE_WIDTH = 7;
export const BLADE_HEIGHT = 6;
export const BLADE_VARIANTS = 5;

const BLADES = [
  ["#.....#", "##...##", ".##.##.", "..###..", "...#...", "...#..."],
  ["......#", "#....#.", "##..##.", ".##.#..", "..##...", "...#..."],
  ["#......", ".#...#.", ".##.##.", "..#.#..", "..###..", "...#..."],
  ["##...##", "###.###", ".##.##.", "...#...", "...#...", "..#...."],
  ["#..#..#", "#..#.#.", ".#.#.#.", ".#.##..", "..##...", "...#..."],
];

const BLADE_TEXTURE = "meadow_blades";

export interface Bake {
  layer: Phaser.Tilemaps.TilemapLayer;
  texture: Phaser.Textures.DynamicTexture;
  image: Phaser.GameObjects.Image;
}

export interface MeadowBlend {
  grade: MeadowGrade;
  texture: Phaser.Textures.Texture;
}

export interface Meadow {
  palette: MeadowPalette;
  mask: Phaser.Textures.Texture;
  grade?: MeadowGrade;
  blend?: Phaser.Textures.Texture;
  width: number;
  height: number;
  tile: number;
  characters: Float32Array;
  count: number;
  bakes: Bake[];
  x: number;
  y: number;
  spanX: number;
  spanY: number;
  elapsed: number;
  baking: boolean;
}

export const meadow = {
  blades: (scene: Scene) => {
    if (scene.textures.exists(BLADE_TEXTURE)) return;

    const texture = scene.textures.createCanvas(
      BLADE_TEXTURE,
      BLADE_WIDTH * BLADE_VARIANTS,
      BLADE_HEIGHT,
    );
    if (!texture) return;

    const context = texture.getContext();
    context.fillStyle = "#ffffff";

    BLADES.forEach((rows, v) =>
      rows.forEach((row, y) =>
        [...row].forEach((cell, x) => {
          if (cell === "#") context.fillRect(v * BLADE_WIDTH + x, y, 1, 1);
        }),
      ),
    );

    texture.refresh();
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  },

  apply: (
    scene: Scene,
    layers: Phaser.Tilemaps.TilemapLayer[],
    palette: MeadowPalette = "grass",
    edges: Phaser.Tilemaps.TilemapLayer[] = [],
    blend?: MeadowBlend,
  ) => {
    if (!layers.length) return;

    const { width: columns, height: rows, tileWidth } = layers[0].layer;
    const pixels = new Uint8Array(columns * rows * 4);
    const filled = (x: number, y: number) =>
      x < 0 ||
      y < 0 ||
      x >= columns ||
      y >= rows ||
      layers.some((layer) => layer.layer.data[y][x].index > 0);

    const centres = layers.filter((layer) => !edges.includes(layer));

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        let inside = centres.some((layer) => layer.layer.data[y][x].index > 0);
        for (let dy = -1; dy <= 1 && inside; dy++)
          for (let dx = -1; dx <= 1 && inside; dx++)
            inside = filled(x + dx, y + dy);

        pixels[(y * columns + x) * 4] = inside ? 255 : 0;
        pixels[(y * columns + x) * 4 + 3] = 255;
      }

    const key = `meadow_mask_${scene.scene.key}_${palette}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const mask = scene.textures.addUint8Array(key, pixels, columns, rows);
    if (!mask) return;

    meadow.blades(scene);

    const state: Meadow = {
      palette,
      mask,
      grade: blend?.grade,
      blend: blend?.texture,
      width: layers[0].layer.widthInPixels,
      height: layers[0].layer.heightInPixels,
      tile: tileWidth,
      characters: new Float32Array(MEADOW_CHARACTERS * 4),
      count: 0,
      bakes: [],
      x: 0,
      y: 0,
      spanX: 0,
      spanY: 0,
      elapsed: Infinity,
      baking: false,
    };

    layers.forEach((layer, i) => {
      const texture = meadow.canvas(scene, `${palette}_${i}`, 1, 1);
      if (!texture) return;

      layer.setData("meadow", state);
      layer.setPipeline(PipelineName.MEADOW);
      scene.cameras.main.ignore(layer);

      const image = scene.add
        .image(0, 0, texture.key)
        .setOrigin(0, 0)
        .setDepth(layer.depth);
      state.bakes.push({ layer, texture, image });
    });

    scene.meadows.push(state);
  },

  blend: (
    scene: Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
  ): Phaser.Textures.Texture | null => {
    const { width: columns, height: rows, data } = layer.layer;
    let a = new Float32Array(columns * rows);
    let b = new Float32Array(columns * rows);

    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) a[y * columns + x] = data[y][x].index > 0 ? 1 : 0;

    for (let pass = 0; pass < MEADOW_GRADE_PASSES; pass++) {
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < columns; x++) {
          let sum = 0;
          for (let k = -MEADOW_GRADE_BLUR; k <= MEADOW_GRADE_BLUR; k++)
            sum += a[y * columns + Math.min(columns - 1, Math.max(0, x + k))];
          b[y * columns + x] = sum / (MEADOW_GRADE_BLUR * 2 + 1);
        }
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < columns; x++) {
          let sum = 0;
          for (let k = -MEADOW_GRADE_BLUR; k <= MEADOW_GRADE_BLUR; k++)
            sum += b[Math.min(rows - 1, Math.max(0, y + k)) * columns + x];
          a[y * columns + x] = sum / (MEADOW_GRADE_BLUR * 2 + 1);
        }
    }

    const pixels = new Uint8Array(columns * rows * 4);
    for (let i = 0; i < a.length; i++) {
      pixels[i * 4] = Math.round(a[i] * 255);
      pixels[i * 4 + 3] = 255;
    }

    const key = `meadow_blend_${scene.scene.key}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const texture = scene.textures.addUint8Array(key, pixels, columns, rows);
    texture?.setFilter(Phaser.Textures.FilterMode.LINEAR);

    return texture;
  },

  canvas: (
    scene: Scene,
    index: string,
    width: number,
    height: number,
  ): Phaser.Textures.DynamicTexture | null => {
    const key = `meadow_bake_${scene.scene.key}_${index}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const texture = scene.textures.addDynamicTexture(key, width, height);
    texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);

    return texture;
  },

  update: (state: Meadow, scene: Scene, delta: number) => {
    state.count = 0;
    state.elapsed += delta;

    const camera = scene.cameras.main;
    const view = camera.worldView;
    const player = scene.managers.players.player;

    if (player) meadow.add(state, player, view);
    for (const other of scene.managers.players.others.values())
      meadow.add(state, other, view);
    for (const entity of scene.managers.entities.entities.values())
      meadow.add(state, entity, view);

    meadow.bake(state, scene, camera);
  },

  bake: (state: Meadow, scene: Scene, camera: Phaser.Cameras.Scene2D.Camera) => {
    const origin = water.origin(camera);
    const viewWidth = Math.ceil(camera.width / camera.zoom);
    const viewHeight = Math.ceil(camera.height / camera.zoom);
    const width = viewWidth + MEADOW_BAKE_MARGIN * 2;
    const height = viewHeight + MEADOW_BAKE_MARGIN * 2;
    const inside =
      origin.x >= state.x &&
      origin.y >= state.y &&
      origin.x + viewWidth <= state.x + state.spanX &&
      origin.y + viewHeight <= state.y + state.spanY;

    if (
      inside &&
      state.spanX === width &&
      state.spanY === height &&
      state.elapsed < 1000 / MEADOW_BAKE_RATE
    )
      return;

    const x = Math.floor(origin.x) - MEADOW_BAKE_MARGIN;
    const y = Math.floor(origin.y) - MEADOW_BAKE_MARGIN;

    state.elapsed = 0;
    state.spanX = width;
    state.spanY = height;
    state.x = x;
    state.y = y;
    state.baking = true;

    state.bakes.forEach((bake, i) => {
      if (bake.texture.width !== width || bake.texture.height !== height) {
        const texture = meadow.canvas(scene, `${state.palette}_${i}`, width, height);
        if (!texture) return;

        bake.texture = texture;
        bake.image.setTexture(texture.key);
      }

      bake.texture.clear();
      bake.texture.draw(bake.layer, -x, -y);
      bake.image.setPosition(x, y);
    });

    state.baking = false;
  },

  add: (state: Meadow, entity: Entity, view: Phaser.Geom.Rectangle) => {
    if (state.count >= MEADOW_CHARACTERS) return;
    if (entity.isStatic || !entity.active || entity.z > 0) return;

    const body = entity.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    const x = body.center.x;
    const y = body.bottom;
    if (!view.contains(x, y)) return;

    const i = state.count * 4;
    state.characters[i] = x;
    state.characters[i + 1] = y;
    state.count++;
  },

  destroy: (scene: Scene, state: Meadow) => {
    for (const bake of state.bakes) {
      bake.image.destroy();
      if (scene.textures.exists(bake.texture.key)) scene.textures.remove(bake.texture);
    }

    state.bakes.length = 0;
    if (scene.textures.exists(state.mask.key)) scene.textures.remove(state.mask);
    if (state.blend && scene.textures.exists(state.blend.key)) scene.textures.remove(state.blend);
  },
};
