import { useState, useCallback, useRef, useEffect } from 'react';
import { startTourSearch, fetchSearchPrices, fetchHotelsByCountry, cancelTourSearch } from '../utils/api';
import { fetchCountries } from '../utils/api';
import { logger } from '../utils/logger';
import { isSearchError } from '../utils/api-helpers';
import { SEARCH_CONFIG } from '../constants/config';
import type { Tour, SearchState, Country, Hotel, Price } from '../types/api';

export const useTourSearch = () => {
  const [state, setState] = useState<SearchState>('idle');
  const [tours, setTours] = useState<Tour[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const tokenRef = useRef<string | null>(null);
  const activeTokenRef = useRef<string | null>(null); // Токен поточного активного пошуку
  const countryIDRef = useRef<string | null>(null);
  const hotelsCacheRef = useRef<Record<string, Record<string, Hotel>>>({});
  const countriesCacheRef = useRef<Record<string, Country>>({});
  const isCancellingRef = useRef(false);

  // Очищення таймерів при розмонтуванні
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Завантаження кешу готелів та країн
  useEffect(() => {
    const loadCache = async () => {
      try {
        const countries = await fetchCountries();
        countriesCacheRef.current = countries;
      } catch (err) {
        logger.error('Помилка завантаження кешу країн', err);
      }
    };
    loadCache();
  }, []);

  const stopSearch = useCallback(async () => {
    // Очищаємо таймери
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Скасовуємо пошук на сервері, якщо є активний токен
    const currentToken = tokenRef.current || activeTokenRef.current;
    if (currentToken && !isCancellingRef.current) {
      isCancellingRef.current = true;
      setState('cancelling');
      
      try {
        await cancelTourSearch(currentToken);
      } catch (err) {
        // Ігноруємо помилки скасування (пошук може вже бути завершеним)
        logger.warn('Помилка скасування пошуку', err);
      } finally {
        isCancellingRef.current = false;
      }
    }

    // Очищаємо стан
    setIsSearching(false);
    setState('idle');
    tokenRef.current = null;
    activeTokenRef.current = null;
    countryIDRef.current = null;
    retryCountRef.current = 0;
  }, []);

  const waitUntil = useCallback((waitUntilTime: string, callback: () => void) => {
    const waitUntilTimestamp = new Date(waitUntilTime).getTime();
    const now = Date.now();
    const delay = Math.max(0, waitUntilTimestamp - now);

    setState('waiting');

    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, []);

  const pollSearchResults = useCallback(async (token: string, retryCount: number = 0) => {
    // Перевіряємо, чи це все ще актуальний токен (захист від race conditions)
    if (activeTokenRef.current !== token || isCancellingRef.current) {
      logger.info(`Ігноруємо відповідь для скасованого токену: ${token}`);
      return;
    }

    try {
      setState('polling');
      const response = await fetchSearchPrices(token);

      // Додаткова перевірка після запиту
      if (activeTokenRef.current !== token || isCancellingRef.current) {
        logger.info(`Ігноруємо відповідь для скасованого токену після запиту: ${token}`);
        return;
      }

      // Результати готові
      const prices = Object.values(response.prices);
      
      if (prices.length === 0) {
        setState('empty');
        setTours([]);
        setIsSearching(false);
        return;
      }

      // Завантажуємо готелі для країни, якщо ще не завантажені
      const countryID = countryIDRef.current;
      if (!countryID) {
        throw new Error('Country ID не встановлено');
      }

      let hotels: Record<string, Hotel>;
      if (hotelsCacheRef.current[countryID]) {
        hotels = hotelsCacheRef.current[countryID];
      } else {
        hotels = await fetchHotelsByCountry(countryID);
        hotelsCacheRef.current[countryID] = hotels;
      }
      
      // Перевіряємо, чи є готелі для цієї країни
      if (Object.keys(hotels).length === 0) {
        logger.info(`Для країни ${countryID} не знайдено готелів`);
        setState('empty');
        setTours([]);
        setIsSearching(false);
        return;
      }

      // Формуємо тури, зіставляючи ціни з готелями
      // В API hotelID - це рядок (ключ об'єкта hotels), тому використовуємо прямий доступ
      const toursData = prices
        .map((price: Price) => {
          // hotelID з API - це рядок (ключ об'єкта hotels)
          const hotelIdKey = String(price.hotelID);
          
          // Прямий доступ до об'єкта hotels за ключем (рядок)
          let hotel = hotels[hotelIdKey];
          
          if (!hotel) {
            // Якщо не знайшли за ключем, спробуємо знайти за числовим ID
            const hotelByNumericId = Object.values(hotels).find(
              (h) => String(h.id) === hotelIdKey || Number(h.id) === Number(price.hotelID)
            );
            
            if (!hotelByNumericId) {
              logger.warn(`Готель з hotelID ${price.hotelID} (ключ: ${hotelIdKey}) не знайдено. Доступні ключі:`, Object.keys(hotels));
              return null;
            }
            
            hotel = hotelByNumericId;
          }
          
          // Отримуємо прапорець країни з кешу
          const country = countriesCacheRef.current[hotel.countryId];
          const countryFlag = country?.flag;
          
          return {
            ...price,
            hotel,
            countryFlag: countryFlag || undefined,
          } as Tour;
        })
        .filter((tour): tour is Tour => tour !== null);

      if (toursData.length === 0) {
        setState('empty');
        setTours([]);
        setIsSearching(false);
        return;
      }

      // Фінальна перевірка перед встановленням результатів
      if (activeTokenRef.current !== token || isCancellingRef.current) {
        logger.info(`Ігноруємо результати для скасованого токену: ${token}`);
        return;
      }

      setTours(toursData);
      setState('success');
      setIsSearching(false);
      retryCountRef.current = 0;
    } catch (err) {
      // Перевіряємо, чи це все ще актуальний токен перед обробкою помилок
      if (activeTokenRef.current !== token || isCancellingRef.current) {
        logger.info(`Ігноруємо помилку для скасованого токену: ${token}`);
        return;
      }

      // Перевіряємо, чи це SearchError з кодом 425 (результати ще не готові)
      if (isSearchError(err) && err.code === 425) {
        if (err.waitUntil) {
          waitUntil(err.waitUntil, () => {
            pollSearchResults(token, retryCount);
          });
          return;
        }
      }

      // Якщо помилка і є спроби для ретраю
      if (retryCount < SEARCH_CONFIG.MAX_RETRIES) {
        retryCountRef.current = retryCount + 1;
        setTimeout(() => {
          pollSearchResults(token, retryCount + 1);
        }, SEARCH_CONFIG.RETRY_DELAY_MS);
        return;
      }

      // Всі спроби вичерпані
      const errorMessage = err instanceof Error 
        ? err.message 
        : isSearchError(err)
        ? err.message
        : 'Помилка пошуку турів';
      setError(errorMessage);
      setState('error');
      setIsSearching(false);
      retryCountRef.current = 0;
    }
  }, [waitUntil]);

  const searchTours = useCallback(async (countryID: string) => {
    // Якщо є активний пошук, спочатку скасовуємо його
    const previousToken = tokenRef.current || activeTokenRef.current;
    if (previousToken && isSearching) {
      // Позначаємо попередній пошук як скасовується
      isCancellingRef.current = true;
      setState('cancelling');
      
      try {
        await cancelTourSearch(previousToken);
      } catch (err) {
        // Ігноруємо помилки скасування (пошук може вже бути завершеним)
        logger.warn('Помилка скасування попереднього пошуку', err);
      } finally {
        isCancellingRef.current = false;
      }

      // Очищаємо таймери та стан попереднього пошуку
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      tokenRef.current = null;
      activeTokenRef.current = null;
      retryCountRef.current = 0;
    }

    // Очищаємо попередні результати та помилки
    setError(null);
    setTours([]);
    setIsSearching(true);
    setState('waiting');
    countryIDRef.current = countryID;

    try {
      const { token, waitUntil: waitUntilTime } = await startTourSearch(countryID);
      
      // Встановлюємо новий активний токен
      tokenRef.current = token;
      activeTokenRef.current = token;

      waitUntil(waitUntilTime, () => {
        // Перевіряємо, чи токен все ще актуальний перед запуском polling
        if (activeTokenRef.current === token && !isCancellingRef.current) {
          pollSearchResults(token);
        }
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Помилка запуску пошуку');
      setState('error');
      setIsSearching(false);
      countryIDRef.current = null;
      tokenRef.current = null;
      activeTokenRef.current = null;
    }
  }, [stopSearch, waitUntil, pollSearchResults, isSearching]);

  return {
    state,
    tours,
    error,
    isSearching,
    searchTours,
    stopSearch,
  };
};

