import { configs } from "../server/src/configs";
import { MapLoader } from "../server/src/loaders/Map";
import {
  AWAY,
  ChoiceId,
  ComponentName,
  Condition,
  Dialogue,
  DialogueChoice,
  DialogueText,
  DialogueEffectName,
  DialogueNode,
  DialogueReference,
  EntityDefinition,
  MapName,
  Mood,
  NodeId,
  SpotName,
  StoryEffectName,
  StoryFlag,
} from "../server/src/types";

const problems: string[] = [];
const read = new Set<StoryFlag>();
const written = new Set<StoryFlag>();

const reads = (when: Condition | undefined) => {
  for (const flag of [
    ...(when?.flags ?? []),
    ...(when?.unflags ?? []),
    ...(when?.fresh ?? []),
    ...(when?.within ? [when.within.flag] : []),
  ])
    read.add(flag);
};

const resolve = (entry: DialogueNode | DialogueReference): DialogueNode[] =>
  "ref" in entry ? (configs.dialogue.nodes[entry.ref] ?? []) : [entry];

const nodesOf = (dialogue: Dialogue): DialogueNode[] =>
  Object.values(dialogue).flatMap((entry) =>
    Array.isArray(entry) ? entry.flatMap(resolve) : resolve(entry),
  );

const own = (node: DialogueNode): DialogueChoice[] =>
  (node.choices ?? []).filter(
    (choice): choice is DialogueChoice => !("ref" in choice),
  );

const choicesOf = (definition: EntityDefinition): DialogueChoice[] => [
  ...nodesOf(definition.dialogue ?? {}).flatMap(own),
  ...(definition.topics ?? []),
];

const label = (text: DialogueChoice["text"]): string =>
  typeof text === "string" ? text : JSON.stringify(text);

const fields = (when: Condition | undefined) =>
  Object.keys(when ?? {}) as (keyof Condition)[];

const merge = (...whens: (Condition | undefined)[]): Condition => {
  const known: Condition = {};

  for (const when of whens)
    for (const key of fields(when)) {
      const value = when![key];
      const current = known[key];

      if (Array.isArray(value))
        (known as Record<string, unknown>)[key] = [
          ...((current as unknown[]) ?? []),
          ...value,
        ];
      else if (value && typeof value === "object" && !("flag" in value))
        (known as Record<string, unknown>)[key] = {
          ...((current as object) ?? {}),
          ...value,
        };
      else (known as Record<string, unknown>)[key] = value;
    }

  return known;
};

const atLeast = (
  need: Partial<Record<string, number>> | undefined,
  have: Partial<Record<string, number>> | undefined,
) =>
  Object.entries(need ?? {}).every(
    ([key, min]) => (have?.[key] ?? -Infinity) >= (min ?? 0),
  );

const within = (need: string[] | undefined, have: string[] | undefined) =>
  (need ?? []).every((entry) => have?.includes(entry));

const implied = (when: Condition | undefined, known: Condition): boolean =>
  fields(when).every((key) => {
    const need = when![key];

    switch (key) {
      case "tier":
        return (known.tier ?? -Infinity) >= (need as number);
      case "flags":
      case "unflags":
      case "carrying":
      case "fresh":
      case "followed":
        return within(need as string[], known[key] as string[]);
      case "carryingAny":
        return (
          (known.carrying ?? []).some((name) => (need as string[]).includes(name)) ||
          (!!known.carryingAny &&
            known.carryingAny.every((name) => (need as string[]).includes(name)))
        );
      case "facts":
      case "bond":
      case "record":
      case "stock":
      case "present":
        return atLeast(
          need as Record<string, number>,
          known[key] as Record<string, number>,
        );
      case "within":
        return (
          known.within?.flag === when!.within!.flag &&
          known.within.days <= when!.within!.days
        );
      case "at":
        return Object.entries(need as object).every(
          ([name, spot]) =>
            (known.at as Record<string, string> | undefined)?.[name] === spot,
        );
      default:
        return known[key] === need;
    }
  });

const lands = (
  target: Dialogue[string],
  known: Condition,
): boolean =>
  (Array.isArray(target) ? target : [target]).some(
    (entry) => "ref" in entry || implied(entry.when, known),
  );

const setBy = (node: DialogueNode | undefined): StoryFlag[] =>
  (node?.story ?? []).flatMap((effect) =>
    effect.name === StoryEffectName.FLAG_SET ? [effect.flag] : [],
  );

const after = (node: DialogueNode | undefined, choice: DialogueChoice) => {
  const set = setBy(node);
  const known = merge(node?.when, choice.when, { flags: set });
  known.unflags = known.unflags?.filter((flag) => !set.includes(flag));
  return known;
};

const SERVICES = new Set<DialogueEffectName>([
  DialogueEffectName.ITEM_HAND_OVER,
  DialogueEffectName.IMPROVEMENTS_OPEN,
  DialogueEffectName.FISH_WEIGH,
]);

const ERRANDS = new Set<StoryEffectName>([
  StoryEffectName.ERRAND_START,
  StoryEffectName.ERRAND_FINISH,
]);

const serves = (definition: EntityDefinition): boolean =>
  definition.components.some(
    (component) => component.name === ComponentName.CRAFTER,
  ) ||
  choicesOf(definition).some((choice) =>
    choice.effects?.some((effect) => SERVICES.has(effect.name)),
  ) ||
  nodesOf(definition.dialogue ?? {}).some((node) =>
    node.story?.some((effect) => ERRANDS.has(effect.name)),
  );

