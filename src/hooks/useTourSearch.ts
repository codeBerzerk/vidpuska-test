import { useState, useCallback, useRef, useEffect } from 'react';
import { startTourSearch, fetchSearchPrices, fetchHotelsByCountry } from '../utils/api';
import { fetchCountries } from '../utils/api';
import type { Tour, SearchState, SearchError, Country, Hotel, Price } from '../types/api';

const MAX_RETRIES = 2;

export const useTourSearch = () => {
  const [state, setState] = useState<SearchState>('idle');
  const [tours, setTours] = useState<Tour[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const tokenRef = useRef<string | null>(null);
  const countryIDRef = useRef<string | null>(null);
  const hotelsCacheRef = useRef<Record<string, Record<string, Hotel>>>({});
  const countriesCacheRef = useRef<Record<string, Country>>({});

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
        console.error('Помилка завантаження кешу країн:', err);
      }
    };
    loadCache();
  }, []);

  const stopSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsSearching(false);
    setState('idle');
    tokenRef.current = null;
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
    try {
      setState('polling');
      const response = await fetchSearchPrices(token);

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
        console.log(`⚠️ Для країни ${countryID} не знайдено готелів`);
        setState('empty');
        setTours([]);
        setIsSearching(false);
        return;
      }

      // Формуємо тури, зіставляючи ціни з готелями
      // В API hotelID - це рядок (ключ об'єкта hotels), тому використовуємо прямий доступ
      const toursData: Tour[] = prices
        .map((price: Price) => {
          // hotelID з API - це рядок (ключ об'єкта hotels)
          const hotelIdKey = String(price.hotelID);
          
          // Прямий доступ до об'єкта hotels за ключем (рядок)
          const hotel = hotels[hotelIdKey];
          
          if (!hotel) {
            // Якщо не знайшли за ключем, спробуємо знайти за числовим ID
            const hotelByNumericId = Object.values(hotels).find(
              (h) => String(h.id) === hotelIdKey || Number(h.id) === Number(price.hotelID)
            );
            
            if (!hotelByNumericId) {
              console.warn(`Готель з hotelID ${price.hotelID} (ключ: ${hotelIdKey}) не знайдено. Доступні ключі:`, Object.keys(hotels));
              return null;
            }
            
            return {
              ...price,
              hotel: hotelByNumericId,
            };
          }
          
          return {
            ...price,
            hotel,
          };
        })
        .filter((tour): tour is Tour => tour !== null);

      if (toursData.length === 0) {
        setState('empty');
        setTours([]);
        setIsSearching(false);
        return;
      }

      setTours(toursData);
      setState('success');
      setIsSearching(false);
      retryCountRef.current = 0;
    } catch (err) {
      // Перевіряємо, чи це SearchError з кодом 425 (результати ще не готові)
      if (err && typeof err === 'object' && 'code' in err && (err as SearchError).code === 425) {
        const error = err as SearchError;
        if (error.waitUntil) {
          waitUntil(error.waitUntil, () => {
            pollSearchResults(token, retryCount);
          });
          return;
        }
      }

      // Якщо помилка і є спроби для ретраю
      if (retryCount < MAX_RETRIES) {
        retryCountRef.current = retryCount + 1;
        setTimeout(() => {
          pollSearchResults(token, retryCount + 1);
        }, 1000); // Затримка перед ретраєм
        return;
      }

      // Всі спроби вичерпані
      const errorMessage = 
        (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string')
          ? (err as any).message
          : 'Помилка пошуку турів';
      setError(errorMessage);
      setState('error');
      setIsSearching(false);
      retryCountRef.current = 0;
    }
  }, [waitUntil]);

  const searchTours = useCallback(async (countryID: string) => {
    // Очищаємо попередній пошук
    stopSearch();

    setError(null);
    setTours([]);
    setIsSearching(true);
    setState('waiting');
    countryIDRef.current = countryID;

    try {
      const { token, waitUntil: waitUntilTime } = await startTourSearch(countryID);
      tokenRef.current = token;

      waitUntil(waitUntilTime, () => {
        pollSearchResults(token);
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Помилка запуску пошуку');
      setState('error');
      setIsSearching(false);
      countryIDRef.current = null;
    }
  }, [stopSearch, waitUntil, pollSearchResults]);

  return {
    state,
    tours,
    error,
    isSearching,
    searchTours,
    stopSearch,
  };
};

