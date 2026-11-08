import { EntityName, MapName, TimePhase } from "./types/index.js";

/** Server */
export const HEARTBEAT_INTERVAL = 30_000;
export const WORLD_INACTIVITY_TIMEOUT = 5 * 60 * 1000;
export const MAX_WORLDS = 16;

/** World */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 352;

/** Chunks */
export const TILE_SIZE = 16;
export const CHUNK_PIXEL_SIZE = 16 * TILE_SIZE;
export const CHUNK_ACTIVATION_RADIUS = 2;
export const CHUNK_ACTIVATION_BUDGET = 2;

/** Building */
export const BUILD_MAPS = new Set<MapName>([MapName.HOME, MapName.VILLAGE]);

/** Movement */
export const SPEED_WALKING = 80;
export const SPEED_RUNNING = 120;
export const SPEED_FLYING = 150;
export const SPEED_JUMPING = 100;
export const SPEED_ROLLING = 120;
export const SPEED_DASHING = 1200;
export const SPEED_SWIMMING = 55;
export const SPEED_DEFAULT = 1;

export const HEIGHT_JUMPING = 40;
export const HEIGHT_FLYING = 32;

/** Time */
export const DAY = 30 * 60 * 1000;
export const TICK_RATE = 1000 / 60;
export const INTERPOLATION_SPEED = 10;

export const AUTOSAVE_INTERVAL = 30 * 1000;
export const RESTORE_RETRIES = 3;

export const PHASE_TRANSITION_DURATION = 20000;
export const PHASE_STARTS = [
  { phase: TimePhase.DAWN, start: 0 },
  { phase: TimePhase.DAY, start: 0.1 },
  { phase: TimePhase.DUSK, start: 0.5 },
  { phase: TimePhase.NIGHT, start: 0.6 },
];

/** Weather */
export const WEATHER_MIN_DURATION = 3 * 60 * 1000;
export const WEATHER_MAX_DURATION = 8 * 60 * 1000;
export const WEATHER_RAIN_CHANCE = 0.2;
export const WEATHER_CLEAR_CHANCE = 0.2;
export const WEATHER_STORM_CHANCE = 0.2;

/** Lightning */
export const STRIKE_MIN_INTERVAL = 5_000;
export const STRIKE_MAX_INTERVAL = 20_000;
export const STRIKE_DISTANCE_BIAS = 0.5;
export const STRIKE_FLASH_COLOR: [number, number, number] = [0.88, 0.92, 1.0];
export const STRIKE_FLASH_STRENGTH = 0.7;
export const STRIKE_FLASH_IN = 40;
export const STRIKE_FLASH_OUT = 240;
export const STRIKE_FLICKER_CHANCE = 0.45;
export const STRIKE_THUNDER_DELAY = 3600;
export const STRIKE_THUNDER_VOLUME = 0.8;
export const STRIKE_THUNDER_RATE_NEAR = 0.6;
export const STRIKE_THUNDER_RATE_FAR = 0.3;
export const STRIKE_SHAKE_RANGE = 0.35;
export const STRIKE_SHAKE_DURATION = 420;
export const STRIKE_SHAKE_INTENSITY = 0.0009;

/** Wind */
export const WIND_AMPLITUDE = 1.2;
export const WIND_SPEED = 0.0015;
export const WIND_CLOUDY = 1.3;
export const WIND_RAIN = 2.2;
export const WIND_STORM = 3.6;
export const WIND_GUST = 0.45;

/** Rain */
export const RAIN_DENSITY = 0.1;
export const RAIN_RUSH = 0.3;
export const WET_INTERVAL = 2_000;
export const WET_DURATION = 30_000;
export const WADE_INTERVAL = 250;

/** Wetness */
export const WETNESS_SOAK_DURATION = 75_000;
export const WETNESS_DRY_DURATION = 45_000;
export const WETNESS_RAIN = 0.8;
export const WETNESS_STORM = 1.0;

/** Snow */
export const SNOW_CLOUDY = 0.5;
export const SNOW_RAIN = 1;
export const SNOW_STORM = 1.6;
export const SNOW_DENSITY = 0.5;
export const SNOW_SPEED = 1;
export const SNOW_SCALE = 1;
export const SNOW_DRIFT = 1;
export const SNOW_COOLNESS = 0.2;
export const SNOW_COLOR: [number, number, number] = [1.0, 1.0, 1.0];

