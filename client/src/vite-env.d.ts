/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOBBY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dev?: (name: string, ...args: (string | number)[]) => void;
}
