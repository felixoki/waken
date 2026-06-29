import { Scene } from "../scenes/Scene";

type Point = [number, number];
type Bezier = [Point, Point, Point, Point];

const FANG_SLIM: Bezier[] = [
  [
    [169.57, 106.12],
    [167.688, 91.64],
    [141.386, 75.696],
    [128.478, 75.696],
  ],
  [
    [128.478, 75.696],
    [125.938, 75.696],
    [123.918, 76.308],
    [122.705, 77.67],
  ],
  [
    [122.705, 77.67],
    [100.895, 102.055],
    [136.93, 158.932],
    [136.93, 158.932],
  ],
  [
    [136.93, 158.932],
    [136.93, 158.932],
    [172.676, 130.147],
    [169.57, 106.12],
  ],
];

const FANG_BROAD: Bezier[] = [
  [
    [298.402, 166.644],
    [298.402, 166.644],
    [332.717, 112.458],
    [311.946, 89.284],
  ],
  [
    [311.946, 89.284],
    [310.791, 87.992],
    [308.863, 87.404],
    [306.45, 87.404],
  ],
  [
    [306.45, 87.404],
    [294.142, 87.404],
    [269.098, 102.587],
    [267.308, 116.384],
  ],
  [
    [267.308, 116.384],
    [265.518, 130.181],
    [298.402, 166.644],
    [298.402, 166.644],
  ],
];

const traceBezier = (curves: Bezier[], perCurve = 12): Point[] => {
  const points: Point[] = [curves[0][0]];

  for (const [p0, c1, c2, p3] of curves) {
    for (let s = 1; s <= perCurve; s++) {
      const t = s / perCurve;
      const mt = 1 - t;
      const a = mt * mt * mt;
      const b = 3 * mt * mt * t;
      const c = 3 * mt * t * t;
      const d = t * t * t;
      points.push([
        a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
        a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
      ]);
    }
  }

  return points;
};

const boundsOf = (points: Point[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { minX, minY, width: maxX - minX, height: maxY - minY };
};

export const textures = {
  fangs: (scene: Scene) => {
    if (scene.textures.exists("particle_fang_0")) return;

    const SHAPES = [FANG_SLIM, FANG_BROAD, FANG_SLIM, FANG_BROAD];
    const HEIGHT = 44;
    const PAD = 4;
    const SLIM = 0.62;

    SHAPES.forEach((curves, i) => {
      const outline = traceBezier(curves);
      const { minX, minY, width, height } = boundsOf(outline);
      const innerW = HEIGHT * (width / height) * SLIM;
      const texW = Math.ceil(innerW + PAD * 2);
      const texH = HEIGHT + PAD * 2;

      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.beginPath();

      outline.forEach(([x, y], p) => {
        const px = PAD + ((x - minX) / width) * innerW;
        const py = PAD + (1 - (y - minY) / height) * HEIGHT;
        if (p === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      });

      g.closePath();
      g.fillPath();

      g.generateTexture(`particle_fang_${i}`, texW, texH);
      g.destroy();
    });
  },

  clouds: (scene: Scene) => {
    if (scene.textures.exists("particle_cloud_0")) return;

    const VARIANTS: Array<Array<[number, number, number]>> = [
      [
        [32, 30, 13],
        [18, 28, 10],
        [46, 28, 10],
        [24, 20, 9],
        [34, 16, 11],
        [44, 22, 8],
      ],
      [
        [20, 30, 11],
        [34, 31, 12],
        [48, 30, 11],
        [27, 22, 10],
        [41, 22, 10],
        [34, 17, 9],
      ],
      [
        [32, 32, 12],
        [20, 30, 10],
        [44, 30, 10],
        [26, 21, 10],
        [38, 20, 10],
        [32, 14, 10],
      ],
    ];

    const W = 64;
    const H = 48;

    VARIANTS.forEach((lobes, i) => {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      for (const [cx, cy, r] of lobes) g.fillCircle(cx, cy, r);
      g.generateTexture(`particle_cloud_${i}`, W, H);
      g.destroy();
    });
  },
};
