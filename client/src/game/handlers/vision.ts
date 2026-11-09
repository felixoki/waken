import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { handlers } from "./index";
import { VISION_PROXIMITY } from "@server/globals";

interface RayHit {
  x: number;
  y: number;
  distance: number;
  hit: boolean;
}

const ray = new Phaser.Geom.Line();
const circle = new Phaser.Geom.Circle();

export const vision = {
  raycast: (
    scene: Scene,
    x: number,
    y: number,
    angle: number,
    maxDistance: number,
    grid: number[][],
    clear?: Uint8Array | null,
  ): RayHit => {
    const map = scene.tileManager.map;
    const blocks = (tx: number, ty: number) =>
      grid[ty]?.[tx] === 1 && !clear?.[ty * map.width + tx];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tan = Math.tan(angle);

    const checkVertical = (): number => {
      if (Math.abs(cos) < 0.0001) return Infinity;

      const step = cos > 0 ? map.tileWidth : -map.tileWidth;
      let rx =
        cos > 0
          ? Math.ceil(x / map.tileWidth) * map.tileWidth
          : Math.floor(x / map.tileWidth) * map.tileWidth - 1;
      let ry = y + (rx - x) * tan;
      const yo = step * tan;

      for (let i = 0; i < map.width; i++) {
        const tx = Math.floor(rx / map.tileWidth);
        const ty = Math.floor(ry / map.tileHeight);
        if (blocks(tx, ty)) return Phaser.Math.Distance.Between(x, y, rx, ry);

        rx += step;
        ry += yo;
      }

      return Infinity;
    };

    const checkHorizontal = (): number => {
      if (Math.abs(sin) < 0.0001) return Infinity;

      const step = sin > 0 ? map.tileHeight : -map.tileHeight;
      let ry =
        sin > 0
          ? Math.ceil(y / map.tileHeight) * map.tileHeight
          : Math.floor(y / map.tileHeight) * map.tileHeight - 1;
      let rx = x + (ry - y) / tan;
      const xo = step / tan;

      for (let i = 0; i < map.height; i++) {
        const tx = Math.floor(rx / map.tileWidth);
        const ty = Math.floor(ry / map.tileHeight);
        if (blocks(tx, ty)) return Phaser.Math.Distance.Between(x, y, rx, ry);

        rx += xo;
        ry += step;
      }

      return Infinity;
    };

    const distance = Math.min(checkVertical(), checkHorizontal(), maxDistance);

    const hit = {
      x: x + cos * distance,
      y: y + sin * distance,
    };

    return { ...hit, distance, hit: distance < maxDistance };
  },

  intersects: (
    start: { x: number; y: number },
    end: { x: number; y: number },
    target: Entity,
  ): boolean => {
    ray.setTo(start.x, start.y, end.x, end.y);
    circle.setTo(target.x, target.y, 16);

    return Phaser.Geom.Intersects.LineToCircle(ray, circle);
  },

  canSee: (
    scene: Scene,
    from: Entity,
    to: Entity,
    distance: number,
    angle: number = Math.PI / 2,
  ): boolean => {
    const dist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
    if (dist > distance) return false;

    const target = Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y);

    if (dist > VISION_PROXIMITY) {
      const facing = handlers.direction.toAngle(from.facing);
      if (Math.abs(Phaser.Math.Angle.Wrap(target - facing)) > angle / 2)
        return false;
    }

    const grid = handlers.path.getGrid(from, handlers.path.canJump(from), true);
    const clear = scene.tileManager?.getSightMask();
    const hit = vision.raycast(
      scene,
      from.x,
      from.y,
      target,
      distance,
      grid,
      clear,
    );

    return vision.intersects({ x: from.x, y: from.y }, hit, to);
  },
};
