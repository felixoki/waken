import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DevCommand,
  EffectName,
  EntityName,
  Event,
  ImprovementName,
  MapName,
  StoryFlag,
  StoryScope,
  TimePhase,
} from "@server/types";
import EventBus from "../game/EventBus";

type Kind = "cmd" | "out" | "err";

interface Line {
  id: number;
  kind: Kind;
  text: string;
}

const HISTORY_KEY = "waken:console:history";
const HISTORY_MAX = 100;
const LOG_MAX = 500;
const SUGGEST_MAX = 50;

const CLEAR = "clear";
const COMMANDS: readonly string[] = [...Object.values(DevCommand), CLEAR].sort();

const entities = Object.values(EntityName).sort();
const maps = Object.values(MapName).sort();

const ARGS: Record<string, readonly (readonly string[])[]> = {
  [DevCommand.GIVE]: [entities],
  [DevCommand.SPAWN]: [entities],
  [DevCommand.GO]: [maps],
  [DevCommand.RESEED]: [maps],
  [DevCommand.PHASE]: [Object.values(TimePhase)],
  [DevCommand.EFFECT]: [Object.values(EffectName).sort()],
  [DevCommand.IMPROVE]: [Object.values(ImprovementName).sort()],
  [DevCommand.FLAG]: [
    Object.values(StoryFlag).sort(),
    ["set", "clear"],
    Object.values(StoryScope),
  ],
  [DevCommand.HIVE]: [entities.filter((name) => name.includes("tree"))],
  [DevCommand.DISCONNECT]: [["stall"]],
};

function suggest(value: string): string[] {
  const parts = value.trimStart().split(/\s+/);
  const index = parts.length - 1;
  const word = parts[index].toLowerCase();
  const options = index === 0 ? COMMANDS : ARGS[parts[0]]?.[index - 1];
  if (!options || (index === 0 && !word)) return [];

  const starts = options.filter((o) => o.startsWith(word));
  const contains = options.filter((o) => !o.startsWith(word) && o.includes(word));
  const matches = starts.concat(contains).slice(0, SUGGEST_MAX);

  return matches.length === 1 && matches[0] === word ? [] : matches;
}

function load(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function save(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    return;
  }
}

