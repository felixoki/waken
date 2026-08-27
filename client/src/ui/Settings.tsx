import { useEffect, useState } from "react";
import { Event } from "@server/types";
import { ArrowLeft } from "lucide-react";
import EventBus from "../game/EventBus";
import { MenuOverlay } from "./MenuOverlay";

type View = "menu" | "controls" | "credits";

const controls = [
  { action: "Forward", key: "W" },
  { action: "Backward", key: "S" },
  { action: "Left", key: "A" },
  { action: "Right", key: "D" },
  { action: "Run", key: "Shift" },
  { action: "Jump", key: "Space" },
  { action: "Roll", key: "C" },
  { action: "Reel in fish", key: "A / D" },
  { action: "Attack", key: "Left mouse" },
  { action: "Aim", key: "Mouse" },
  { action: "Prev slot", key: "Q" },
  { action: "Next slot", key: "E" },
  { action: "Inventory", key: "Tab" },
  { action: "Menu", key: "Esc" },
];

const credits = [
  {
    title: "Assets by",
    entries: [
      {
        name: "Ngan Nguyen",
        source: "@ngannguyen17 on Fiverr",
        href: "https://www.fiverr.com/ngannguyen17",
      },
      {
        name: "CraftPix.net",
        source: "2D Game Assets Store & Free",
        href: "https://craftpix.net",
      },
    ],
  },
  {
    title: "Music and sound effects by",
    entries: [
      { name: "Discount Dylan" },
      {
        name: "Sweet Village",
        source: "16pixel.itch.io",
        href: "https://16pixel.itch.io",
      },
      {
        name: "JC Sounds – Fantasy SFX Pack Vol 1, Nature Ambient Pack Vol 1",
        source: "JC Sounds, CC BY 4.0",
        href: "https://www.patreon.com/jcsounds",
      },
      {
        name: "Animals Sound Effects Audio Package",
        source: "Aligned Games",
      },
      { name: "RPGSounds", source: "Kenney.nl", href: "https://kenney.nl" },
      {
        name: "Little Robot Sound Factory",
        source: "littlerobotsoundfactory.com",
        href: "https://www.littlerobotsoundfactory.com",
      },
      {
        name: "CelesteVidal",
        source: "freesound.org, freesound_community from Pixabay",
        href: "https://freesound.org/people/CelesteVidal/sounds/501064/",
      },
    ],
  },
];

function Keycap({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-8 px-2.5 h-8 bg-linear-to-b from-neutral-600 to-neutral-700 rounded text-white/80 text-sm font-mono border border-neutral-800 shadow-[0_3px_0_0_#1a1a1a,0_4px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
      {label}
    </kbd>
  );
}

export function Settings() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [view, setView] = useState<View>("menu");

  useEffect(() => {
    const toggle = () => setOpen((prev) => !prev);

    EventBus.on(Event.MENU_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.MENU_TOGGLE, toggle);
    };
  }, []);

  if (!open) return null;

  const close = () => setClosing(true);

  return (
    <MenuOverlay
      closing={closing}
      onClose={close}
      onExited={() => {
        setOpen(false);
        setClosing(false);
        setView("menu");
      }}
    >
      {view !== "menu" && (
        <button
          onClick={() => setView("menu")}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-4 py-2 bg-white/10 rounded-md text-white/60 hover:text-white hover:bg-white/15 transition-colors text-base"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {view === "menu" && (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <button
            onClick={close}
            className="text-white/60 text-xl hover:text-white transition-colors py-2"
          >
            Resume
          </button>
          <button
            disabled
            className="text-white/20 text-xl py-2 cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={() => setView("controls")}
            className="text-white/60 text-xl hover:text-white transition-colors py-2"
          >
            Controls
          </button>
          <button
            disabled
            className="text-white/20 text-xl py-2 cursor-not-allowed"
          >
            Settings
          </button>
          <button
            onClick={() => setView("credits")}
            className="text-white/60 text-xl hover:text-white transition-colors py-2"
          >
            Credits
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-white/60 text-xl hover:text-white transition-colors py-2"
          >
            Quit
          </button>
        </div>
      )}

      {view === "controls" && (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          {controls.map(({ action, key }) => (
            <div
              key={action}
              className="flex items-center justify-between w-72"
            >
              <span className="text-white/50 text-base">{action}</span>
              <Keycap label={key} />
            </div>
          ))}
        </div>
      )}

      {view === "credits" && (
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {credits.map(({ title, entries }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <h2 className="text-white/40 text-base mb-1">{title}</h2>
              {entries.map(({ name, source, href }) => (
                <div key={name} className="text-center">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/60 text-base hover:text-white transition-colors"
                    >
                      {name}
                    </a>
                  ) : (
                    <span className="text-white/60 text-base">{name}</span>
                  )}
                  {source && (
                    <span className="text-white/30 text-sm"> — {source}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </MenuOverlay>
  );
}
