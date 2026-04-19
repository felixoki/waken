import { TILE_SIZE } from "@server/globals";
import { type Icon } from "@server/types";

export function Icon({ icon }: { icon: Icon }) {
  return (
    <div
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundImage: `url('/assets/sprites/${icon.spritesheet}.png')`,
        backgroundPosition: `-${(icon.col - 1) * TILE_SIZE}px -${(icon.row - 1) * TILE_SIZE}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        zoom: 4,
      }}
    />
  );
}