/** Surfaces */
export const SURFACE_OFFSET = 8;
export const TREAD_FEET = 4;
export const PATH_WIDTH = 9;
export const PATH_JITTER = 2.2;
export const PATH_SPILL = 0.22;
export const PATH_ALPHA = 0.8;
export const PATH_FLOOR = 0xb7cbd0;
export const PATH_SHADE = 0x9db3ba;
export const PATH_WALL = 0x8ba1ab;
export const PATH_RIM = 0xd6e4e7;
export const PATH_FADE_INTERVAL = 400;
export const PATH_FADE_ALPHA = 0.02;
export const PATH_TEXTURE = "path";
export const PATH_BRUSHES = 8;
export const PATH_CLUMPS = 4;
export const PATH_CELL = PATH_WIDTH + 6;

/** Kicked snow */
export const KICK_SPACING = 9;
export const KICK_COUNT = 2;
export const KICK_SPEED = 34;
export const KICK_LIFT = 26;
export const KICK_SPREAD = 0.8;
export const KICK_LIFESPAN = 420;
export const KICK_GRAVITY = 260;
export const KICK_DEPTH = 999;

/** Climate */
export const CLIMATE_RADIUS = 4;
export const CLIMATE_EASE = 1_800;
export const FROST_ON = 0.6;
export const FROST_OFF = 0.4;
export const FROST_EASE = 600;

/** Cold */
export const COLD_INTERVAL = 1_000;
export const COLD_DURATION = 5_000;

/** Wet sheen on entities */
export const SHEEN_GAMMA = 1.15;
export const SHEEN_SATURATE = 1.2;
export const SHEEN_STRENGTH = 0.3;
export const SHEEN_SCALE = 2.6;
export const SHEEN_SPEED = 0.45;
export const SHEEN_STEPS = 3;
export const SHEEN_FADE = 0.22;
export const SHEEN_FACING = 0.25;
export const SHEEN_RELIEF = 0.04;
export const SHEEN_CREST = 0.7;
export const SHEEN_SOAK_DURATION = 8_000;
export const SHEEN_DRY_DURATION = 6_000;
export const SHEEN_DEPTH_BIAS = 0.01;
export const SHEEN_RISE_DURATION = 1_200;
export const SHEEN_SHALLOW = 0.35;

/** Status overlay */
export const STATUS_PAD = 8;
export const STATUS_FADE_IN = 300;
export const STATUS_FADE_OUT = 600;
export const STATUS_DEPTH_BIAS = 0.015;
export const STATUS_TRAIL_EASE = 150;

/** Blaze */
export const BLAZE_PAD = 6;
export const BLAZE_REACH = 6;
export const BLAZE_SPEED = 9;
export const BLAZE_SCALE = 0.42;
export const BLAZE_STRETCH = 0.24;
export const BLAZE_THRESHOLDS = [0.44, 0.56, 0.68, 0.82];
export const BLAZE_BODY = 0.1;
export const BLAZE_GLOW = 0.14;
export const BLAZE_SOLID = 0.6;
export const BLAZE_SIDE = 0.7;
export const BLAZE_INTENSITY = 1.1;
export const BLAZE_COLORS = [0x7a1f12, 0xd2481c, 0xf59a2a, 0xffe08a];
export const BLAZE_IGNITE_DURATION = 350;
export const BLAZE_DOUSE_DURATION = 600;
export const BLAZE_DEPTH_BIAS = 0.02;
export const BLAZE_EMBER_COLORS = [0xffe08a, 0xf59a2a, 0xd2481c];
export const BLAZE_STEAM_PUFF = 6;
export const BLAZE_STEAM_INTERVAL = 380;
export const BLAZE_STEAM_LIFESPAN = 1400;
export const BLAZE_STEAM_ALPHA = 0.75;
export const BLAZE_STEAM_COLORS = [0xf4f7fb, 0xe2e9f2, 0xcfd9e6];

