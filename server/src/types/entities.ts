import { Damage, DamageType } from "./damage.js";
import { Direction } from "./directions";
import { MapName } from "./maps";
import { ComponentConfig, Item } from "./components";
import { StateName } from "./states";
import { BehaviorConfig } from "./behaviors";
import { Dialogue, DialogueChoice } from "./dialogue";
import { SpellName } from "./spells";
import { WeaponName } from "./weapons";
import { Effect, EffectName } from "./effects.js";
import { BossThemeName, SoundName } from "./sounds";
import { ZoneConfig } from "./zones.js";
import type { BiomeName } from "./generation";
import type { Position } from "./schedule";

export enum ProjectileName {
  ROCK = "rock",
  MUD = "mud",
}

export interface AttackConfig {
  state: StateName;
  spell?: SpellName;
  weapon?: WeaponName;
  damage?: Damage;
  effects?: [EffectName, number, number?][];
  range?: number;
  minRange?: number;
  projectile?: ProjectileName;
  cooldown?: number;
  opener?: boolean;
  mend?: boolean;
  windup?: number;
  sound?: SoundName;
  swing?: SoundName;
}

export interface CropState {
  growth?: number;
  watered?: boolean;
  wateredAt?: number;
}

export interface TameState {
  isPacified?: boolean;
  isTamed?: boolean;
  fedAt?: number;
  bredAt?: number;
  milkedAt?: number;
  follows?: string;
  settled?: boolean;
}

export interface EntityConfig {
  id: string;
  map: MapName;
  x: number;
  y: number;
  name: EntityName;
  health: number;
  maxHealth: number;
  createdAt: number;
  isLocked: boolean;
  lockedBy?: string;
  facing?: Direction;
  storing?: (Item | null)[];
  loot?: (Item & { chance: number })[];
  effects?: Effect[];
  crop?: CropState;
  tame?: TameState;
  spawner?: SpawnerConfig;
  textureSpawner?: TextureSpawnerConfig;
  zone?: ZoneConfig;
  weight?: number;
  quantity?: number;
  soul?: EntityName;
  hive?: boolean;
  dropped?: boolean;
  built?: boolean;
  link?: string;
  parent?: string;
  origin?: BiomeName;
  isOpen?: boolean;
  anchor?: Position;
  away?: boolean;
  placement?: string;
  converting?: { at: number; amount: number };
  playing?: boolean;
}

export interface SpawnerConfig {
  entities: { name: EntityName; weight: number }[];
  max: number;
  duration: number;
  radius?: number;
}

export interface TextureSpawnerConfig {
  sprites: string[];
  duration: number;
  radius: number;
  frames: number;
  frameRate: number;
}

export interface SpawnerState {
  lastAt: number;
  children: Set<string>;
}

export interface Bonus {
  spell?: SpellName;
  weapon?: WeaponName;
  effects: [EffectName, number, number?][];
}

export enum TriggerName {
  ROLL = "roll",
  BLINK = "blink",
}

export interface Trigger {
  name: EntityName;
  on: TriggerName;
  damage: Damage;
  knockback: number;
  radius: number;
  lifesteal?: number;
  effects?: [EffectName, number, number?][];
}

export interface Modifier {
  unique?: boolean;
  multipliers?: {
    damage?: number;
    crit?: number;
    defense?: number;
    speed?: number;
    capture?: number;
    healthRegen?: number;
    manaRegen?: number;
  };
  regen?: {
    health?: number;
    mana?: number;
  };
  max?: {
    health?: number;
    mana?: number;
  };
  depth?: number;
  keep?: boolean;
  calm?: boolean;
  bonus?: {
    health?: number;
    mana?: number;
    crit?: number;
    reflect?: number;
  };
  kill?: {
    health?: number;
    mana?: number;
  };
  immunities?: EffectName[];
  resist?: Partial<Record<EffectName, number>>;
  taken?: Partial<Record<DamageType, number>>;
}

export interface EntityDefinition {
  facing: Direction;
  moving: Direction[];
  components: ComponentConfig[];
  states: StateName[];
  maxHealth?: number;
  speed?: number;
  scale?: number;
  behaviors?: BehaviorConfig[];
  attacks?: AttackConfig[];
  bonuses?: Bonus[];
  modifier?: Modifier;
  trigger?: Trigger;
  metadata?: EntityMetadata;
  dialogue?: Dialogue;
  topics?: DialogueChoice[];
  offset?: { x?: number; y?: number };
  flat?: boolean;
  floats?: boolean;
  sinks?: boolean;
  wades?: boolean;
  theme?: BossThemeName;
}

