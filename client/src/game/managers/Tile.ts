import { SurfaceName, TiledProperty } from "@server/types";

const SURFACES = Object.values(SurfaceName);

interface Animation {
  frames: number[];
  durations: number[];
  currentFrame: number;
  elapsedTime: number;
  positions: Array<{
    layer: Phaser.Tilemaps.TilemapLayer;
    x: number;
    y: number;
  }>;
}

export interface Threshold {
  body?: Phaser.GameObjects.Rectangle;
  tileY: number;
  rendersAbove: boolean;
  clearance?: number;
  image?: Phaser.GameObjects.Image;
  depth?: number;
}

export class TileManager {
  private animations = new Map<number, Animation>();
  private grid?: number[][];
  private sight?: Uint8Array | null;
  private surfaces?: Uint8Array;
  private base?: Phaser.Tilemaps.TilemapLayer;
  private exposures = new Map<SurfaceName, Uint32Array>();

  public thresholds: Threshold[];
  public colliders: Phaser.GameObjects.Rectangle[];

  constructor(
    private tilemap: Phaser.Tilemaps.Tilemap,
    thresholds: Threshold[] = [],
    colliders: Phaser.GameObjects.Rectangle[] = [],
  ) {
    this.thresholds = thresholds;
    this.colliders = colliders;
    this._getAnimations();
    this._findTiles();
    this._getSurfaces();
  }

  get map(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
  }

  get surfaceGrid(): Uint8Array | undefined {
    return this.surfaces;
  }

  get surfaceLayer(): Phaser.Tilemaps.TilemapLayer | undefined {
    return this.base;
  }

  update(delta: number, player?: { y: number; z: number }): void {
    if (player)
      for (let i = 0; i < this.thresholds.length; i++) {
        const threshold = this.thresholds[i];

        if (threshold.body) {
          const isAbove = player.y > threshold.tileY;
          const body = threshold.body.body as Phaser.Physics.Arcade.StaticBody;
          body.enable = isAbove !== threshold.rendersAbove;
        }

        if (threshold.image && threshold.clearance !== undefined)
          threshold.image.setDepth(
            player.z > threshold.clearance
              ? (threshold.depth ?? 0)
              : 1000 + threshold.tileY,
          );
      }

    const cam = this.tilemap.scene.cameras.main;
    const view = cam.worldView;

    const tw = this.tilemap.tileWidth;
    const th = this.tilemap.tileHeight;

    const minX = Math.floor(view.x / tw) - 1;
    const minY = Math.floor(view.y / th) - 1;
    const maxX = Math.ceil((view.x + view.width) / tw) + 1;
    const maxY = Math.ceil((view.y + view.height) / th) + 1;

    this.animations.forEach((anim) => {
      anim.elapsedTime += delta;

      if (anim.elapsedTime >= anim.durations[anim.currentFrame]) {
        anim.elapsedTime -= anim.durations[anim.currentFrame];
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;

        const frameGid = anim.frames[anim.currentFrame];

        anim.positions.forEach(({ layer, x, y }) => {
          if (x >= minX && x <= maxX && y >= minY && y <= maxY)
            layer.putTileAt(frameGid, x, y);
        });
      }
    });
  }

  destroy(): void {
    this.animations.clear();
  }

  surfaceAt(x: number, y: number): SurfaceName | undefined {
    if (!this.surfaces) return undefined;

    const index = this._index(x, y);
    const code = index < 0 ? 0 : this.surfaces[index];

    return code ? SURFACES[code - 1] : undefined;
  }

  exposure(surface: SurfaceName, x: number, y: number, radius: number): number {
    const table = this.exposures.get(surface);
    if (!table) return 0;

    const { width, height, tileWidth, tileHeight } = this.tilemap;
    const tx = Math.floor(x / tileWidth);
    const ty = Math.floor(y / tileHeight);

    const x0 = Math.max(tx - radius, 0);
    const y0 = Math.max(ty - radius, 0);
    const x1 = Math.min(tx + radius, width - 1);
    const y1 = Math.min(ty + radius, height - 1);

    if (x0 > x1 || y0 > y1) return 0;

    const stride = width + 1;
    const sum =
      table[(y1 + 1) * stride + x1 + 1] -
      table[y0 * stride + x1 + 1] -
      table[(y1 + 1) * stride + x0] +
      table[y0 * stride + x0];

    return sum / ((x1 - x0 + 1) * (y1 - y0 + 1));
  }

