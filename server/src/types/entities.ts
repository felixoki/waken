import { Direction } from './directions';
import { MapName } from './maps';
import { ComponentConfig } from './components';
import { StateName } from './states';
import { BehaviorConfig } from './behaviors';
import { Dialogue } from './dialogue';

export interface EntityConfig {
  id: string;
  map: MapName;
  x: number;
  y: number;
  name: EntityName;
  health: number;
  createdAt: number;
}

export interface EntityDefinition {
  facing: Direction;
  moving: Direction[];
  components: ComponentConfig[];
  states: StateName[];
  behaviors?: BehaviorConfig[];
  metadata?: EntityMetadata;
  dialogue?: Dialogue;
  offset?: { x?: number; y?: number };
}

export interface EntityMetadata {
  displayName?: string;
  description?: string;
  icon?: string;
  stackable?: boolean;
}

export enum EntityName {
  APPLETREE2 = "appletree2",
  BARN = "barn",
  BARREL1 = "barrel1",
  BARRELS1 = "barrels1",
  BASKETFERN = "basketfern",
  BELLADONNA = "belladonna",
  BLACKSMITH = "blacksmith",
  BLACKSMITH_EXIT = "blacksmith_exit",
  BLACKSMITH_HOUSE = "blacksmith_house",
  BOAR = "boar",
  BOAR_MEAT = "boar_meat",
  BUSH1 = "bush1",
  BUSH2 = "bush2",
  BUSH3 = "bush3",
  BUSH4 = "bush4",
  CABBAGE = "cabbage",
  CABBAGE_SEED = "cabbage_seed",
  CARROT = "carrot",
  CARROT_SEED = "carrot_seed",
  CITIZEN1 = "citizen1",
  DEER = "deer",
  DRAKE = "drake",
  DUCK = "duck",
  FARMPLOT = "farmplot",
  FLYAMINATA1 = "flyaminata1",
  FOX = "fox",
  GLASS = "glass",
  GLASSBLOWER = "glassblower",
  GLASSBLOWER_EXIT = "glassblower_exit",
  GLASSBLOWER_HOUSE = "glassblower_house",
  GREENGROCER = "greengrocer",
  HENHOUSE = "henhouse",
  HERBALIST = "herbalist",
  HERBALIST_EXIT = "herbalist_exit",
  HERBALIST_HOUSE = "herbalist_house",
  HOE = "hoe",
  HOUSE1 = "house1",
  HOUSE1_EXIT = "house1_exit",
  HOUSE2 = "house2",
  IRON_ORE = "iron_ore",
  JUMP = "jump",
  MARKET_STAND1 = "market_stand1",
  MARKET_STAND2 = "market_stand2",
  MARKET_STAND3 = "market_stand3",
  ORC1 = "orc1",
  PLAYER = "player",
  QUARTZ1 = "quartz1",
  REED1 = "reed1",
  REED2 = "reed2",
  REED3 = "reed3",
  ROCK1 = "rock1",
  ROCK2 = "rock2",
  ROCK3 = "rock3",
  ROCK4 = "rock4",
  ROCK8 = "rock8",
  ROCKS1 = "rocks1",
  ROCKS3 = "rocks3",
  ROCKS5 = "rocks5",
  ROCKS6 = "rocks6",
  STUMP1 = "stump1",
  STUMP2 = "stump2",
  SUNFLOWER = "sunflower",
  TAVERN = "tavern",
  TAVERN_EXIT = "tavern_exit",
  TOMATO = "tomato",
  TOMATO_SEED = "tomato_seed",
  TORCH1 = "torch1",
  TREE1 = "tree1",
  TREE2 = "tree2",
  TREE4 = "tree4",
  TREE5 = "tree5",
  VENISON_MEAT = "venison_meat",
  WELL = "well",
  WINDMILL = "windmill",
  WOOD = "wood",
}
