/**
 * Централізований сервіс логування
 */
export const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error);
    }
    // В продакшні можна інтегрувати з Sentry, LogRocket тощо
  },

  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
};