export function Console() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [suggesting, setSuggesting] = useState(false);
  const [selected, setSelected] = useState(0);

  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const history = useRef<string[]>(load());
  const cursor = useRef(history.current.length);
  const draft = useRef("");
  const drag = useRef<{ x: number; y: number } | null>(null);

  const suggestions = useMemo(
    () => (suggesting ? suggest(value) : []),
    [suggesting, value],
  );
  const word = value.trimStart().split(/\s+/).pop()?.toLowerCase() ?? "";

  const push = (kind: Kind, texts: string[]) =>
    setLines((prev) => {
      const next = prev.concat(
        texts.map((text) => ({ id: nextId.current++, kind, text })),
      );
      return next.length > LOG_MAX ? next.slice(next.length - LOG_MAX) : next;
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const caret =
        e.key === "^" ||
        (e.key === "Dead" &&
          (e.code === "Backquote" || e.code === "IntlBackslash"));
      if (!caret) return;
      e.preventDefault();
      setOpen((o) => !o);
    };

    const onOutput = (data: { lines: string[]; error: boolean }) =>
      push(data.error ? "err" : "out", data.lines);

    window.addEventListener("keydown", onKey, true);
    EventBus.on(Event.DEV_OUTPUT, onOutput);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      EventBus.off(Event.DEV_OUTPUT, onOutput);
    };
  }, []);

  useEffect(() => {
    EventBus.emit(Event.DEV_CONSOLE, open);
    if (open) input.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [lines, open]);

  useLayoutEffect(() => {
    const row = list.current?.children[selected] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const change = (next: string) => {
    setValue(next);
    setSelected(0);
    setSuggesting(true);
  };

  const accept = (suggestion: string) => {
    const head = value.trimStart().split(/\s+/).slice(0, -1);
    change([...head, suggestion].join(" ") + " ");
  };

  const recall = (next: string) => {
    setValue(next);
    setSuggesting(false);
  };

  const submit = () => {
    const line = value.trim();
    setValue("");
    setSuggesting(false);
    draft.current = "";
    if (!line) return;

    const h = history.current;
    if (h[h.length - 1] !== line) {
      h.push(line);
      if (h.length > HISTORY_MAX) h.splice(0, h.length - HISTORY_MAX);
      save(h);
    }
    cursor.current = h.length;

    if (line === CLEAR) return setLines([]);

    push("cmd", [line]);
    const [name, ...args] = line.split(/\s+/);
    EventBus.emit(Event.DEV_COMMAND, { name, args });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    const listed = suggestions.length > 0;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        return submit();
      case "Escape":
        e.preventDefault();
        return listed ? setSuggesting(false) : setOpen(false);
      case "Tab":
        e.preventDefault();
        if (listed) accept(suggestions[selected]);
        return;
      case "ArrowUp":
        e.preventDefault();
        if (listed)
          return setSelected((s) => (s - 1 + suggestions.length) % suggestions.length);
        if (cursor.current === h.length) draft.current = value;
        if (cursor.current > 0) recall(h[--cursor.current]);
        return;
      case "ArrowDown":
        e.preventDefault();
        if (listed) return setSelected((s) => (s + 1) % suggestions.length);
        if (cursor.current >= h.length) return;
        cursor.current++;
        recall(cursor.current === h.length ? draft.current : h[cursor.current]);
        return;
    }
  };

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };

  const onDragEnd = () => {
    drag.current = null;
    input.current?.focus();
  };

  if (!open) return null;

  return (
    <div
      className="fixed left-1/2 top-16 z-50 flex h-150 w-260 flex-col rounded-lg border border-white/7 bg-[#0e0f12]/94 font-jetbrains text-[17px] leading-[1.6] shadow-[0_24px_64px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-sm"
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
      onMouseUp={() => {
        if (!window.getSelection()?.toString()) input.current?.focus();
      }}
    >
      <div
        className="flex h-10 shrink-0 cursor-move select-none items-center justify-between border-b border-white/5 px-4 text-[13px] text-white/25"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
      >
        <span>tab complete · ↑↓ history · ^ close</span>
        <button
          className="cursor-pointer text-[15px] text-white/30 hover:text-white/60"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      <div ref={log} className="flex-1 overflow-y-auto px-4 py-3 select-text">
        {lines.map((line, i) => (
          <div
            key={line.id}
            className={
              line.kind === "cmd"
                ? `text-white/45 ${i > 0 ? "mt-2" : ""}`
                : line.kind === "err"
                  ? "whitespace-pre-wrap text-[#e07a72]"
                  : "whitespace-pre-wrap text-[#ebedf0]/88"
            }
          >
            {line.kind === "cmd" && <span className="text-white/25">› </span>}
            {line.text}
          </div>
        ))}
      </div>

      <div className="relative flex h-13 shrink-0 items-center gap-2.5 rounded-b-lg border-t border-white/6 bg-white/2 px-4 text-[#eceef1]">
        <span className="text-[#7aa2f7]">›</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => change(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent caret-[#eceef1] outline-none"
        />

        {suggestions.length > 0 && (
          <div
            ref={list}
            className="absolute left-0 top-full mt-1.5 max-h-90 min-w-100 overflow-y-auto rounded-lg border border-white/7 bg-[#0e0f12]/96 py-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            {suggestions.map((suggestion, i) => {
              const at = word ? suggestion.indexOf(word) : -1;
              return (
                <div
                  key={suggestion}
                  className={`cursor-pointer px-4 py-0.5 ${
                    i === selected ? "bg-white/7 text-white/60" : "text-white/40"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    accept(suggestion);
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  {at < 0 ? (
                    suggestion
                  ) : (
                    <>
                      {suggestion.slice(0, at)}
                      <span className="text-[#eceef1]">
                        {suggestion.slice(at, at + word.length)}
                      </span>
                      {suggestion.slice(at + word.length)}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
