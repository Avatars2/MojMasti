const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (message, data = null) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, data || '');
    }
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message, data = null) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }
};