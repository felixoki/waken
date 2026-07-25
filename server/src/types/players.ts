import { Item } from './components';
import { Direction } from './directions';
import { Slot } from './hotbar';
import { MapName } from './maps';
import { SpellName } from './spells';
import { Effect } from './effects.js';

export interface PlayerConfig {
  id: string;
  socketId: string;
  map: MapName;
  x: number;
  y: number;
  facing: Direction;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  isAuthority: boolean;
  isDead: boolean;
  locked?: string;
  spells: SpellName[];
  inventory: (Item | null)[];
  hotbar: (Slot | null)[];
  active: number;
  effects?: Effect[];
}
