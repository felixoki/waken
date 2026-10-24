import { configs } from "../server/src/configs";
import { MapLoader } from "../server/src/loaders/Map";
import {
  Condition,
  Dialogue,
  DialogueChoice,
  DialogueNode,
  DialogueReference,
  MapName,
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

const choicesOf = (dialogue: Dialogue): DialogueChoice[] => [
  ...nodesOf(dialogue)
    .flatMap((node) => node.choices ?? [])
    .filter(
      (choice): choice is DialogueChoice =>
        !("ref" in (choice as DialogueReference)),
    ),
  ...Object.values(dialogue)
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .flatMap((entry) => ("ref" in entry ? (entry.individual ?? []) : [])),
];

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

  for (const choice of choicesOf(dialogue)) {
    reads(choice.when);

    if (choice.next && !dialogue[choice.next])
      problems.push(`${name}: choice points to missing node "${choice.next}"`);
  }

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
