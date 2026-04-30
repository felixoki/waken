import { Item } from './components';
import { Direction } from './directions';
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
  isAuthority: boolean;
  isDead: boolean;
  locked?: string;
  spells: SpellName[];
  inventory: (Item | null)[];
  effects?: Effect[];
}
