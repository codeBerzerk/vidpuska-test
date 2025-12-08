import type { SearchError } from '../types/api';
import { logger } from './logger';

/**
 * Обробка API відповіді з уніфікованою обробкою помилок
 */
export async function handleApiResponse<T>(
  response: Response,
  defaultErrorMessage: string
): Promise<T> {
  if (!response.ok) {
    try {
      const error: SearchError = await response.json();
      throw new Error(error.message || defaultErrorMessage);
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(defaultErrorMessage);
    }
  }

  try {
    return await response.json();
  } catch (err) {
    logger.error('Помилка парсингу JSON відповіді', err);
    throw new Error('Помилка обробки відповіді сервера');
  }
}

/**
 * Перевірка, чи є помилка типу SearchError
 */
export function isSearchError(error: unknown): error is SearchError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'error' in error &&
    'message' in error
  );
}