/** Water */
export const WATER_PIXELIZATION = 16;
export const WATER_SHORE = 0.33;
export const WATER_LAND = 0.5;
export const WATER_FALLOFF = 6;
export const WATER_GRADIENT = [
  { at: 0.094, color: 0x4d64aa },
  { at: 0.25, color: 0x5472bc },
  { at: 0.391, color: 0x5b84cc },
];
export const WATER_WADE = 3;
export const WATER_CAUSTIC_TEXTURE = "water_caustics";
export const WATER_CAUSTIC_SCALE = 0.08;
export const WATER_CAUSTIC_MOVEMENT_SCALE = 1.63;
export const WATER_CAUSTIC_MOVEMENT_AMOUNT = 0.018;
export const WATER_CAUSTIC_SPEED = 0.8;
export const WATER_CAUSTIC_SQUASH = 1.3;
export const WATER_CAUSTIC_FADER_MULTIPLIER = 0.05;
export const WATER_CAUSTIC_FADER_SCALE = 0.17;
export const WATER_CAUSTIC_COLOR = 0x6ea3df;
export const WATER_CAUSTIC_ALPHA = 0.06;
export const WATER_HIGHLIGHT_COLOR = 0x8ad1f7;
export const WATER_HIGHLIGHT_ALPHA = 0.45;
export const WATER_SPECULAR_THRESHOLD = -0.79;
export const WATER_SPECULAR_SPEED = 0.3;
export const WATER_SPECULAR_SCALE = 0.83;
export const WATER_SPECULAR_SCALE2 = 3.68;
export const WATER_SPECULAR_COLOR = 0x8ad1f7;
export const WATER_SPECULAR_ALPHA = 1;
export const WATER_FOAM_SCALE = 0.16;
export const WATER_FOAM_COLOR = 0x56cddc;
export const WATER_FOAM_ALPHA = 1;
export const WATER_FLOW_LENGTH = 40;
export const WATER_FLOW_RIDGE = 10;
export const WATER_FLOW_NARROW = 7;
export const WATER_FLOW_WIDE = 10;
export const WATER_FLOW_BLUR = 2;
export const WATER_FLOW_PASSES = 3;
export const WATER_FLOW_SPEED = 0.3;
export const WATER_FLOW_CYCLE = 2.4;
export const WATER_LAKES = 3;
export const WATER_LAKE_RADIUS = [14, 22];
export const WATER_RIVERS = 2;
export const WATER_RIVER_WIDTH = [4, 11];
export const WATER_RIVER_GROW = 50;
export const WATER_RIVER_SLOPE = 1.5;
export const WATER_BEACH_RING = [2, 5];
export const WATER_CREEK_MIN = 8;
export const WATER_CREEK_REEDS = 150;
export const WATER_BED_REACH = 4;
export const MARSH_WATER = 0.75;
export const MARSH_LENGTH = [5, 22];
export const MARSH_RADIUS = [3.4, 4.2];
export const MARSH_SPACING = 2;
export const MARSH_BEND = 1.6;
export const MARSH_PACE = 3;
export const MARSH_ATTEMPTS = 40000;
export const MARSH_OPEN = 2.5;
export const MARSH_GAP = 7;
export const MARSH_LINKS = 0.75;
export const MARSH_NECK = 1.1;
export const MARSH_LEAST_LAND = 12;
export const MARSH_EDGE = [4, 14];
export const MARSH_HUMMOCKS = 3;
export const MARSH_HUMMOCK_RADIUS = [8, 10];
export const MARSH_RING = [0, 1];
export const MARSH_RIVER_REACH = 24;
export const MARSH_HERONS = [2, 4];
export const GRADE_EDGE = [6, 14];
export const WATER_PALETTES = {
  lake: {
    gradient: WATER_GRADIENT,
    caustic: [WATER_CAUSTIC_COLOR, WATER_CAUSTIC_ALPHA],
    highlight: [WATER_HIGHLIGHT_COLOR, WATER_HIGHLIGHT_ALPHA],
    specular: [WATER_SPECULAR_COLOR, WATER_SPECULAR_ALPHA],
    foam: [WATER_FOAM_COLOR, WATER_FOAM_ALPHA],
  },
  isles: {
    gradient: [
      { at: 0.094, color: 0x4491ab },
      { at: 0.25, color: 0x4aa3b9 },
      { at: 0.391, color: 0x4fb1c4 },
    ],
    caustic: [0x53bfcf, 0.06],
    highlight: [0x57dfe7, 0.4],
    specular: [0x57dfe7, 1],
    foam: [0x53bfcf, 1],
  },
  cave: {
    gradient: [
      { at: 0.094, color: 0x161c1d },
      { at: 0.25, color: 0x1f2a2a },
      { at: 0.391, color: 0x2b3a39 },
    ],
    caustic: [0x3a4b4a, 0.05],
    highlight: [0x5d7471, 0.3],
    specular: [0x6f8b87, 0.7],
    foam: [0x4a5e5c, 0.8],
  },
};
export type WaterPalette = keyof typeof WATER_PALETTES;

