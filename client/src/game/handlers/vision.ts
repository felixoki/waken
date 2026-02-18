import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { handlers } from "./index";

interface RayHit {
  x: number;
  y: number;
  distance: number;
  hit: boolean;
}

export const vision = {
  raycast: (
    scene: Scene,
    x: number,
    y: number,
    angle: number,
    maxDistance: number,
  ): RayHit => {
    const map = scene.tileManager.map;
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
        const tile = map.getTileAtWorldXY(rx, ry);
        if (tile && tile.collides)
          return Phaser.Math.Distance.Between(x, y, rx, ry);

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
        const tile = map.getTileAtWorldXY(rx, ry);
        if (tile && tile.collides)
          return Phaser.Math.Distance.Between(x, y, rx, ry);

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
    const ray = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
    const circle = new Phaser.Geom.Circle(target.x, target.y, 16);

    return Phaser.Geom.Intersects.LineToCircle(ray, circle);
  },

  inRange: (
    from: { x: number; y: number },
    to: { x: number; y: number },
    distance: number,
  ): boolean => {
    return Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y) <= distance;
  },

  canSee: (
    scene: Scene,
    from: Entity,
    to: Entity,
    distance: number,
    angle: number = Math.PI / 2,
    count: number = 5,
    proximity: number = 80,
  ): boolean => {
    if (!vision.inRange(from, to, distance)) return false;

    const actualDist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
    if (actualDist <= proximity) return true;

    const facing = handlers.direction.toAngle(from.facing);
    const target = Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y);
    const diff = Phaser.Math.Angle.Wrap(target - facing);

    if (Math.abs(diff) > angle / 2) return false;

    const start = facing - angle / 2;
    const step = angle / (count - 1);

    for (let i = 0; i < count; i++) {
      const rayAngle = start + step * i;
      const hit = vision.raycast(scene, from.x, from.y, rayAngle, distance);

      if (vision.intersects({ x: from.x, y: from.y }, hit, to))
        return true;
    }

    return false;
  },

  findInCone: (
    scene: Scene,
    from: Entity,
    targets: Entity[],
    distance: number,
    angle: number = Math.PI / 2,
    count: number = 5,
  ): Entity[] => {
    return targets.filter((target) =>
      vision.canSee(scene, from, target, distance, angle, count),
    );
  },
};
