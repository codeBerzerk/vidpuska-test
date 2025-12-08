/**
 * Централізований сервіс логування
 */
export const logger = {
  error: (message: string, error?: unknown) => {
    if (import.meta.env.MODE === 'development') {
      console.error(`[ERROR] ${message}`, error);
    }
    // В продакшні можна інтегрувати з Sentry, LogRocket тощо
  },

  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
};

