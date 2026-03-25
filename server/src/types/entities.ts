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
  PLAYER = "player",
  ORC1 = "orc1",
  HOUSE1 = "house1",
  HOUSE1_EXIT = "house1_exit",
  HOUSE2 = "house2",
  HERBALIST = "herbalist",
  HERBALIST_HOUSE = "herbalist_house",
  HERBALIST_EXIT = "herbalist_exit",
  BLACKSMITH = "blacksmith",
  BLACKSMITH_HOUSE = "blacksmith_house",
  BLACKSMITH_EXIT = "blacksmith_exit",
  GLASSBLOWER_HOUSE = "glassblower_house",
  GLASSBLOWER_EXIT = "glassblower_exit",
  GLASSBLOWER = "glassblower",
  MARKET_STAND1 = "market_stand1",
  MARKET_STAND2 = "market_stand2",
  MARKET_STAND3 = "market_stand3",
  TAVERN = "tavern",
  TAVERN_EXIT = "tavern_exit",
  WINDMILL = "windmill",
  BARN = "barn",
  HENHOUSE = "henhouse",
  WELL = "well",
  TREE1 = "tree1",
  TREE2 = "tree2",
  TREE4 = "tree4",
  TREE5 = "tree5",
  APPLETREE2 = "appletree2",
  STUMP1 = "stump1",
  STUMP2 = "stump2",
  BUSH1 = "bush1",
  BUSH2 = "bush2",
  BUSH3 = "bush3",
  BUSH4 = "bush4",
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
  FLYAMINATA1 = "flyaminata1",
  BASKETFERN = "basketfern",
  VENISON_MEAT = "venison_meat",
  BOAR_MEAT = "boar_meat",
  WOOD = "wood",
  IRON_ORE = "iron_ore",
  GLASS = "glass",
  DRAKE = "drake",
  DUCK = "duck",
  FOX = "fox",
  DEER = "deer",
  BOAR = "boar",
  JUMP = "jump",
  BARREL1 = "barrel1",
  BARRELS1 = "barrels1",
  CITIZEN1 = "citizen1",
  TORCH1 = "torch1",
  QUARTZ1 = "quartz1",
  GREENGROCER = "greengrocer",
  BELLADONNA = "belladonna",
  SUNFLOWER = "sunflower",
  CARROT = "carrot",
  CARROT_SEED = "carrot_seed",
  TOMATO = "tomato",
  TOMATO_SEED = "tomato_seed",
  CABBAGE = "cabbage",
  CABBAGE_SEED = "cabbage_seed",
  HOE = "hoe",
  FARMPLOT = "farmplot",
}
