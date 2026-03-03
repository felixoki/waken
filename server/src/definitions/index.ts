import { animals } from "./animals";
import { buildings } from "./buildings";
import { creatures } from "./creatures";
import { flora } from "./flora";
import { ingredients } from "./ingredients";
import { interior } from "./interior";
import { people } from "./people";
import { rocks } from "./rocks";
import { transitions } from "./transitions";

/**
 * should be entities, not definitions
 */
export const definitions = {
  ...animals,
  ...buildings,
  ...creatures,
  ...flora,
  ...ingredients,
  ...people,
  ...rocks,
  ...transitions,
  ...interior,
};