const MOODS = Object.values(Mood);

const moods = (text: DialogueText): Mood[] =>
  typeof text === "string" || Array.isArray(text)
    ? MOODS
    : (Object.keys(text) as Mood[]);

const keyed = (text: DialogueText) =>
  typeof text !== "string" && !Array.isArray(text);

const parting = (node: DialogueNode): boolean =>
  (node.choices ?? []).some(
    (choice) => "ref" in choice && choice.ref === ChoiceId.GOODBYE,
  );

for (const [name, definition] of Object.entries(configs.entities)) {
  const dialogue = definition.dialogue;
  if (!dialogue) continue;

  const greeting = dialogue[NodeId.GREETING];

  if (!greeting) problems.push(`${name}: no greeting`);
  else if (
    (Array.isArray(greeting) ? greeting : [greeting]).every(
      (entry) => !("ref" in entry) && entry.when,
    )
  )
    problems.push(`${name}: every greeting has a condition, so it can fall silent`);

  for (const choice of choicesOf(definition)) {
    reads(choice.when);

    if (choice.next && !dialogue[choice.next])
      problems.push(`${name}: choice points to missing node "${choice.next}"`);
  }

  const topics = definition.topics ?? [];
  const asked = new Set(topics.map((topic) => label(topic.text)));

  for (const topic of topics)
    if (topic.next && dialogue[topic.next] && !lands(dialogue[topic.next], merge(topic.when)))
      problems.push(
        `${name}: topic "${label(topic.text)}" can lead to "${topic.next}" when none of its lines apply`,
      );

  for (const [id, entry] of Object.entries(dialogue)) {
    const lines = (Array.isArray(entry) ? entry : [entry]).filter(
      (line): line is DialogueNode => !("ref" in line),
    );
    const owners = new Map<string, number>();

    for (const line of lines) {
      for (const choice of own(line)) {
        const text = label(choice.text);
        owners.set(text, (owners.get(text) ?? 0) + 1);

        if (asked.has(text))
          problems.push(`${name}: "${text}" is both a reply in [${id}] and a topic`);

        if (Array.isArray(line.text) && line.text.length > 1 && choice.next)
          problems.push(
            `${name}: reply "${text}" in [${id}] follows a line picked at random from ${line.text.length}; it can only answer one of them`,
          );

        if (choice.next && keyed(line.text) && !keyed(choice.text))
          problems.push(
            `${name}: reply "${text}" in [${id}] follows a line that changes with mood, so it needs a reply per mood`,
          );

        if (choice.next && dialogue[choice.next]) {
          const offered = moods(choice.text).filter((mood) =>
            moods(line.text).includes(mood),
          );
          const targets = (
            Array.isArray(dialogue[choice.next])
              ? dialogue[choice.next]
              : [dialogue[choice.next]]
          ) as (DialogueNode | DialogueReference)[];

          for (const target of targets) {
            if ("ref" in target) continue;
            const missing = offered.filter(
              (mood) => !moods(target.text).includes(mood),
            );
            if (missing.length)
              problems.push(
                `${name}: reply "${text}" in [${id}] is offered when ${missing.join(", ")} but "${choice.next}" has no text for it`,
              );
          }
        }

        if (choice.next && dialogue[choice.next] && !lands(dialogue[choice.next], after(line, choice)))
          problems.push(
            `${name}: reply "${text}" in [${id}] can lead to "${choice.next}" when none of its lines apply`,
          );
      }

      if (id === NodeId.GREETING && topics.length && line.topics !== false && !parting(line))
        problems.push(
          `${name}: a greeting without goodbye is a forced choice, but topics would be added to it`,
        );
    }

    for (const [text, count] of owners)
      if (count > 1)
        problems.push(
          `${name}: reply "${text}" is shared by ${count} lines in [${id}]; a reply answers one line, make it a topic`,
        );
  }

  if (serves(definition) && configs.schedules[name as keyof typeof configs.schedules]?.some((rule) => rule.target === AWAY))
    problems.push(`${name}: offers a service but its schedule sends it away`);

  for (const node of nodesOf(dialogue)) {
    reads(node.when);

    for (const effect of node.story ?? [])
      if (effect.name === StoryEffectName.FLAG_SET) written.add(effect.flag);
  }
}

const SET_BY_CODE = new Set<StoryFlag>([
  StoryFlag.ED_TAR_KNOWN,
  StoryFlag.GRANDMOTHER_FREED,
  StoryFlag.GRANDMOTHER_SEEN,
  StoryFlag.SOULS_CAUGHT,
]);

for (const flag of read)
  if (!written.has(flag) && !SET_BY_CODE.has(flag))
    problems.push(`flag "${flag}" is read but never set`);

for (const flag of written)
  if (!read.has(flag)) problems.push(`flag "${flag}" is set but never read`);

const loader = new MapLoader();
const placed = new Set<SpotName>(
  Object.entries(configs.maps)
    .filter(([, map]) => !map.isInstanced)
    .flatMap(([name, map]) =>
      loader.parseSpots(name as MapName, loader.load(map.json)),
    )
    .map(([spot]) => spot),
);

for (const [name, rules] of Object.entries(configs.schedules))
  for (const { target } of rules ?? [])
    if (Object.values(SpotName).includes(target as SpotName) && !placed.has(target as SpotName))
      problems.push(`${name}: spot "${target}" is not placed in any map`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log("✓ Story verified");
