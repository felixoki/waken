import { MapName } from "../types/index.js";
import { Zone } from "../types/zones.js";

export class ZoneManager {
  private zones: Zone[] = [];

  add(zone: Zone): void {
    this.zones.push(zone);
  }

  at(map: MapName, x: number, y: number, now: number): Zone[] {
    const active: Zone[] = [];
    const remaining: Zone[] = [];

    for (const zone of this.zones) {
      if (zone.expiresAt <= now) continue;
      remaining.push(zone);

      if (zone.map !== map) continue;

      const dx = zone.x - x;
      const dy = zone.y - y;
      if (dx * dx + dy * dy <= zone.radius * zone.radius) active.push(zone);
    }

    this.zones = remaining;
    return active;
  }
}
