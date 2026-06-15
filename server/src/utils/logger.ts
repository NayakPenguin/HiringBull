type Logger = {
  (...args: unknown[]): void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export const log: Logger = Object.assign(
  (...args: unknown[]) => {
    console.log("[HiringBull]", ...args);
  },
  {
    info: (...args: unknown[]) => {
      console.log("[HiringBull]", ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn("[HiringBull]", ...args);
    },
    error: (...args: unknown[]) => {
      console.error("[HiringBull]", ...args);
    },
  }
);