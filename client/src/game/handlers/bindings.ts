import Phaser from "phaser";

export enum Binding {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  RUN = "run",
  JUMP = "jump",
  ROLL = "roll",
  PREV = "prev",
  NEXT = "next",
  INVENTORY = "inventory",
}

export type Bindings = Record<Binding, number>;

const KEY = "bindings";
const codes = Phaser.Input.Keyboard.KeyCodes;

const DEFAULTS: Bindings = {
  [Binding.UP]: codes.W,
  [Binding.DOWN]: codes.S,
  [Binding.LEFT]: codes.A,
  [Binding.RIGHT]: codes.D,
  [Binding.RUN]: codes.SHIFT,
  [Binding.JUMP]: codes.SPACE,
  [Binding.ROLL]: codes.C,
  [Binding.PREV]: codes.Q,
  [Binding.NEXT]: codes.E,
  [Binding.INVENTORY]: codes.TAB,
};

const DIGITS = [
  "ZERO",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
];

const SPECIAL: Record<string, string> = {
  UP: "↑",
  DOWN: "↓",
  LEFT: "←",
  RIGHT: "→",
  CTRL: "Ctrl",
  ALT: "Alt",
  BACKTICK: "`",
  MINUS: "-",
  PLUS: "=",
  COMMA: ",",
  PERIOD: ".",
  FORWARD_SLASH: "/",
  BACK_SLASH: "\\",
  OPEN_BRACKET: "[",
  CLOSED_BRACKET: "]",
  SEMICOLON: ";",
  QUOTES: "'",
};

const format = (name: string): string => {
  const digit = DIGITS.indexOf(name);
  if (digit >= 0) return String(digit);
  if (name.startsWith("NUMPAD_") && DIGITS.includes(name.slice(7)))
    return `Num ${DIGITS.indexOf(name.slice(7))}`;
  if (SPECIAL[name]) return SPECIAL[name];
  if (name.length === 1) return name;

  return name
    .split("_")
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(" ");
};

const LABELS = new Map<number, string>();
for (const [name, code] of Object.entries(codes))
  if (!LABELS.has(code)) LABELS.set(code, format(name));

export const bindings = {
  defaults(): Bindings {
    return { ...DEFAULTS };
  },

  bindable(code: number): boolean {
    return code !== codes.ESC && LABELS.has(code);
  },

  label(code: number): string {
    return LABELS.get(code) ?? "?";
  },

  load(): Bindings {
    const result = bindings.defaults();

    try {
      const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (!stored || typeof stored !== "object") return result;

      for (const binding of Object.values(Binding)) {
        const code: unknown = (stored as Record<string, unknown>)[binding];
        if (typeof code === "number" && bindings.bindable(code))
          result[binding] = code;
      }
    } catch {
      return result;
    }

    return result;
  },

  save(next: Bindings): void {
    localStorage.setItem(KEY, JSON.stringify(next));
  },

  assign(current: Bindings, binding: Binding, code: number): Bindings {
    const next = { ...current };
    const taken = Object.values(Binding).find(
      (other) => other !== binding && next[other] === code,
    );

    if (taken) next[taken] = next[binding];
    next[binding] = code;

    return next;
  },
};
