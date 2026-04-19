import {
  DialogueChoice,
  DialogueEffect,
  DialogueEffectName,
  DialogueResponse,
} from "@server/types/dialogue";
import { Item } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

export const Dialogue = () => {
  const [data, setData] = useState<DialogueResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers: Record<DialogueEffectName, (effect: DialogueEffect) => void> =
    {
      [DialogueEffectName.CONVERSATION_END]: () => {
        if (data?.entityId) EventBus.emit(Event.ENTITY_DIALOGUE_END, data.entityId);
        setIsOpen(false);
        setData(null);
      },
      [DialogueEffectName.ITEM_GIVE]: (effect: DialogueEffect) => {
        if (effect.params) {
          EventBus.emit(Event.ITEM_COLLECT, effect.params as Item);
        }
      },
    };

  const choose = (choice: DialogueChoice) => {
    choice.effects?.forEach((effect) => {
      const handler = handlers[effect.name];
      if (handler) handler(effect);
    });

    if (choice.next) {
      EventBus.emit(Event.ENTITY_DIALOGUE_CHOICE, {
        entityId: data?.entityId,
        nodeId: choice.next,
      });
    }
  };

  useEffect(() => {
    const handler = (response: DialogueResponse) => {
      setData(response);
      setIsOpen(true);
    };

    EventBus.on(Event.ENTITY_DIALOGUE_START, handler);

    return () => {
      EventBus.off(Event.ENTITY_DIALOGUE_START, handler);
    };
  }, []);

  useEffect(() => {
    const handler = (entityId: string) => {
      if (data?.entityId === entityId) {
        setIsOpen(false);
        setData(null);
      }
    };

    EventBus.on(Event.ENTITY_DIALOGUE_END, handler);

    return () => {
      EventBus.off(Event.ENTITY_DIALOGUE_END, handler);
    };
  }, [data]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed bottom-1/5 left-1/2 transform -translate-x-1/2 flex flex-col gap-8 rounded-lg w-175 bg-black/25 p-4">
      <p className="text-white text-lg">{data.text as string}</p>
      <ul className="flex flex-col gap-2">
        {data.choices.map((choice, i) => (
          <li key={i}>
            <button
              className="rounded bg-black/25 px-3 py-2 text-white text-lg hover:bg-black/50"
              onClick={() => choose(choice)}
            >
              {choice.text as string}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
