import { Direction } from './directions';
import { StateName } from './states';
import { Slot } from './hotbar';

export interface Input {
  id: string;
  x: number;
  y: number;
  facing: Direction | null | undefined;
  moving: Direction[];
  isRunning: boolean;
  isFlying?: boolean;
  isJumping: boolean;
  isRolling: boolean;
  pointerdown: boolean;
  target?: { x: number; y: number };
  state: StateName;
  equipped: Slot | null | undefined;
}
