export interface Waypoint {
  x: number;
  y: number;
}

export interface Scan {
  last: number;
  interval: number;
}

export interface Idle {
  time: number;
  duration: number;
}

export interface Stuck {
  lastPosition: Waypoint;
  lastCheck: number;
  interval: number;
}