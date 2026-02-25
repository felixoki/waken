import { Party } from "../types";

export class PartyStore {
  private parties: Map<string, Party> = new Map();

  add(id: string, party: Party) {
    this.parties.set(id, party);
  }

  get(id: string): Party | undefined {
    return this.parties.get(id);
  }

  remove(id: string) {
    this.parties.delete(id);
  }

  get all(): Party[] {
    return [...this.parties.values()];
  }

  getByPlayerId(id: string): Party | undefined {
    return this.all.find((p) => p.members.includes(id));
  }
}
