import { useEffect, useRef, useState, type ReactNode } from "react";
import EventBus from "../game/EventBus";
import {
  EntityName,
  Event,
  type Icon as IconType,
  type Notice,
  NoticeKind,
  Warning,
} from "@server/types";
import { configs } from "@server/configs";
import { TOAST_FADE, TOAST_HOLD, TOAST_MAX } from "@server/globals";
import { Icon } from "./Icon";

interface Row {
  id: number;
  key: string;
  notice: Notice;
  count: number;
  leaving: boolean;
}

const WARNINGS: Record<Warning, string> = {
  [Warning.INVENTORY_FULL]: "Inventory full",
};

function mergeKey(notice: Notice): string | null {
  switch (notice.kind) {
    case NoticeKind.ITEM:
      return `item:${notice.name}:${notice.soul ?? ""}:${notice.from ?? ""}`;
    case NoticeKind.TAKEN:
      return `taken:${notice.name}`;
    case NoticeKind.LEDGER:
      return NoticeKind.LEDGER;
    default:
      return null;
  }
}

function amount(notice: Notice): number {
  switch (notice.kind) {
    case NoticeKind.ITEM:
    case NoticeKind.TAKEN:
      return notice.quantity;
    case NoticeKind.LEDGER:
      return notice.total;
    default:
      return 0;
  }
}

const label = (name: EntityName) =>
  configs.entities[name]?.metadata?.displayName ?? name;

const speaker = (name: EntityName) => {
  const metadata = configs.entities[name]?.metadata;
  return metadata?.name ?? metadata?.displayName ?? name;
};

const Count = ({ value, prefix }: { value: number; prefix: string }) => (
  <span
    key={value}
    className="inline-block tabular-nums animate-[toast-bump_0.25s_ease]"
  >
    {prefix}
    {value}
  </span>
);

const Dot = ({ color }: { color: string }) => (
  <span className={`size-2.5 rounded-full ${color}`} />
);

const Dim = ({ children }: { children: ReactNode }) => (
  <span className="text-white/60">{children}</span>
);

function content(row: Row): {
  glyph?: ReactNode;
  text: ReactNode;
  accent?: string;
} {
  const { notice, count } = row;
  const glyph = (icon?: IconType) => icon && <Icon icon={icon} zoom={2} />;

  switch (notice.kind) {
    case NoticeKind.ITEM:
      return {
        glyph: glyph(configs.entities[notice.name]?.metadata?.icon),
        text: (
          <>
            {label(notice.name)}
            {count > 1 && (
              <>
                {" "}
                <Count value={count} prefix="×" />
              </>
            )}
            {notice.soul && <Dim> · {label(notice.soul)}</Dim>}
            {notice.from && <Dim> from {speaker(notice.from)}</Dim>}
          </>
        ),
      };

    case NoticeKind.TAKEN:
      return {
        glyph: glyph(configs.entities[notice.name]?.metadata?.icon),
        text: (
          <>
            {label(notice.name)}{" "}
            <span className="text-red-300">
              <Count value={count} prefix="−" />
            </span>
          </>
        ),
      };

    case NoticeKind.LEDGER:
      return {
        text: (
          <>
            <Count value={count} prefix="" /> {count === 1 ? "item" : "items"}{" "}
            entered in the ledger
          </>
        ),
      };

    case NoticeKind.SPELL:
      return {
        glyph: glyph(configs.spells[notice.name]?.metadata?.icon),
        text: (
          <>
            Learned{" "}
            {configs.spells[notice.name]?.metadata?.displayName ?? notice.name}
          </>
        ),
      };

    case NoticeKind.PLAYER:
      return {
        glyph: <Dot color={notice.joined ? "bg-green-400" : "bg-gray-400"} />,
        text: (
          <>
            <Dim>{notice.id.slice(0, 8)}</Dim>{" "}
            {notice.joined ? "joined" : "left"} the world
          </>
        ),
      };

    case NoticeKind.PARTY:
      return {
        glyph: <Dot color="bg-blue-400" />,
        text: (
          <>
            <Dim>{notice.id.slice(0, 8)}</Dim>{" "}
            {notice.joined ? "joined" : "left"} your party
          </>
        ),
      };

    case NoticeKind.TIER:
      return {
        text: `The village reached tier ${notice.tier}`,
        accent: "h-13 text-lg shadow-[inset_3px_0_0_var(--color-yellow-400)]",
      };

    case NoticeKind.IMPROVEMENT:
      return {
        text: `${configs.improvements[notice.name].displayName} built`,
        accent: "h-13 text-lg shadow-[inset_3px_0_0_var(--color-yellow-400)]",
      };

    case NoticeKind.WARN:
      return {
        text: WARNINGS[notice.warning],
        accent: "shadow-[inset_3px_0_0_var(--color-amber-500)]",
      };
  }
}

export function Toasts() {
  const [rows, setRows] = useState<Row[]>([]);
  const live = useRef<Row[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const seq = useRef(0);

  useEffect(() => {
    const commit = () => setRows([...live.current]);

    const hold = (id: number) => {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => leave(id), TOAST_HOLD),
      );
    };

    const leave = (id: number) => {
      const row = live.current.find((entry) => entry.id === id);
      if (!row || row.leaving) return;

      row.leaving = true;
      commit();

      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          live.current = live.current.filter((entry) => entry.id !== id);
          commit();
        }, TOAST_FADE),
      );
    };

    const push = (notice: Notice) => {
      const key = mergeKey(notice);
      const match =
        key !== null &&
        live.current.find((entry) => entry.key === key && !entry.leaving);

      if (match) {
        live.current = live.current.map((entry) =>
          entry === match
            ? { ...entry, count: entry.count + amount(notice) }
            : entry,
        );
        hold(match.id);
        commit();
        return;
      }

      const id = ++seq.current;
      live.current = [
        ...live.current,
        { id, key: key ?? `${id}`, notice, count: amount(notice), leaving: false },
      ];
      hold(id);

      const shown = live.current.filter((entry) => !entry.leaving);
      if (shown.length > TOAST_MAX) leave(shown[0].id);

      commit();
    };

    EventBus.on(Event.NOTIFY, push);

    return () => {
      EventBus.off(Event.NOTIFY, push);
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };
  }, []);

  if (!rows.length) return null;

  return (
    <ul className="flex flex-col items-start gap-1.5 pointer-events-none select-none">
      {rows.map((row) => {
        const { glyph, text, accent } = content(row);

        return (
          <li
            key={row.id}
            className={`flex items-center gap-2.5 h-11 pl-2 pr-3.5 rounded-lg bg-black/40 text-base text-white whitespace-nowrap animate-[toast-in_0.3s_ease-out] transition-opacity duration-300 ${
              row.leaving ? "opacity-0" : ""
            } ${accent ?? ""}`}
          >
            {glyph ? (
              <span className="flex size-8 items-center justify-center">
                {glyph}
              </span>
            ) : (
              <span className="w-1.5" />
            )}
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
