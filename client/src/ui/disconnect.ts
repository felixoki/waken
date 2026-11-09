const KEY = "waken:disconnect";

const hint = sessionStorage.getItem(KEY) ?? "";
sessionStorage.removeItem(KEY);

export const disconnect = {
  hint,

  leave(reason: string): void {
    sessionStorage.setItem(KEY, reason);
    window.location.reload();
  },
};