/** Meadows */
export const MEADOW_PALETTES = {
  grass: {
    fill: 0x7aad55,
    accents: [0xbad362, 0x5b9252],
    pattern: "grass_pattern",
  },
  isles: {
    fill: 0x60aaa2,
    accents: [0x62c5a4, 0x4f8688],
    pattern: "isles_pattern",
  },
};
export type MeadowPalette = keyof typeof MEADOW_PALETTES;
export const MEADOW_SPACING = 4;
export const MEADOW_ACCENTS = [0.006, 0.005];
export const MEADOW_FRAMERATE = 5;
export const MEADOW_WIND = [0.6, 0.8];
export const MEADOW_WIND_SCALE = 0.02;
export const MEADOW_WIND_SPEED = 6;
export const MEADOW_LEAN = 2.5;
export const MEADOW_SWAY = 0.6;
export const MEADOW_SWAY_SPEED = 0.15;
export const MEADOW_CHARACTERS = 8;
export const MEADOW_BAKE_RATE = 20;
export const MEADOW_BAKE_MARGIN = 24;
export const MEADOW_PUSH_RADIUS = 10;
export const MEADOW_PUSH = 3.5;
export const MEADOW_PUSH_SQUASH = 0.55;
export const MEADOW_BENT = 0.5;
export const MEADOW_BENT_SHADE = 0.93;
export const MEADOW_GRADES = {
  swamp: { saturation: 0.62, tint: [1.1, 1.0, 0.7], brightness: 0.92 },
};
export type MeadowGrade = keyof typeof MEADOW_GRADES;
export const WATER_GRADES: Record<MeadowGrade, (typeof MEADOW_GRADES)[MeadowGrade]> = {
  swamp: { saturation: 0.55, tint: [1.15, 1.0, 0.62], brightness: 0.72 },
};
export const MEADOW_GRADE_BLUR = 3;
export const FOG_GRADES: MeadowGrade[] = ["swamp"];
export const FOG_ALPHA = 0.22;
export const FOG_COLOR = 0xe0e8dc;
export const FOG_SCALE = [0.01, 0.026];
export const FOG_DRIFT = [4, 1.2];
export const FOG_EDGE = [0.5, 0.78];
export const FOG_DEPTH = 900;
export const MEADOW_GRADE_PASSES = 3;

/** Pit glow */
export const GLOW_TINT = [0.32, 0.75, 1.0];
export const GLOW_ROCK = [45, 42, 58];
export const GLOW_HOT = 0x4ac7f2;
export const GLOW_LIGHT = 2.6;
export const GLOW_CURVE = 1.5;
export const GLOW_EMIT = 0.35;
export const GLOW_FACE = 21;
export const GLOW_GAP = 8;
export const GLOW_BLUR = 3;
export const GLOW_STRENGTH = 0.8;
export const GLOW_DRIFT = 0.08;
export const GLOW_BREATH = 0.1;
export const GLOW_BREATH_PERIOD = 4;
export const GLOW_DRIFT_SCALE = 1 / 40;
export const GLOW_DRIFT_SPEED = 0.18;

/** Beaches */
export const BEACH_REACH = 3;
export const BEACH_INSET = 0.9;
export const BEACH_RESOLUTION = 4;
export const BEACH_BLUR = 3;
export const BEACH_EDGE = 0.5;
export const BEACH_BANDS = [0.03, 0.08];
export const BEACH_BAND_ALPHAS = [0.65, 0.85];
export const BEACH_BAND_NOISE = 0.015;
export const BEACH_SHALLOW_COLOR = 0x7fc3cf;
export const BEACH_NOISE = 0.008;
export const BEACH_NOISE_SCALE = 0.7;
export const BEACH_PERIOD = 4;
export const BEACH_RUN = 0.04;
export const BEACH_FOAM = 0.02;
export const BEACH_FOAM_COLOR = 0xe6f4f6;
export const BEACH_FOAM_ALPHA = 0.6;
export const BEACH_FOAM_BREAK = 0.45;
export const BEACH_FOAM_SCALE = 2.4;
export const BEACH_WET_COLOR = 0x3b2f22;
export const BEACH_WET_ALPHA = 0.1;

