import { Direction } from './directions';
import { StateName } from './states';
import { Slot } from './hotbar';
import { SpellName } from './spells';

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
  speed?: number;
  pointerdown: boolean;
  target?: { x: number; y: number; id?: string };
  state: StateName;
  equipped: Slot | null | undefined;
  active: number;
  spell?: SpellName | null;
}
