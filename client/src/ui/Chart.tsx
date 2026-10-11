import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";
import type { Landmark } from "@server/types/generation";
import type { Chart as ChartData } from "../game/handlers/chart";

const FADE_MS = 200;
const FIT = 0.9;
const LANDMARK = "#111827";
const PLAYER = "#dc2626";

export function Chart() {
  const [visible, setVisible] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const source = useRef<ChartData>();
  const image = useRef<ImageData>();

  useEffect(() => {
    const draw = (data: ChartData | undefined, landmarks: Landmark[]) => {
      const el = canvas.current;
      const ctx = el?.getContext("2d");

      if (!data || !el || !ctx) {
        setVisible(false);
        return;
      }

      if (source.current !== data) {
        source.current = data;
        image.current = new ImageData(
          new Uint8ClampedArray(data.pixels.buffer),
          data.width,
          data.height,
        );

        const scale = Math.min(
          (window.innerWidth * FIT) / data.width,
          (window.innerHeight * FIT) / data.height,
        );

        el.width = data.width;
        el.height = data.height;
        el.style.width = `${Math.round(data.width * scale)}px`;
        el.style.height = `${Math.round(data.height * scale)}px`;
      }

      ctx.putImageData(image.current!, 0, 0);

      ctx.fillStyle = LANDMARK;

      for (const landmark of landmarks) {
        const col = Math.floor(landmark.x / data.tileWidth);
        const row = Math.floor(landmark.y / data.tileHeight);

        if (!data.seen[row * data.width + col]) continue;

        ctx.clearRect(col - 1, row - 1, 3, 3);
        ctx.fillRect(col - 1, row - 1, 3, 3);
        ctx.clearRect(col, row, 1, 1);
      }

      ctx.fillStyle = PLAYER;
      ctx.clearRect(data.col - 1, data.row - 1, 3, 3);
      ctx.fillRect(data.col - 1, data.row - 1, 3, 3);

      setVisible(true);
    };

    EventBus.on(Event.CHART, draw);

    return () => {
      EventBus.off(Event.CHART, draw);
    };
  }, []);

  return (
    <div
      className="fixed right-4 top-1/2 z-40 -translate-y-1/2 bg-gray-800 rounded-lg p-4 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    >
      <canvas ref={canvas} style={{ imageRendering: "pixelated" }} />
    </div>
  );
}
