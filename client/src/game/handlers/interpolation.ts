import { INTERPOLATION_SNAP, INTERPOLATION_SPEED } from "@server/globals";
import type { Entity } from "../Entity";

export const interpolation = {
  drift(entity: Entity, x: number, y: number): void {
    const dx = x - entity.x;
    const dy = y - entity.y;

    if (dx * dx + dy * dy > INTERPOLATION_SNAP * INTERPOLATION_SNAP) {
      entity.setPosition(x, y);
      entity.driftX = 0;
      entity.driftY = 0;
      return;
    }

    entity.driftX = dx;
    entity.driftY = dy;
  },

  settle(entity: Entity, delta: number): void {
    if (entity.driftX === 0 && entity.driftY === 0) return;

    const t = 1 - Math.exp(-INTERPOLATION_SPEED * (delta / 1000));
    let dx = entity.driftX * t;
    let dy = entity.driftY * t;

    if (
      Math.abs(entity.driftX - dx) < 0.01 &&
      Math.abs(entity.driftY - dy) < 0.01
    ) {
      dx = entity.driftX;
      dy = entity.driftY;
    }

    entity.driftX -= dx;
    entity.driftY -= dy;
    entity.setPosition(entity.x + dx, entity.y + dy);
  },
};
