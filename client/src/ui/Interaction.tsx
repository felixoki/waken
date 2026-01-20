import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Item } from "@server/types";
import { definitions } from "@server/configs/definitions";

interface Interaction {
  id: string;
  collects?: Item[];
}

export const Interaction = () => {
  const [data, setData] = useState<Interaction | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const give = (item: Item) => {
    const items = data?.collects?.filter((i) => i.name !== item.name) || [];
    setData({ ...data!, collects: items });
    EventBus.emit("item:collect", item);
  };

  useEffect(() => {
    const handler = (data: Interaction) => {
      setData(data);
      setIsOpen(true);
    };

    EventBus.on("interaction:start", handler);

    return () => {
      EventBus.off("interaction:start", handler);
    };
  }, []);

  if (!isOpen || !data?.id) return null;

  return (
    <div>
      <h3 className="text-white mb-3">Interaction: {data.id}</h3>
      {data.collects && (
        <div>
          <h4 className="text-white mb-3">Collects:</h4>
          <ul className="flex flex-wrap gap-1">
            {data.collects.map((item, i) => (
              <li key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-center border border-slate-500 rounded-lg text-xs text-white w-16 aspect-square">
                  {item?.quantity}{" "}
                  {definitions[item?.name]?.metadata?.displayName}
                </div>
                <button
                  className="p-0.5 bg-blue-500 text-white rounded"
                  onClick={() => give(item)}
                >
                  Give
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