/** Water wakes */
export const WAKE_POINTS = 32;
export const WAKE_SPACING = 2;
export const WAKE_LENGTH = 56;
export const WAKE_RETRACT = 70;
export const WAKE_STILL = 12;
export const WAKE_WIDTH = 12;
export const WAKE_SPREAD = 0.22;
export const WAKE_RING = 0.8;
export const WAKE_RIPPLES = 2;
export const WAKE_RIPPLE_PERIOD = 1.6;
export const WAKE_RIPPLE_REACH = 1.4;
export const WAKE_TAIL = 0.35;
export const WAKE_ENTRY = 1;
export const WAKE_PHASE = 26;
export const WAKE_SKEW = 5;
export const WAKE_SPEED = 10;
export const WAKE_ALPHA = 0.46;
export const WAKE_FILL = 0.35;
export const WAKE_RIPPLE = 0.12;
export const WAKE_LEVELS = 3;
export const WAKE_CUTOFF = 0.3;
export const WAKE_COLOR = 0xffffff;

/** Wading */
export const SINK_START = 0.5;
export const SINK_RATIO = 0.2;
export const SINK_MAX = 6;
export const SINK_EASE = 6;
export const SINK_BOB = 1;
export const SINK_BOB_SPEED = 2.5;
export const SINK_BAND = 2;
export const SINK_BAND_ALPHA = 0.4;
export const SINK_TINT = 0.35;
export const WATERFALL_LIP = 6;
export const WATERFALL_BASE = 10;
export const WATERFALL_EDGE = 4;
export const WATERFALL_DEPTH = 999;
export const WATERFALL_MIST_PAD = 20;
export const WATERFALL_BARE_GROUND = 0x967e5d;
export const WATERFALL_MIST_BELOW = 12;
export const WATERFALL_MIST_ALPHA = 0.3;
export const WATERFALL_WAVES = 3;
export const WATERFALL_WAVE_PERIOD = 3.2;
export const WATERFALL_WAVE_REACH = 0.7;
export const WATERFALL_WAVE_SQUASH = 0.35;
export const WATERFALL_WAVE_WIDTH = 2;
export const WATERFALL_WAVE = 0.45;
export const SKYFALL_BLEND = 9;
export const SKYFALL_SPEED = 1;
export const SKYFALL_CONTRACT = 1.5;
export const SKYFALL_SPREAD = 2.5;
export const SKYFALL_COHESIVE = 0.38;
export const SKYFALL_END = 1.2;
export const SKYFALL_SPRAY_TEXTURE = "skyfall_spray";
export const SKYFALL_SPRAY_TINTS = [0x57dfe7, 0x53bfcf, 0x9dbccf];
export const SKYFALL_SPRAY_ALPHA = 0.7;
export const SKYFALL_SPRAY_GRAVITY = 140;
export const SKYFALL_SPRAY_SIDE = 7;
export const SKYFALL_SPRAY_KICK = 5;
export const SKYFALL_SPRAY_PEEL = 30;
export const SKYFALL_SPRAY_FREQUENCY = 60;
export const SKYFALL_SHIMMER = 0.68;
export const SKYFALL_GLINTS = 0.96;
export const ROOT_RING = 0.5;
export const ROOT_SPREAD = 0.6;
export const ROOT_CURVE = 0.3;
export const ROOT_DEPTH = 0.25;
export const ROOT_DEPTH_MAX = 12;
export const ROOT_WIDTH = 1.5;
export const ROOT_CONTACT = 0.25;
export const ROOT_RIPPLE = 0.5;

/** Swimming */
export const SWIM_DEPTH = 4;
export const SWIM_EXIT = 3.6;
export const SWIM_RATIO = 0.45;
export const SWIM_BOB = 1.5;
export const AMBUSH_SHOW = 28;
export const AMBUSH_HOME_DEPTH = 2;
export const AMBUSH_HOME_SEARCH = 8;
export const AMBUSH_RISE_SPLASH = 1.4;

/** Water splashes */
export const PLUNGE_DURATION = 0.75;
export const PLUNGE_REACH = 2.2;
export const PLUNGE_RINGS = 2;
export const PLUNGE_GAP = 0.18;
export const PLUNGE_LEAP = 0.5;
export const PLUNGE_DROPS = 14;
export const PLUNGE_SPEED = 80;
export const PLUNGE_SPREAD = 36;
export const PLUNGE_GRAVITY = 320;
export const PLUNGE_LARGE = 0.3;
export const PLUNGE_COLORS = [0xffffff, 0xd6f1ff, 0x8ad1f7];

/** Rain splashes */
export const SPLASH_RATE = 26;
export const SPLASH_LIFESPAN = 380;
export const SPLASH_MAX = 8;
export const SPLASH_FLOOR = 0.05;
export const SPLASH_DEPTH = 900;

