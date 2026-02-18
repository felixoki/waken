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

export class TileManager {
  private animations = new Map<number, Animation>();

  constructor(private tilemap: Phaser.Tilemaps.Tilemap) {
    this._getAnimations();
    this._findTiles();
  }

  get map(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
  }

  update(delta: number): void {
    this.animations.forEach((anim) => {
      anim.elapsedTime += delta;

      if (anim.elapsedTime >= anim.durations[anim.currentFrame]) {
        anim.elapsedTime -= anim.durations[anim.currentFrame];
        anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;

        const frameGid = anim.frames[anim.currentFrame];
        anim.positions.forEach(({ layer, x, y }) =>
          layer.putTileAt(frameGid, x, y),
        );
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
    const { width, height } = this.tilemap;

    return Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const collides = this.tilemap.layers.some((layer) => {
          const tile = this.tilemap.getTileAt(x, y, true, layer.name);
          return tile?.collides;
        });
        
        return collides ? 1 : 0;
      }),
    );
  }
}
