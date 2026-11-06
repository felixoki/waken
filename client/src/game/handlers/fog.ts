import {
  FOG_ALPHA,
  FOG_COLOR,
  FOG_DEPTH,
  FOG_DRIFT,
  FOG_EDGE,
  FOG_GRADES,
  FOG_SCALE,
} from "@server/globals";
import type { Scene } from "../scenes/Scene";
import type { MeadowBlend } from "./meadow";
import { getFogFrag } from "../pipelines/frags/fog";

const rgb = (color: number) => ({
  x: ((color >> 16) & 0xff) / 255,
  y: ((color >> 8) & 0xff) / 255,
  z: (color & 0xff) / 255,
});

export const fog = {
  apply: (scene: Scene, blend: MeadowBlend, width: number, height: number) => {
    if (!FOG_GRADES.includes(blend.grade)) return;

    const base = new Phaser.Display.BaseShader("fog", getFogFrag(), undefined, {
      uBlend: { type: "sampler2D", value: null },
      uScale: { type: "2f", value: { x: FOG_SCALE[0], y: FOG_SCALE[1] } },
      uDrift: { type: "2f", value: { x: FOG_DRIFT[0], y: FOG_DRIFT[1] } },
      uEdge: { type: "2f", value: { x: FOG_EDGE[0], y: FOG_EDGE[1] } },
      uColor: { type: "3f", value: rgb(FOG_COLOR) },
      uAlpha: { type: "1f", value: FOG_ALPHA },
    });

    scene.add
      .shader(base, 0, 0, width, height)
      .setOrigin(0, 0)
      .setDepth(FOG_DEPTH)
      .setSampler2D("uBlend", blend.texture.key, 0);
  },
};