/** Sky tint */
export const SKY_TINT: [number, number, number] = [0.62, 0.72, 0.95];
export const SKY_TINT_BLEND = 0.6;
export const SKY_TINT_FLOOR = 0.3;

/** Clouds */
export const CLOUD_STRENGTH = 0.4;
export const CLOUD_SCALE = 110;
export const CLOUD_SPEED = 8;
export const CLOUD_ANGLE = 25;
export const CLOUD_COVERAGE = 0.6;
export const CLOUD_SOFTNESS = 0.18;
export const CLOUD_COLOR: [number, number, number] = [0.58, 0.64, 0.78];

/** Rays */
export const RAY_STRENGTH = 0.1;
export const RAY_SCALE = 55;
export const RAY_LENGTH = 14;
export const RAY_RUN = 540;
export const RAY_SPEED = 6;
export const RAY_ANGLE = 115;
export const RAY_COVERAGE = 0.65;
export const RAY_SOFTNESS = 0.22;
export const RAY_CORE = 0.4;
export const RAY_GAP = 0.38;
export const RAY_HAZE = 0.1;

/** Actions */
export const DURATION_JUMPING = 800;
export const DURATION_LIFT = 250;
export const DURATION_ROLLING = 600;
export const ROLL_SWEEP_INTERVAL = 60;
export const DURATION_DASHING = 50;
export const DURATION_SLASHING = 800;
export const DURATION_WARNING = 1333;
export const DURATION_THROWING = 1000;
export const DURATION_FELLING = 600;
export const DURATION_MINING = 600;
export const DURATION_EXTRACTION_BOUNCE = 800;
export const HIVE_HONEY: [number, number] = [2, 3];
export const HIVE_STING = 20;
export const HIVE_SWARM_SIZE = 72;
export const DURATION_RAKING = 600;
export const DURATION_WATERING = 1430;
export const DURATION_CROP_DEHYDRATION = 86_400_000;
export const RANGE_FELLING = 48;
export const RANGE_MINING = 48;
export const RANGE_WATERING = 48;
export const RANGE_PLANTING = 48;
export const RANGE_CAPTURE = 64;
export const EXTRACTION_DAMAGE = 35;
export const EXTRACTION_IMPACT_FRAME = 4;

export const THROW_FRAME = 5;
export const THROW_FRAMES_TOTAL = 10;
export const ROCK_ARC_HEIGHT = 60;
export const ROCK_FLIGHT_DURATION = 500;
export const ROCK_HITBOX_SIZE = 24;
export const ROCK_HITBOX_DURATION = 200;
export const ROCK_MAX_THROW_RANGE = 200;
export const ROCK_INACCURACY_SCALE = 0.1;

export const RANGE_SLASHING = 40;
export const RANGE_INTERACTING = 100;
export const RANGE_HITBOX_DETECTION = 100;

/** Vision */
export const VISION_PROXIMITY = 200;
export const PATH_DEADZONE = 2;
export const FACING_HOLD = 140;
export const SPAWN_JITTER = 0.4;
export const LINE_INTERVAL = 150;
export const PATH_ARRIVAL = 4;
export const PATH_MARGIN = PATH_ARRIVAL;
export const PATH_SNAP = 4;
export const PATH_JUMP_COST = 4;
export const PATH_JUMP_MARGIN = 2;
export const PATH_JUMP_ALIGN = 8;

export const DISTANCE_DASHING = (SPEED_DASHING * DURATION_DASHING) / 1000;

export const DELAY_ATTACK = 150;

export const DURATION_COMBO_LOCK = 400;
export const DURATION_FINISHER_LOCK = 600;
export const DURATION_COMBO_WINDOW = 400;
export const DELAY_FLURRY_WINDOW = 70;

/** Combat */
export const MISS_CHANCE = 0.05;
export const CRIT_CHANCE = 0.05;
export const CRIT_MULTIPLIER = 2;
export const RESISTANCE_MULTIPLIER = 0.5;
export const WEAKNESS_MULTIPLIER = 2;

/** Relics */
export const RELIC_CHANCE = 1;

/** Sleeping */
export const SLEEP_FRAMES = 10;
export const SLEEP_FRAMERATE = 6;
export const SLEEP_RANGE = 48;

