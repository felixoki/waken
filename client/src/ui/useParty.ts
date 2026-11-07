import { useEffect, useState } from "react";
import { Event, Party, PartyStatus } from "@server/types";
import EventBus from "../game/EventBus";

export function useParty() {
  const [party, setParty] = useState<Party | null>(null);
  const [lobbies, setLobbies] = useState<Party[]>([]);
  const [inRealm, setInRealm] = useState(false);
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    const events = [
      [Event.PARTY_CREATE, (data: Party) => setParty(data)],
      [
        Event.PARTY_UPDATE,
        (data: Party) => {
          setParty(data);
          if (data.status === PartyStatus.LOBBY) setInRealm(false);
        },
      ],
      [
        Event.PARTY_LEAVE,
        () => {
          setParty(null);
          setInRealm(false);
        },
      ],
      [Event.PARTY_LIST, (data: Party[]) => setLobbies(data)],
      [
        Event.PARTY_START_READY,
        () => {
          setInRealm(true);
          setAsleep(false);
        },
      ],
      [Event.PARTY_WIPE, () => setInRealm(false)],
      [Event.PLAYER_SLEEP, () => setAsleep(true)],
      [Event.PLAYER_WAKE, () => setAsleep(false)],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, []);

  return { party, lobbies, inRealm, asleep };
}
