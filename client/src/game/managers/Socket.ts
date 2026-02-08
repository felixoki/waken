import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "@server/globals";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private gameId: string | null = null;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) SocketManager.instance = new SocketManager();

    return SocketManager.instance;
  }
  
  init(): Socket {
    if (this.socket && this.isConnected) return this.socket;

    this.socket = io(SERVER_URL);

    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    return this.socket;
  }

  getGameId(): string | null {
    return this.gameId;
  }

  setGameId(id: string): void {
    this.gameId = id;
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
      return;
    }

    this.socket?.off(event);
  }

  emit(event: string, ...args: any[]): void {
    this.socket?.emit(event, ...args);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default SocketManager.getInstance();
