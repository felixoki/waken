import {
  DialogueChoice,
  DialogueNode,
  DialogueReference,
  NodeId,
} from "../types";

export const topics = {
  offer: (
    node: DialogueNode,
    nodeId: string,
    asked: DialogueChoice[] = [],
  ): Array<DialogueChoice | DialogueReference> =>
    nodeId === NodeId.GREETING && node.topics !== false
      ? [...(node.choices ?? []), ...asked]
      : (node.choices ?? []),
};
