export enum Event {
  /** World */
  WORLD_TIME = "world_time",
  WORLD_PHASE = "world_phase",

  /** Player */
  PLAYER_CREATE = "player_create",
  PLAYER_CREATE_LOCAL = "player_create_local",
  PLAYER_CREATE_OTHERS = "player_create_others",
  PLAYER_INPUT = "player_input",
  PLAYER_LEAVE = "player_leave",
  PLAYER_TRANSITION = "player_transition",
  PLAYER_SPECTATE = "player_spectate",
  PLAYER_AUTHORITY = "player_authority",
  PLAYER_HURT = "player_hurt",
  PLAYER_DEATH = "player_death",
  PLAYER_REVIVE = "player_revive",
  PLAYER_REVIVE_REQUEST = "player_revive_request",
  PLAYER_SPECTATE_REQUEST = "player_spectate_request",
  PLAYER_HEALTH = "player_health",
  PLAYER_MANA = "player_mana",
  PLAYER_INVENTORY_WIPE = "player_inventory_wipe",

  /** Entity */
  ENTITY_CREATE = "entity_create",
  ENTITY_CREATE_ALL = "entity_create_all",
  ENTITY_DESTROY = "entity_destroy",
  ENTITY_DESPAWN = "entity_despawn",
  ENTITY_INPUT = "entity_input",
  ENTITY_PICKUP = "entity_pickup",
  ENTITY_HURT = "entity_hurt",
  ENTITY_SPOTTED_PLAYER = "entity_spotted_player",
  ENTITY_FLEE = "entity_flee",
  ENTITY_FELL = "entity_fell",
  ENTITY_DIALOGUE_ITERATE = "entity_dialogue_iterate",
  ENTITY_DIALOGUE_RESPONSE = "entity_dialogue_response",
  ENTITY_DIALOGUE_START = "entity_dialogue_start",
  ENTITY_DIALOGUE_END = "entity_dialogue_end",
  ENTITY_DIALOGUE_CHOICE = "entity_dialogue_choice",
  ENTITY_LOCK = "entity_lock",
  ENTITY_UNLOCK = "entity_unlock",
  ENTITY_PLANT = "entity_plant",
  ENTITY_HARVEST = "entity_harvest",
  ENTITY_OVERLAP = "entity_overlap",

  /** Item */
  ITEM_COLLECT = "item_collect",
  ITEM_REMOVE = "item_remove",

  /** Inventory & Hotbar */
  INVENTORY_UPDATE = "inventory_update",
  HOTBAR_UPDATE = "hotbar_update",
  SEEDS_SELECT = "seeds_select",

  /** Economy */
  ECONOMY_UPDATE = "economy_update",

  /** Entities (UI) */
  ENTITIES_UPDATE = "entities_update",

  /** Chunk */
  CHUNK_DEACTIVATE = "chunk_deactivate",

  /** Party */
  PARTY_CREATE = "party_create",
  PARTY_CREATE_REQUEST = "party_create_request",
  PARTY_JOIN = "party_join",
  PARTY_JOIN_REQUEST = "party_join_request",
  PARTY_LEAVE = "party_leave",
  PARTY_LEAVE_REQUEST = "party_leave_request",
  PARTY_UPDATE = "party_update",
  PARTY_START = "party_start",
  PARTY_START_REQUEST = "party_start_request",
  PARTY_START_LOADING = "party_start_loading",
  PARTY_START_READY = "party_start_ready",
  PARTY_LIST = "party_list",
  PARTY_WIPE = "party_wipe",

  /** Combat */
  HIT = "hit",

  /** Camera */
  CAMERA_FOLLOW = "camera_follow",

  /** Spells */
  SPELL_LEARN = "spell_learn",
  SPELL_LEARN_CONFIRM = "spell_learn_confirm",
  SPELLS_SYNC = "spells_sync",
  SPELL_EQUIP = "spell_equip",

  /** Storage */
  INVENTORY_SYNC = "inventory:sync",
  STORAGE_OPEN = "storage:open",
  STORAGE_CLOSE = "storage:close",
  STORAGE_DEPOSIT = "storage:deposit",
  STORAGE_WITHDRAW = "storage:withdraw",
  STORAGE_SYNC = "storage:sync",
  STORAGE_UPDATE = "storage:update",

  /** UI */
  UI_TOGGLE = "ui_toggle",

  /** Transitions */
  TRANSITION_START = "transition_start",
  TRANSITION_LOAD = "transition_load",
  TRANSITION_END = "transition_end",
}
