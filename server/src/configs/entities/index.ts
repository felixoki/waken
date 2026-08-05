import { animals } from "./animals";
import { buildings } from "./buildings";
import { creatures } from "./creatures";
import { crops } from "./crops";
import { equipment } from "./equipment";
import { fish } from "./fish";
import { flora } from "./flora";
import { food } from "./food";
import { ingredients } from "./ingredients";
import { interior } from "./interior";
import { people } from "./people";
import { resources } from "./resources";
import { rocks } from "./rocks";
import { spawners } from "./spawners";
import { spellPages } from "./spellpages";
import { transitions } from "./transitions";
import { villain } from "./villain";
import { zones } from "./zones";

export const entities = {
  ...animals,
  ...buildings,
  ...creatures,
  ...crops,
  ...equipment,
  ...fish,
  ...flora,
  ...food,
  ...ingredients,
  ...people,
  ...resources,
  ...rocks,
  ...spawners,
  ...spellPages,
  ...transitions,
  ...interior,
  ...villain,
  ...zones,
};
