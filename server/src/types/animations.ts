import { Direction } from "./directions";

export interface AnimationConfig {
  frameCount: number;
  frameRate: number;
  repeat: number;
  airborne?: [number, number];
  impact?: number | Record<Direction, number>;
}
