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

  public thresholds: Threshold[];

  constructor(
    private tilemap: Phaser.Tilemaps.Tilemap,
    thresholds: Threshold[] = [],
  ) {
    this.thresholds = thresholds;
    this._getAnimations();
    this._findTiles();
  }

  get map(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
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
      const x1 = Math.floor((body.x + body.width) / tileWidth);
      const y1 = Math.floor((body.y + body.height) / tileHeight);

      for (let ty = y0; ty <= y1; ty++)
        for (let tx = x0; tx <= x1; tx++)
          if (this.grid[ty]?.[tx] !== undefined) this.grid[ty][tx] = 1;
    }

    return this.grid;
  }
}
