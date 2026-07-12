import {
  ChoiceId,
  DialogueChoice,
  DialogueEffectName,
  DialogueNode,
  Mood,
  NodeId,
} from "../types";

export const COMMON_CHOICES: Record<string, DialogueChoice | DialogueChoice[]> =
  {
    [ChoiceId.GOODBYE]: [
      {
        text: "Goodbye",
        effects: [{ name: DialogueEffectName.CONVERSATION_END }],
      },
    ],
  };

export const COMMON_NODES: Record<string, DialogueNode[]> = {
  [NodeId.GREETING]: [
    {
      text: {
        [Mood.HUNGRY]: [
          "Hello... *looks tired*",
          "Oh, hello there...",
          "*sighs*",
        ],
        [Mood.COLD]: [
          "H-hello... *shivering*",
          "Oh, hello... can't seem to get warm.",
          "*rubs hands together* Cold one today.",
        ],
        [Mood.THIRSTY]: [
          "Hello... *licks dry lips*",
          "Oh... hello. Throat's like sand.",
          "Good day... I could murder a drink.",
        ],
        [Mood.HAPPY]: ["Hello there!", "Greetings, friend!", "Good day!"],
      },
      choices: [{ ref: ChoiceId.GOODBYE }],
    },
  ],
};
