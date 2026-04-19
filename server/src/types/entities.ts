import { Direction } from './directions';
import { MapName } from './maps';
import { ComponentConfig, Item } from './components';
import { StateName } from './states';
import { BehaviorConfig } from './behaviors';
import { Dialogue } from './dialogue';
import { SpellName } from './spells';
import { WeaponName } from './weapons';

export interface AttackConfig {
  state: StateName;
  spell?: SpellName;
  weapon?: WeaponName;
  range?: number;
}

export interface EntityConfig {
  id: string;
  map: MapName;
  x: number;
  y: number;
  name: EntityName;
  health: number;
  createdAt: number;
  isLocked: boolean;
  lockedBy?: string;
  facing?: Direction;
  storing?: (Item | null)[];
}

export interface EntityDefinition {
  facing: Direction;
  moving: Direction[];
  components: ComponentConfig[];
  states: StateName[];
  behaviors?: BehaviorConfig[];
  attacks?: AttackConfig[];
  metadata?: EntityMetadata;
  dialogue?: Dialogue;
  offset?: { x?: number; y?: number };
}

export interface Icon {
  spritesheet: string;
  row: number;
  col: number;
}

export interface EntityMetadata {
  displayName?: string;
  description?: string;
  icon?: Icon;
  stackable?: boolean;
}

export enum EntityName {
  APPLETREE2 = "appletree2",
  AXE = "axe",
  BAKER = "baker",
  BARN = "barn",
  BARREL1 = "barrel1",
  BARRELS1 = "barrels1",
  BASKETFERN = "basketfern",
  BELLADONNA = "belladonna",
  BEVERAGE_SALER = "beverage_saler",
  BLACKSMITH = "blacksmith",
  BLACKSMITH_EXIT = "blacksmith_exit",
  BLACKSMITH_HOUSE = "blacksmith_house",
  BOAR = "boar",
  BOAR_MEAT = "boar_meat",
  BOX1 = "box1",
  BOXES1 = "boxes1",
  BOXES_FISH1 = "boxes_fish1",
  BOXES_FISH2 = "boxes_fish2",
  BOXES_FISH3 = "boxes_fish3",
  BUSH1 = "bush1",
  BUSH2 = "bush2",
  BUSH3 = "bush3",
  BUSH4 = "bush4",
  CABBAGE = "cabbage",
  CABBAGE_SEED = "cabbage_seed",
  CARROT = "carrot",
  CARROT_SEED = "carrot_seed",
  CHEST1 = "chest1",
  CITIZEN1 = "citizen1",
  CITIZEN2 = "citizen2",
  CITIZEN3 = "citizen3",
  CITIZEN4 = "citizen4",
  CITIZEN5 = "citizen5",
  CITIZEN6 = "citizen6",
  CITIZEN7 = "citizen7",
  CITIZEN8 = "citizen8",
  CITIZEN9 = "citizen9",
  CITIZEN10 = "citizen10",
  CITIZEN11 = "citizen11",
  CITIZEN12 = "citizen12",
  CITIZEN13 = "citizen13",
  DEER = "deer",
  DRAKE = "drake",
  DUCK = "duck",
  FARMPLOT = "farmplot",
  FISHING_HUT = "fishing_hut",
  FISHING_HUT_EXIT = "fishing_hut_exit",
  FISH_STAND1 = "fish_stand1",
  FLYAMINATA1 = "flyaminata1",
  FOX = "fox",
  GOBLIN1 = "goblin1",
  GOOSE = "goose",
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
  HOST = "host",
  HOUSE1 = "house1",
  HOUSE1_EXIT = "house1_exit",
  HOUSE2 = "house2",
  IRON_ORE = "iron_ore",
  LANTERN = "lantern",
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
  SHADOW_WANDERER = "shadow_wanderer",
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
  SPELL_BOOK_SHARD = "spell_book_shard",
  SPELL_BOOK_SLASH = "spell_book_slash",
  SPELL_BOOK_ILLUMINATE = "spell_book_illuminate",
  SPELL_BOOK_HURT_SHADOWS = "spell_book_hurt_shadows",
  SPELL_BOOK_METEOR_SHOWER = "spell_book_meteor_shower",
  SPELL_BOOK_BUTTERFLY_EFFIGY = "spell_book_butterfly_effigy",
  SPELL_BOOK_LIGHTNING_STRIKE = "spell_book_lightning_strike",
  VENISON_MEAT = "venison_meat",
  WELL = "well",
  WINDMILL = "windmill",
  WOOD = "wood",
}