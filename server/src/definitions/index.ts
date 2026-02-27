import { animals } from "./animals";
import { buildings } from "./buildings";
import { creatures } from "./creatures";
import { flora } from "./flora";
import { ingredients } from "./ingredients";
import { people } from "./people";
import { rocks } from "./rocks";
import { transitions } from "./transitions";

export const definitions = {
  ...animals,
  ...buildings,
  ...creatures,
  ...flora,
  ...ingredients,
  ...people,
  ...rocks,
  ...transitions,
};