export interface Icon {
  spritesheet: string;
  row: number;
  col: number;
}

export enum Rarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  LEGENDARY = "legendary",
}

export interface Phrase {
  one: string;
  many: string;
}

export interface EntityMetadata {
  name?: string;
  displayName?: string;
  phrase?: Phrase;
  description?: string;
  icon?: Icon;
  stackable?: boolean;
  rarity?: Rarity;
  weight?: number;
}

export enum EntityName {
  APPLETREE2 = "appletree2",
  AXE = "axe",
  AMULET1 = "amulet1",
  AMULET2 = "amulet2",
  AMULET3 = "amulet3",
  BAKER = "baker",
  BALE = "bale",
  BANQUET_TABLE = "banquet_table",
  BARN = "barn",
  BARREL1 = "barrel1",
  BARREL2 = "barrel2",
  BARREL3 = "barrel3",
  BARRELS1 = "barrels1",
  BARRELS2 = "barrels2",
  BEANS = "beans",
  BEAN_PLANT = "bean_plant",
  BEAN_SEED = "bean_seed",
  BEAR = "bear",
  BEAR_FAT = "bear_fat",
  BEAR_PELT = "bear_pelt",
  BEARDED_TOOTH_FUNGUS = "bearded_tooth_fungus",
  BELLAN = "bellan",
  BELLAN_PELT = "bellan_pelt",
  BEEF = "beef",
  BEER = "beer",
  BELL = "bell",
  BELLADONNA = "belladonna",
  VALERIAN = "valerian",
  BOG_MYRTLE = "bog_myrtle",
  BEVERAGE_SALER = "beverage_saler",
  BLACKSMITH = "blacksmith",
  BLADE = "blade",
  BLACKSMITH_EXIT = "blacksmith_exit",
  BLACKSMITH_HOUSE = "blacksmith_house",
  BLOODGEIST1 = "bloodgeist1",
  BLUE_LOTUS = "blue_lotus",
  BOAR = "boar",
  BONE = "bone",
  BOTTLE = "bottle",
  BOOKKEEPER = "bookkeeper",
  BOOTS1 = "boots1",
  BOWL1 = "bowl1",
  BOX1 = "box1",
  BOXES1 = "boxes1",
  BOXES2 = "boxes2",
  BOXES3 = "boxes3",
  BOXES4 = "boxes4",
  BOXES5 = "boxes5",
  BOXES6 = "boxes6",
  BOXES7 = "boxes7",
  BOXES8 = "boxes8",
  BOXES_FISH1 = "boxes_fish1",
  BOXES_FISH2 = "boxes_fish2",
  BOXES_FISH3 = "boxes_fish3",
  BREAD = "bread",
  FLOUR = "flour",
  BUSH1 = "bush1",
  BUSH2 = "bush2",
  BUSH3 = "bush3",
  BUSH4 = "bush4",
  BUSH5 = "bush5",
  BUSH6 = "bush6",
  BUSH7 = "bush7",
  BUSH8 = "bush8",
  BUSH9 = "bush9",
  BUSH10 = "bush10",
  BUSH11 = "bush11",
  REED4 = "reed4",
  REED5 = "reed5",
  REED6 = "reed6",
  CABBAGE = "cabbage",
  CABBAGE_PLANT = "cabbage_plant",
  CABBAGE_SEED = "cabbage_seed",
  CANDLE = "candle",
  CANDLES1 = "candles1",
  CANDLES2 = "candles2",
  CANDLES3 = "candles3",
  CARROT = "carrot",
  CARROT_PLANT = "carrot_plant",
  CARROT_SEED = "carrot_seed",
  CAVE_ENTRANCE = "cave_entrance",
  CAVE_EXIT = "cave_exit",
  BED = "bed",
  DOWN_BED = "down_bed",
  PELT_BED = "pelt_bed",
  KING_SIZE_BED = "king_size_bed",
  CHEST1 = "chest1",
  CLOSED_DOOR = "closed_door",
  FENCE = "fence",
  CLOUDLADDER = "cloudladder",
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
  CITIZEN14 = "citizen14",
  CITIZEN15 = "citizen15",
  CITIZEN16 = "citizen16",
  CLARY_SAGE = "clary_sage",
  COMPASS = "compass",
  MAP = "map",
  CUPBOARD1 = "cupboard1",
  CUPBOARD2 = "cupboard2",
  DEER = "deer",
  DEER_HIDE = "deer_hide",
  DAFFODIL = "daffodil",
  DOG = "dog",
  DRAGON = "dragon",
  DRAKE = "drake",
  DUCK = "duck",
  DUNGEON_ENTRANCE = "dungeon_entrance",
  FARM_HOUSE = "farm_house",
  FARM_HOUSE_EXIT = "farm_house_exit",
  WINDMILL_EXIT = "windmill_exit",
  FARMPLOT = "farmplot",
  FEATHER = "feather",
  FIREBOWL1 = "firebowl1",
  FISHING_HUT = "fishing_hut",
  FISHING_HUT_EXIT = "fishing_hut_exit",
  FISHING_HOOK = "fishing_hook",
  FISHING_ROD = "fishing_rod",
  FISH_MEAT = "fish_meat",
  FISH_STAND1 = "fish_stand1",
  FISHWIFE = "fishwife",
  ZONE = "zone",
  CARP = "carp",
  PERCH = "perch",
  PIKE = "pike",
  CAVEFISH = "cavefish",
  TENCH = "tench",
  CARP_TROPHY = "carp_trophy",
  PERCH_TROPHY = "perch_trophy",
  PIKE_TROPHY = "pike_trophy",
  CAVEFISH_TROPHY = "cavefish_trophy",
  TENCH_TROPHY = "tench_trophy",
  FOX = "fox",
  FOX_PELT = "fox_pelt",
  COW = "cow",
  CALF = "calf",
  BULL = "bull",
  GOAT = "goat",
  GOATLING = "goatling",
  MILK = "milk",
  SHEEP = "sheep",
  LAMB = "lamb",
  WOOL = "wool",
  BUCKET = "bucket",
  BUTCHERS_KNIFE = "butchers_knife",
  GRAPE = "grape",
  GRAPE_PLANT = "grape_plant",
  GRAPE_SEED = "grape_seed",
  GRASS1 = "grass1",
  CHICKEN = "chicken",
  POULTRY = "poultry",
  PIG = "pig",
  PIGLET = "piglet",
  PORK = "pork",
  ROOSTER = "rooster",
  CHICK = "chick",
  EGG = "egg",
  ERGOT = "ergot",
  SOULSTONE = "soulstone",
  GOBLIN1 = "goblin1",
  GOBLIN2 = "goblin2",
  GOOSE = "goose",
  GOOSE_DOWN = "goose_down",
  GOSLING = "gosling",
  GAME_MEAT = "game_meat",
  GROUSE = "grouse",
  GLASS = "glass",
  GLASSBLOWER = "glassblower",
  GLASSBLOWER_EXIT = "glassblower_exit",
  GLASSBLOWER_HOUSE = "glassblower_house",
  GLIMMER = "glimmer",
  GREENGROCER = "greengrocer",
  HAMMER = "hammer",
  HARE = "hare",
  HARE_FOOT = "hare_foot",
  HAT1 = "hat1",
  HAZELNUT = "hazelnut",
  HENBANE = "henbane",
  EDELWEISS = "edelweiss",
  HENHOUSE = "henhouse",
  HELPER1 = "helper1",
  HELPER2 = "helper2",
  HERBALIST = "herbalist",
  HERBALIST_EXIT = "herbalist_exit",
  HERBALIST_HOUSE = "herbalist_house",
  HERON = "heron",
  HERON_BEAK = "heron_beak",
  HEXGEIST = "hexgeist",
  HOE = "hoe",
  HOPS = "hops",
  HOPS_PLANT = "hops_plant",
  HOPS_SEED = "hops_seed",
  HOST = "host",
  HOUSE1 = "house1",
  HOUSE1_EXIT = "house1_exit",
  HOUSE2 = "house2",
  IBEX = "ibex",
  IBEX_HORN = "ibex_horn",
  IRON1 = "iron1",
  JAR = "jar",
  JAR_OF_PICKLES = "jar_of_pickles",
  LADDER = "ladder",
  LEVER = "lever",
  LANTERN = "lantern",
  LANTERN_LIGHT = "lantern_light",
  LUMP_OF_SUGAR = "lump_of_sugar",
  NECKLACE1 = "necklace1",
  MARKET_HOUSE = "market_house",
  MARKET_HOUSE_EXIT = "market_house_exit",
  MARKET_STAND1 = "market_stand1",
  MARKET_STAND2 = "market_stand2",
  MARKET_STAND3 = "market_stand3",
  MARKET_STAND4 = "market_stand4",
  OPIUM_POPPY = "opium_poppy",
  ORC1 = "orc1",
  ORC2 = "orc2",
  ORC3 = "orc3",
  PLAYER = "player",
  PICKAXE = "pickaxe",
  QUARTZ1 = "quartz1",
  QUARTZ_ORE = "quartz_ore",
  AZURITE1 = "azurite1",
  AZURITE_ORE = "azurite_ore",
  IRON_ORE = "iron_ore",
  IRON_VEIN = "iron_vein",
  BOG_IRON = "bog_iron",
  MILL_HOPPER = "mill_hopper",
  FORGE = "forge",
  WINDMILL_SAILS = "windmill_sails",
  VISITOR1 = "visitor1",
  VISITOR2 = "visitor2",
  CULT_TENT = "cult_tent",
  NIGHTCAP = "nightcap",
  LEFT_BOOT = "left_boot",
  CARVED_CHARM = "carved_charm",
  OLD_FRAME = "old_frame",
  CAVE_ROCK1 = "cave_rock1",
  CAVE_ROCK2 = "cave_rock2",
  CAVE_ROCK3 = "cave_rock3",
  CAVE_ROCK4 = "cave_rock4",
  CAVE_ROCK5 = "cave_rock5",
  CAVE_ROCK6 = "cave_rock6",
  GLOWSHROOM1 = "glowshroom1",
  GLOWSHROOM2 = "glowshroom2",
  GLOWSHROOM3 = "glowshroom3",
  RAT = "rat",
  RAT_CLAWS = "rat_claws",
  RASPBERRY = "raspberry",
  RASPBERRY_JAM = "raspberry_jam",
  HONEY = "honey",
  CHEESE = "cheese",
  MAGE = "mage",
  REMAINS = "remains",
  ALCHEMIST_TABLE = "alchemist_table",
  BAG2 = "bag2",
  BAG3 = "bag3",
  BARREL4 = "barrel4",
  BARRELS3 = "barrels3",
  CARPET1 = "carpet1",
  CARPET2 = "carpet2",
  CHAIR1 = "chair1",
  MORTAR_AND_PESTLE = "mortar_and_pestle",
  PILLOWS1 = "pillows1",
  REMAINS2 = "remains2",
  REMAINS3 = "remains3",
  SPELLPAGES = "spellpages",
  ALTAR = "altar",
  APPRENTICE = "apprentice",
  BAG1 = "bag1",
  BOOKS1 = "books1",
  BOXES9 = "boxes9",
  CANDELABRA = "candelabra",
  COFFIN1 = "coffin1",
  POTIONS1 = "potions1",
  SACK1 = "sack1",
  SKULLS1 = "skulls1",
  SLEEPING_BAG1 = "sleeping_bag1",
  SLEEPING_BAG2 = "sleeping_bag2",
  ROBE1 = "robe1",
  ROBE2 = "robe2",
  ROBE3 = "robe3",
  ROBE4 = "robe4",
  ROBE5 = "robe5",
  VASES3 = "vases3",
  REED1 = "reed1",
  REED2 = "reed2",
  REED3 = "reed3",
  CATTAIL1 = "cattail1",
  CATTAIL2 = "cattail2",
  CATTAIL3 = "cattail3",
  CATTAIL4 = "cattail4",
  SEDGE1 = "sedge1",
  SEDGE2 = "sedge2",
  SEDGE3 = "sedge3",
  SEDGE4 = "sedge4",
  SEDGE5 = "sedge5",
  CAVE_FERN1 = "cave_fern1",
  CAVE_FERN2 = "cave_fern2",
  CAVE_FERN3 = "cave_fern3",
  CAVE_FERN4 = "cave_fern4",
  CAVE_FERN5 = "cave_fern5",
  CAVE_FERN6 = "cave_fern6",
  CAVE_FERN7 = "cave_fern7",
  WATER_LILY1 = "water_lily1",
  WATER_LILY2 = "water_lily2",
  RING1 = "ring1",
  RING2 = "ring2",
  RING3 = "ring3",
  ROCK1 = "rock1",
  ROCK2 = "rock2",
  ROCK3 = "rock3",
  ROCK4 = "rock4",
  ROCK8 = "rock8",
  ROCK9 = "rock9",
  ROCK10 = "rock10",
  ROCK11 = "rock11",
  ROCK12 = "rock12",
  ROCK13 = "rock13",
  ROCK14 = "rock14",
  ROCK15 = "rock15",
  ROCK16 = "rock16",
  ROCK17 = "rock17",
  ROCK18 = "rock18",
  ROCK19 = "rock19",
  PEBBLE1 = "pebble1",
  PEBBLE2 = "pebble2",
  PEBBLE3 = "pebble3",
  PEBBLE4 = "pebble4",
  PEBBLE5 = "pebble5",
  MOSSY_ROCK1 = "mossy_rock1",
  MOSSY_ROCK2 = "mossy_rock2",
  MOSSY_ROCK3 = "mossy_rock3",
  MOSSY_ROCK4 = "mossy_rock4",
  MOSSY_ROCK5 = "mossy_rock5",
  MOSSY_ROCK6 = "mossy_rock6",
  MOSSY_ROCK7 = "mossy_rock7",
  MOSSY_ROCK8 = "mossy_rock8",
  MOSSY_ROCK9 = "mossy_rock9",
  STALAGMITE1 = "stalagmite1",
  STALAGMITE2 = "stalagmite2",
  STALAGMITE3 = "stalagmite3",
  STALAGMITE4 = "stalagmite4",
  STALAGMITE5 = "stalagmite5",
  STALAGMITE6 = "stalagmite6",
  STALAGMITE7 = "stalagmite7",
  STALAGMITE8 = "stalagmite8",
  STALAGMITE9 = "stalagmite9",
  STALAGMITE10 = "stalagmite10",
  STALAGMITE11 = "stalagmite11",
  STALAGMITE12 = "stalagmite12",
  STALAGMITE13 = "stalagmite13",
  STALAGMITE14 = "stalagmite14",
  STALAGMITE15 = "stalagmite15",
  STALAGMITE16 = "stalagmite16",
  STALAGMITE17 = "stalagmite17",
  STALAGMITE18 = "stalagmite18",
  ROCKS1 = "rocks1",
  ROCKS3 = "rocks3",
  ROCKS5 = "rocks5",
  ROCKS6 = "rocks6",
  RUIN1 = "ruin1",
  RUIN2 = "ruin2",
  RUIN3 = "ruin3",
  RUIN4 = "ruin4",
  RUIN5 = "ruin5",
  SHADOW_WANDERER = "shadow_wanderer",
  GRANDMOTHER = "grandmother",
  SILVER_SWORD = "silver_sword",
  SPAWNER = "spawner",
  TEXTURE_SPAWNER = "texture_spawner",
  TENT1 = "tent1",
  TENT2 = "tent2",
  STUMP1 = "stump1",
  STUMP2 = "stump2",
  STUMP3 = "stump3",
  STUMP4 = "stump4",
  STUMP5 = "stump5",
  STUDENT = "student",
  STRAWBERRY = "strawberry",
  STRAWBERRY_BUSH = "strawberry_bush",
  STRAWBERRY_JAM = "strawberry_jam",
  SUNFLOWER = "sunflower",
  TAVERN = "tavern",
  TAVERN_EXIT = "tavern_exit",
  TANNER = "tanner",
  TABLE1 = "table1",
  TABLE2 = "table2",
  TABLE3 = "table3",
  TOMATO = "tomato",
  TOMATO_PLANT = "tomato_plant",
  TROLL = "troll",
  ANCIENT_TROLL = "ancient_troll",
  GOLEM = "golem",
  ZOMBIE1 = "zombie1",
  ZOMBIE2 = "zombie2",
  ZOMBIE3 = "zombie3",
  HOG_WITCH = "hog_witch",
  BOG_TROLL = "bog_troll",
  TROLL_SCALES = "troll_scales",
  TRUMPET_SNAIL = "trumpet_snail",
  ANCIENT_TROLL_HEART = "ancient_troll_heart",
  TOMATO_SEED = "tomato_seed",
  TEMPLE_DOOR = "temple_door",
  TEMPLE_ENTRANCE = "temple_entrance",
  TORCH1 = "torch1",
  TUNIC = "tunic",
  WOOL_CLOAK = "wool_cloak",
  SPIKE_TRAP1 = "spike_trap1",
  TREE1 = "tree1",
  TREE2 = "tree2",
  TREE4 = "tree4",
  TREE5 = "tree5",
  TREE6 = "tree6",
  TREE7 = "tree7",
  TREE8 = "tree8",
  TREE9 = "tree9",
  TREE10 = "tree10",
  TREE11 = "tree11",
  TREE12 = "tree12",
  TREE13 = "tree13",
  TREE14 = "tree14",
  TREE15 = "tree15",
  TREE16 = "tree16",
  TREE17 = "tree17",
  TREE18 = "tree18",
  DEAD_TREE1 = "dead_tree1",
  DEAD_TREE2 = "dead_tree2",
  SPELL_PAGE_SHARD = "spell_page_shard",
  SPELL_PAGE_SLASH = "spell_page_slash",
  SPELL_PAGE_ILLUMINATE = "spell_page_illuminate",
  SPELL_PAGE_HURT_SHADOWS = "spell_page_hurt_shadows",
  SPELL_PAGE_METEOR_SHOWER = "spell_page_meteor_shower",
  SPELL_PAGE_LIGHTNING_STRIKE = "spell_page_lightning_strike",
  SPELL_PAGE_DRAGON_FORM = "spell_page_dragon_form",
  SPELL_PAGE_BITE = "spell_page_bite",
  SPELL_PAGE_REVIVE = "spell_page_revive",
  SPELL_PAGE_CATCH_SOUL = "spell_page_catch_soul",
  SPELL_PAGE_GAIN_MOMENTUM = "spell_page_gain_momentum",
  SPELL_PAGE_REFLECT_DAMAGE = "spell_page_reflect_damage",
  SPELL_PAGE_HEAL_PARTY = "spell_page_heal_party",
  SPELL_PAGE_SHIELD = "spell_page_shield",
  SPELL_PAGE_GREASE = "spell_page_grease",
  SPELL_PAGE_BLINK = "spell_page_blink",
  SPELL_PAGE_HYPERBEAM = "spell_page_hyperbeam",
  SPELL_PAGE_DARK_WAVE = "spell_page_dark_wave",
  SPELL_PAGE_SUNDER = "spell_page_sunder",
  SPELL_PAGE_DELTA_WAVE = "spell_page_delta_wave",
  SPELL_PAGE_HYPNIC_JERK = "spell_page_hypnic_jerk",
  VIAL = "vial",
  PEOPLE = "people",
  PLUME = "plume",
  POTION1 = "potion1",
  POTION2 = "potion2",
  POTION3 = "potion3",
  POTION4 = "potion4",
  POTION5 = "potion5",
  POTION6 = "potion6",
  POTION7 = "potion7",
  POTION8 = "potion8",
  POTION9 = "potion9",
  VASES1 = "vases1",
  VASES2 = "vases2",
  VEST = "vest",
  WATERING_CAN = "watering_can",
  SMOKER = "smoker",
  WINTER_COAT = "winter_coat",
  WOOL_SOCK = "wool_sock",
  SOUP_OF_THE_HIKER = "soup_of_the_hiker",
  SMELLING_SALTS = "smelling_salts",
  BACKPACK = "backpack",
  WEAPONRACK1 = "weaponrack1",
  WEAVER = "weaver",
  WELL = "well",
  WHEAT = "wheat",
  WHEAT_PLANT = "wheat_plant",
  WHEAT_SEED = "wheat_seed",
  WINE = "wine",
  MEAD = "mead",
  BRANDY = "brandy",
  WINDMILL = "windmill",
  WOLF1 = "wolf1",
  WOLF2 = "wolf2",
  WOLF3 = "wolf3",
  WOLF_FANG = "wolf_fang",
  WOLF_PELT = "wolf_pelt",
  WANDERERS_CLOTH = "wanderers_cloth",
  WANDERERS_GIFT = "wanderers_gift",
  WOOD = "wood",
  VILLAGE_PORTAL = "village_portal",
  VILLAIN = "villain",
}

export enum FishName {
  CARP = "carp",
  PERCH = "perch",
  PIKE = "pike",
  CAVEFISH = "cavefish",
  TENCH = "tench",
}
