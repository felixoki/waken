export enum PartyStatus {
  LOBBY = "lobby",
  IN_GAME = "in_game",
}

export interface Party {
  id: string;
  leader: string;
  members: string[];
  status: PartyStatus;
}