/** Fishing */
export const DURATION_FISHING_WAIT_MIN = 3000;
export const DURATION_FISHING_WAIT_MAX = 8000;
export const DURATION_FISHING_WINDOW = 1500;
export const FISHING_ARC_HEIGHT = 48;
export const FISHING_ARC_DURATION = 600;
export const FISHING_CAST_MIN_TILES = 1;
export const FISHING_CAST_MAX_TILES = 6;
export const DURATION_FISHING_CHARGE = 1200;
export const DURATION_FISHING_FLIGHT = 260;
export const DURATION_FISHING_FLIGHT_PER_TILE = 70;
export const FISHING_FLIGHT_ARC_PER_TILE = 6;
export const FISHING_LINE_SAG = 0.18;
export const FISHING_BOBBER_HANG = 5;
export const FISHING_SCAN_STEP = 4;
export const FISHING_MIN_DEPTH = 1.5;
export const FISHING_RIPPLE_RADIUS = 4;
export const FISHING_RIPPLE_POINTS = 14;
export const FISHING_RIPPLE_ALPHA = 0.45;
export const DURATION_FISHING_RIPPLE = 1800;
export const DURATION_FISHING_RIPPLE_BITE = 520;
export const FISHING_SPLASH_FORCE = 0.35;
export const FISHING_DEPTH_LIFT = 16;
export const FISHING_THROW_FRAMES = 8;
export const FISHING_WINDUP_FRAME = 3;
export const FISHING_WINDUP_FRAMERATE = 12;
export const FISHING_RELEASE_FRAME = 5;
export const FISHING_THROW_FRAMERATE = 14;
export const FISHING_LANDING_DISTANCE = 16;

/** Fishing minigame */
export const REEL_METER_START = 40;
export const REEL_METER_FILL = 28;
export const REEL_BAR_ACCEL = 12;
export const REEL_BAR_DRAG = 0.88;
export const REEL_BAR_MAX_SPEED = 1.5;
export const REEL_DART_MULTIPLIER = 1.6;
export const REEL_DART_DURATION = 0.25;
export const REEL_WEIGHT_SPEED = 0.25;
export const REEL_WEIGHT_ERRATIC = 0.6;
export const REEL_WEIGHT_BAR = 0.05;
export const REEL_WEIGHT_DRAIN = 0.2;

/** Sounds */

export const CROSSFADE_DURATION = 1000;
export const MASTER_FADE_OUT = 300;
export const FOOTSTEP_DISTANCE = 30;

export const SFX_FALLOFF_NEAR = 80;
export const SFX_FALLOFF_FAR = 480;
export const SFX_MAX_PAN = 0.6;

/** Stats */
export const MAX_HEALTH = 100;
export const MAX_MANA = 100;
export const REGEN_HEALTH_PER_SECOND = 2;
export const REGEN_MANA_PER_SECOND = 3;
export const REGEN_INTERVAL = 1000;

export const MAX_STACK = 50;
export const STORE_CAPACITY = 50;
export const STORE_CAPACITY_EXPANDED = 150;
export const DROP_LIFETIME = 10 * 60 * 1000;
export const HOTBAR_SIZE = 7;
export const INVENTORY_SIZE = 20;
export const INVENTORY_MAX_SIZE = 30;

/** Directions */
export const DIRECTIONS_CARDINAL = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

