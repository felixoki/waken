import { useEffect, useState } from "react";
import { Event, Party, PartyStatus } from "@server/types";
import EventBus from "../game/EventBus";

export function useParty() {
  const [party, setParty] = useState<Party | null>(null);
  const [inRealm, setInRealm] = useState(false);

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
      [Event.PARTY_START_READY, () => setInRealm(true)],
      [Event.PARTY_WIPE, () => setInRealm(false)],
    ] as const;

    for (const [event, handler] of events) EventBus.on(event, handler);

    return () => {
      for (const [event, handler] of events) EventBus.off(event, handler);
    };
  }, []);

  return { party, inRealm };
}
