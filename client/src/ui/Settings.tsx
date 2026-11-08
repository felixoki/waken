import { useEffect, useState } from "react";
import Phaser from "phaser";
import { ChannelName, Event } from "@server/types";
import { ArrowLeft } from "lucide-react";
import EventBus from "../game/EventBus";
import { loadVolume } from "../game/managers/Sound";
import { MenuOverlay } from "./MenuOverlay";
import { Binding, Bindings, bindings } from "../game/handlers/bindings";

type View = "menu" | "controls" | "settings" | "credits";

const rebindable = [
  { action: "Forward", binding: Binding.UP },
  { action: "Backward", binding: Binding.DOWN },
  { action: "Left", binding: Binding.LEFT },
  { action: "Right", binding: Binding.RIGHT },
  { action: "Run", binding: Binding.RUN },
  { action: "Jump", binding: Binding.JUMP },
  { action: "Roll", binding: Binding.ROLL },
  { action: "Prev slot", binding: Binding.PREV },
  { action: "Next slot", binding: Binding.NEXT },
  { action: "Inventory", binding: Binding.INVENTORY },
];

const fixed = (current: Bindings) => [
  {
    action: "Reel in fish",
    key: `${bindings.label(current[Binding.LEFT])} / ${bindings.label(current[Binding.RIGHT])}`,
  },
  { action: "Attack / interact", key: "Left mouse" },
  { action: "Demolish", key: "Right mouse" },
  { action: "Aim", key: "Mouse" },
  { action: "Menu", key: "Esc" },
];

const channels = [
  { channel: ChannelName.MUSIC, label: "Music" },
  { channel: ChannelName.AMBIENCE, label: "Ambience" },
  { channel: ChannelName.SFX, label: "Effects" },
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
    title: "Music by",
    entries: [
      {
        name: "Discount Dylan",
        source: "Spotify",
        href: "https://open.spotify.com/intl-de/artist/0bJC8fwPbZ4C51vXgH6pD5",
      },
      {
        name: "Sweet Village",
        source: "16pixel.itch.io",
        href: "https://16pixel.itch.io",
      },
    ],
  },
  {
    title: "Voices by",
    entries: [
      {
        name: "Sky Rae",
        source: "skyraevoicing.com",
        href: "https://www.skyraevoicing.com/",
      },
    ],
  },
  {
    title: "Sound effects by",
    entries: [
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
      {
        name: "pegonthetrack",
        source: "Universal Sound Effects",
        href: "https://linktr.ee/pegonthetrack",
      },
      {
        name: "ELVGames",
        source: "Universal Sound Effects",
        href: "https://linktr.ee/elvgames",
      },
    ],
  },
];

function Keycap({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-8 px-2.5 h-8 bg-linear-to-b from-neutral-600 to-neutral-700 rounded text-sm font-mono border border-neutral-800 shadow-[0_3px_0_0_#1a1a1a,0_4px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] ${dim ? "text-white/40" : "text-white/80"}`}
    >
      {label}
    </kbd>
  );
}

export function Settings() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [volume, setVolume] = useState(loadVolume);
  const [keys, setKeys] = useState(bindings.load);
  const [capturing, setCapturing] = useState<Binding | null>(null);

  const apply = (next: Bindings) => {
    bindings.save(next);
    setKeys(next);
    EventBus.emit(Event.BINDINGS_SET, next);
  };

  useEffect(() => {
    const toggle = () => setOpen((prev) => !prev);

    EventBus.on(Event.MENU_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.MENU_TOGGLE, toggle);
    };
  }, []);

  useEffect(() => {
    if (!capturing) return;

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC)
        return setCapturing(null);
      if (!bindings.bindable(e.keyCode)) return;

      apply(bindings.assign(keys, capturing, e.keyCode));
      setCapturing(null);
    };

    window.addEventListener("keydown", onKey, true);

    return () => window.removeEventListener("keydown", onKey, true);
  }, [capturing, keys]);

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
        setCapturing(null);
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
            onClick={() => setView("settings")}
            className="text-white/60 text-xl hover:text-white transition-colors py-2"
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
          {rebindable.map(({ action, binding }) => (
            <div
              key={action}
              className="flex items-center justify-between w-72"
            >
              <span className="text-white/50 text-base">{action}</span>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  setCapturing(binding);
                }}
              >
                <Keycap
                  label={
                    capturing === binding ? "…" : bindings.label(keys[binding])
                  }
                />
              </button>
            </div>
          ))}
          {fixed(keys).map(({ action, key }) => (
            <div
              key={action}
              className="flex items-center justify-between w-72"
            >
              <span className="text-white/30 text-base">{action}</span>
              <Keycap label={key} dim />
            </div>
          ))}
          <button
            onClick={() => {
              setCapturing(null);
              apply(bindings.defaults());
            }}
            className="mt-4 px-4 py-2 bg-white/10 rounded-md text-white/60 hover:text-white hover:bg-white/15 transition-colors text-base"
          >
            Reset to defaults
          </button>
        </div>
      )}

      {view === "settings" && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          {channels.map(({ channel, label }) => (
            <label
              key={channel}
              className="flex items-center justify-between w-72"
            >
              <span className="text-white/50 text-base">{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume[channel] * 100)}
                onChange={(e) => {
                  const value = Number(e.target.value) / 100;
                  setVolume((prev) => ({ ...prev, [channel]: value }));
                  EventBus.emit(Event.VOLUME_SET, { channel, value });
                }}
                className="w-40 accent-white/60"
              />
            </label>
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