export const DIRECTIONS = [
  ...DIRECTIONS_CARDINAL,
  { dx: 1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];

/** Corners */
export const CORNERS: [number, number][][] = [
  [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [-1, 0],
    [0, 1],
    [-1, 1],
  ],
  [
    [1, 0],
    [0, -1],
    [1, -1],
  ],
  [
    [-1, 0],
    [0, -1],
    [-1, -1],
  ],
];

/** Dungeon */
export const DUNGEON_ROOM_ATTEMPTS = 200;
export const DUNGEON_ROOM_PADDING = 4;
export const DUNGEON_ROOM_MIN = 12;
export const DUNGEON_ROOM_MAX = 24;
export const DUNGEON_ROOM_FURNISH_CHANCE = 0.9;
export const DUNGEON_WALL_HEADROOM = 6;
export const DUNGEON_WALL_SPAN = 4;
export const DUNGEON_LOOP_CHANCE = 0.01;
export const DUNGEON_CORRIDOR_WIDE_CHANCE = 0.5;
export const DUNGEON_RECESS_MARGIN = 4;
export const DUNGEON_RECESS_CLUSTERS = 4;
export const DUNGEON_RECESS_RECTS_PER_CLUSTER = 3;
export const DUNGEON_RECESS_MIN_W = 6;
export const DUNGEON_RECESS_MAX_W = 18;
export const DUNGEON_RECESS_MIN_H = 5;
export const DUNGEON_RECESS_MAX_H = 12;
export const DUNGEON_RECESS_GAP = 2;
export const DUNGEON_RECESS_MIN_DIM = 7;
export const DUNGEON_TORCH_STRIDE = 16;
export const DUNGEON_LADDER_COUNT = 3;
export const DUNGEON_LADDER_TORCH_CLEARANCE = 4;
export const DUNGEON_CANDLE_GAP = 5;
export const DUNGEON_CANDLE_CLEARANCE = 2;
export const DUNGEON_CANDLE_CHANCE = 0.9;
export const TEMPLE_ARCH_GAP = 12;
export const TEMPLE_ROOM_FURNISH_CHANCE = 0.55;
export const ROOM_ENEMY_ATTEMPTS = 8;
export const FLAT_DEPTH = 500;
export const ENTITY_PARTY_RANGE = 160;
export const TEMPLE_ARCH_CHANCE = 0.5;
export const TEMPLE_FLOOR_DETAIL_DENSITY = 0.06;

/** Villain */

export const TRANSFORM_RANGE = 320;
export const DRAGON_FORM_DURATION = 10000;
export const ENCOUNTER_DISTANCE = 72;
export const ENCOUNTER_SPACING = 28;
export const ENCOUNTER_APPROACH = 64;
export const ENCOUNTER_READY_TIMEOUT = 6000;
export const ENCOUNTER_FADE = 400;
export const ENCOUNTER_HOLD = 400;

/** Terraces */

export const CONTOUR_GONE = -2;
export const CONTOUR_REACH = 2;
export const LEDGE_CLEARANCE = 20;
export const STAIR_SPACING = 14;
export const PATCH_MIN_SIZE = 14;
export const PATCH_MAX_HOLE = 40;
export const PATCH_GAP = 2;
export const PEAK_CLEARANCE = 3;
export const SEAM_MARGIN = 8;

/** Lights */

export const LIGHT_FLOOR = 0.05;
export const LIGHT_ALPHA = 240;
export const LIGHT_ANGLES = 1024;
export const LIGHT_MARCH = 512;
export const LIGHT_SOFTNESS = 0.06;
export const LIGHT_BIAS = 1.5;
export const LIGHT_FACE = 96;
export const LIGHT_OFFSET = 8;
export const LIGHT_SURFACE = 4;
export const ILLUMINATE_BOOST = 1.6;
export const ILLUMINATE_FADE = 300;

/** Shadows */

export const SHADOW_DEPTH = 999;
export const SHADOW_ALPHA = 0.7;
export const SHADOW_DARKNESS_MIN = 0.05;
export const SHADOW_SCALE = 1.5;
export const SHADOW_WIDTH = 24;
export const SHADOW_SPREAD = 2;
export const SHADOW_LENGTH_MIN = 6;
export const SHADOW_LENGTH_MAX = 40;
export const SHADOW_STRETCH = 0.45;
export const SHADOW_SEGMENTS = 4;
export const SHADOW_LIFT = 0.5;
export const SHADOW_CROUCH = 0.6;
export const SHADOW_EASE = 0.012;
export const SHADOW_HEAD = 10;
export const SHADOW_TAPER = 0.4;
export const SHADOW_AIR_FADE = 0.35;
export const SHADOW_MIN_DISTANCE = 24;
export const SHADOW_FADE_DISTANCE = 16;
export const SHADOW_CULL = 48;

/** Location */

export const LOCATION_MARGIN = 4;
export const LOCATION_HOLD = 2500;

/** Toasts */

export const TOAST_HOLD = 3000;
export const TOAST_FADE = 300;
export const TOAST_MAX = 5;

/** Story */

export const BIG_HAND_IN = 50;
export const BOND_FRIEND = 5;
export const BOND_MAX = 10;
export const LEAN_TAKEN = 3;
export const LEAN_MAX = 7;
export const CULT_MAX = 6;
export const CULT_KNOWN_DAYS = 7;

/** Economy */

export const ECONOMY_GROWTH = 0.25;

/** Schedules */

export const ENTITY_FADE = 600;

/** Valen */
export const VALEN_PERCH = 1;

/** Errands */
export const ERRAND_RARE_CHANCE = 0.1;

/** Animals */
export const FOLLOW_NEAR = 32;
export const FOLLOW_LEASH = 56;
export const FOLLOW_FAR = 96;
export const FOLLOW_REPLAN = 24;
export const MEATS = [
  EntityName.GAME_MEAT,
  EntityName.BEEF,
  EntityName.POULTRY,
  EntityName.PORK,
];
