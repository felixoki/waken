import { useEffect, useRef } from "react";
import { configs } from "@server/configs";
import { AmbienceName } from "@server/types";

const FADE_IN = 4;
const FADE_OUT = 1;
const GAIN = 2;

type Ambience = {
  context: AudioContext;
  gain: GainNode;
  target: number;
  started: boolean;
};

const ramp = (ambience: Ambience, volume: number, duration: number) => {
  const { context, gain } = ambience;
  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(volume, now + duration);
};

export function useMenuAmbience(stopping: boolean) {
  const ref = useRef<Ambience | null>(null);
  const stoppingRef = useRef(stopping);
  stoppingRef.current = stopping;

  useEffect(() => {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);

    const stored = JSON.parse(localStorage.getItem("volume") ?? "{}");
    const ambience: Ambience = {
      context,
      gain,
      target: Math.min(
        1,
        configs.sounds.ambience[AmbienceName.RAIN].volume *
          (stored.ambience ?? 0.5) *
          GAIN,
      ),
      started: false,
    };
    ref.current = ambience;

    let source: AudioBufferSourceNode | null = null;
    let closed = false;

    const fadeIn = () => {
      if (closed) return;
      ambience.started = true;
      if (!stoppingRef.current) ramp(ambience, ambience.target, FADE_IN);
    };

    const unlock = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      context.resume().then(fadeIn);
    };

    fetch("./assets/sounds/ambience/rain.ogg")
      .then((response) => response.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (closed) return;
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();

        if (context.state === "running") return fadeIn();
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
      })
      .catch(() => {});

    return () => {
      closed = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      source?.stop();
      context.close();
      ref.current = null;
    };
  }, []);

  useEffect(() => {
    const ambience = ref.current;
    if (!ambience?.started) return;
    if (stopping) ramp(ambience, 0, FADE_OUT);
    else ramp(ambience, ambience.target, FADE_IN);
  }, [stopping]);
}
