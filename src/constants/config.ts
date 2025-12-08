/**
 * Конфігурація для пошуку турів
 */
export const SEARCH_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
  POLLING_INTERVAL_MS: 100,
} as const;

/**
 * Конфігурація UI
 */
export const UI_CONFIG = {
  TOUR_CARD_MIN_WIDTH: 250,
  TOURS_CONTAINER_WIDTH: 700,
  TOURS_CONTAINER_PADDING: 25,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

