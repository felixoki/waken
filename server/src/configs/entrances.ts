import { EntityName } from "../types";
import { EntranceDef, FacadeCell } from "../types/generation";

const D = "dungeon_walls_floor";
const X = "dungeon_decorative_cracks_floor";
const C = "cave_walls_floor";

const DUNGEON_FACADE: readonly (readonly FacadeCell[])[] = [
  [
    [X, 33],
    [X, 3],
    [X, 2],
    [X, 3],
    [D, 121],
    [X, 30],
  ],
  [
    [X, 10],
    [D, 138],
    [D, 138],
    [D, 138],
    [D, 246],
    [X, 15],
  ],
  [
    [X, 8],
    [D, 245],
    [D, 138],
    [D, 138],
    [D, 138],
    [X, 12],
  ],
  [
    [X, 41],
    [X, 4],
    [D, 180],
    [D, 181],
    [X, 5],
    [X, 47],
  ],
  [
    [D, 171],
    [D, 172],
    [D, 197],
    [D, 198],
    [D, 172],
    [D, 173],
  ],
  [null, null, [D, 214], [D, 215], null, null],
];

const CAVE_FACADE: readonly (readonly FacadeCell[])[] = [
  [null, [C, 63], [C, 64], [C, 505], [C, 506], [C, 66], [C, 67], null],
  [
    [C, 63],
    [C, 507],
    [C, 508],
    [C, 567],
    [C, 568],
    [C, 149],
    [C, 504],
    [C, 67],
  ],
  [
    [C, 125],
    [C, 147],
    [C, 68],
    [C, 68],
    [C, 68],
    [C, 68],
    [C, 149],
    [C, 129],
  ],
  [
    [C, 187],
    [C, 188],
    [C, 189],
    [C, 189],
    [C, 189],
    [C, 189],
    [C, 190],
    [C, 191],
  ],
  [
    [C, 249],
    [C, 250],
    [C, 251],
    [C, 251],
    [C, 251],
    [C, 251],
    [C, 252],
    [C, 253],
  ],
  [
    [C, 311],
    [C, 312],
    [C, 313],
    [C, 313],
    [C, 313],
    [C, 313],
    [C, 314],
    [C, 315],
  ],
  [
    [C, 373],
    [C, 374],
    [C, 375],
    [C, 375],
    [C, 375],
    [C, 375],
    [C, 376],
    [C, 377],
  ],
  [
    [C, 435],
    [C, 436],
    [C, 437],
    [C, 437],
    [C, 437],
    [C, 437],
    [C, 438],
    [C, 439],
  ],
];

export const DUNGEON_ENTRANCE_DEF: EntranceDef = {
  facade: DUNGEON_FACADE,
  door: { col: 2, row: 1 },
  entity: EntityName.DUNGEON_ENTRANCE,
  guards: EntityName.ORC1,
  count: 1,
  spacing: 20,
};

export const CAVE_ENTRANCE_DEF: EntranceDef = {
  facade: CAVE_FACADE,
  door: { col: 4, row: 6 },
  entity: EntityName.CAVE_ENTRANCE,
  count: 3,
  spacing: 20,
};

export const entrances = [DUNGEON_ENTRANCE_DEF, CAVE_ENTRANCE_DEF];