  private _index(x: number, y: number): number {
    const { width, height, tileWidth, tileHeight } = this.tilemap;
    const tx = Math.floor(x / tileWidth);
    const ty = Math.floor(y / tileHeight);

    if (tx < 0 || ty < 0 || tx >= width || ty >= height) return -1;

    return ty * width + tx;
  }

  private _getSurfaces(): void {
    const { width, height } = this.tilemap;

    for (const data of this.tilemap.layers) {
      const properties = data.properties as TiledProperty[] | undefined;
      const value = properties?.find((p) => p.name === "surface")?.value;
      const code = SURFACES.indexOf(value) + 1;

      if (!code) continue;

      this.surfaces ??= new Uint8Array(width * height);

      for (let y = 0; y < data.height; y++)
        for (let x = 0; x < data.width; x++)
          if (data.data[y][x].index > 0) this.surfaces[y * width + x] = code;

      this.base ??= data.tilemapLayer;
    }

    if (!this.surfaces) return;

    const stride = width + 1;

    for (let i = 0; i < SURFACES.length; i++) {
      const table = new Uint32Array(stride * (height + 1));
      let found = false;

      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const hit = this.surfaces[y * width + x] === i + 1 ? 1 : 0;
          if (hit) found = true;

          table[(y + 1) * stride + x + 1] =
            hit +
            table[y * stride + x + 1] +
            table[(y + 1) * stride + x] -
            table[y * stride + x];
        }

      if (found) this.exposures.set(SURFACES[i], table);
    }

  }

  private _getAnimations(): void {
    this.tilemap.tilesets.forEach((tileset) => {
      if (!tileset.tileData) return;

      Object.entries(tileset.tileData).forEach(([id, data]: [string, any]) => {
        if (!data.animation?.length) return;

        const baseGid = tileset.firstgid + parseInt(id);
        const frames = data.animation.map(
          (f: any) => tileset.firstgid + f.tileid,
        );
        const durations = data.animation.map((f: any) => f.duration);

        this.animations.set(baseGid, {
          frames,
          durations,
          currentFrame: 0,
          elapsedTime: 0,
          positions: [],
        });
      });
    });
  }

  private _findTiles(): void {
    this.tilemap.layers.forEach((data) => {
      const layer = data.tilemapLayer;
      if (!layer) return;

      data.data.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (!tile || tile.index < 0) return;

          const anim = this.animations.get(tile.index);
          if (anim) anim.positions.push({ layer, x, y });
        });
      });
    });
  }

  getSightMask(): Uint8Array | null {
    if (this.sight !== undefined) return this.sight;

    const { width, height } = this.tilemap;
    const through = new Uint8Array(width * height);
    const opaque = new Uint8Array(width * height);
    let any = false;

    for (const data of this.tilemap.layers) {
      const properties = data.properties as TiledProperty[] | undefined;
      const see = properties?.some(
        (p) => p.name === "seeThrough" && p.value === true,
      );
      const target = see ? through : opaque;

      if (see) any = true;

      for (let y = 0; y < data.height; y++)
        for (let x = 0; x < data.width; x++)
          if (data.data[y][x].collides) target[y * width + x] = 1;
    }

    if (!any) return (this.sight = null);

    for (let i = 0; i < through.length; i++) if (opaque[i]) through[i] = 0;

    return (this.sight = through);
  }

  getCollisionGrid(): number[][] {
    if (this.grid) return this.grid;

    const { width, height, tileWidth, tileHeight } = this.tilemap;

    this.grid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const collides = this.tilemap.layers.some((layer) => {
          const tile = this.tilemap.getTileAt(x, y, true, layer.name);
          return tile?.collides;
        });

        return collides ? 1 : 0;
      }),
    );

    for (const threshold of this.thresholds) {
      if (!threshold.body) continue;
      const body = threshold.body.body as Phaser.Physics.Arcade.StaticBody;

      const x0 = Math.floor(body.x / tileWidth);
      const y0 = Math.floor(body.y / tileHeight);
      const x1 = Math.ceil((body.x + body.width) / tileWidth) - 1;
      const y1 = Math.ceil((body.y + body.height) / tileHeight) - 1;

      for (let ty = y0; ty <= y1; ty++)
        for (let tx = x0; tx <= x1; tx++)
          if (this.grid[ty]?.[tx] !== undefined) this.grid[ty][tx] = 1;
    }

    return this.grid;
  }
}
