import { animals } from "./animals";
import { buildings } from "./buildings";
import { creatures } from "./creatures";
import { crops } from "./crops";
import { equipment } from "./equipment";
import { flora } from "./flora";
import { food } from "./food";
import { ingredients } from "./ingredients";
import { interior } from "./interior";
import { people } from "./people";
import { resources } from "./resources";
import { rocks } from "./rocks";
import { spellPages } from "./spellpages";
import { transitions } from "./transitions";
import { villain } from "./villain";

export const entities = {
  ...animals,
  ...buildings,
  ...creatures,
  ...crops,
  ...equipment,
  ...flora,
  ...food,
  ...ingredients,
  ...people,
  ...resources,
  ...rocks,
  ...spellPages,
  ...transitions,
  ...interior,
  ...villain,
};
