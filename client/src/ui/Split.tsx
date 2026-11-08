import { useEffect, useRef, useState } from "react";
import { EntityName, SpellName } from "@server/types";
import { configs } from "@server/configs";
import { Icon } from "./Icon";

interface Props {
  name: EntityName | SpellName;
  total: number;
  x: number;
  y: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function Split({ name, total, x, y, onConfirm, onCancel }: Props) {
  const [amount, setAmount] = useState(Math.ceil(total / 2));
  const [typed, setTyped] = useState("");
  const range = useRef<HTMLInputElement>(null);

  useEffect(() => range.current?.focus(), []);

  const metadata =
    configs.entities[name as EntityName]?.metadata ??
    configs.spells[name as SpellName]?.metadata;

  const clamp = (value: number) => Math.min(total, Math.max(1, value));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onConfirm(amount);
    else if (e.key === "Escape") onCancel();
    else if (/^[0-9]$/.test(e.key)) {
      const next = typed + e.key;
      setTyped(next);
      setAmount(clamp(Number(next)));
    } else if (e.key === "Backspace") {
      const next = typed.slice(0, -1);
      setTyped(next);
      if (next) setAmount(clamp(Number(next)));
    } else return;

    e.preventDefault();
  };

  return (
    <div
      className="fixed z-50 w-62 rounded-lg bg-[#111114]/92 p-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      style={{ left: x, top: y }}
      onKeyDown={onKeyDown}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        {metadata?.icon && <Icon icon={metadata.icon} zoom={2} />}
        <span>{metadata?.displayName ?? name}</span>
        <span className="ml-auto tabular-nums">
          {amount} <span className="text-white/60">/ {total}</span>
        </span>
      </div>
      <input
        ref={range}
        type="range"
        min={1}
        max={total}
        value={amount}
        onChange={(e) => {
          setTyped("");
          setAmount(Number(e.target.value));
        }}
        className="w-full accent-blue-600"
      />
      <div className="mt-2.5 flex gap-1.5">
        <button
          className="flex-1 rounded-md bg-white/10 py-1.5 text-sm hover:bg-white/15"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="flex-1 rounded-md bg-blue-600 py-1.5 text-sm hover:bg-blue-500"
          onClick={() => onConfirm(amount)}
        >
          OK
        </button>
      </div>
    </div>
  );
}
