import { useEffect, useRef } from "react";

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose]);

  if (!actions.length) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg py-2 px-2 shadow-lg"
      style={{ left: x, top: y }}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          disabled={action.disabled}
          title={action.title}
          className={`block w-full text-left px-4 py-2 text-sm capitalize rounded ${
            action.disabled
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
