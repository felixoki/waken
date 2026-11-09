import { useEffect, useRef } from "react";

type Layer = { current: () => void };

const layers: Layer[] = [];

export const escape = {
  close(): boolean {
    const top = layers[layers.length - 1];
    if (!top) return false;

    top.current();
    return true;
  },
};

export function useEscape(active: boolean, close: () => void): void {
  const ref = useRef(close);
  ref.current = close;

  useEffect(() => {
    if (!active) return;

    layers.push(ref);

    return () => {
      const index = layers.lastIndexOf(ref);
      if (index !== -1) layers.splice(index, 1);
    };
  }, [active]);
}
