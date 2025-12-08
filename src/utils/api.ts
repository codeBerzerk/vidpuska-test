import type { Country, GeoEntity, StartSearchResponse, GetSearchPricesResponse, SearchError, Hotel, HotelDetails, Price } from '../types/api';
import { handleApiResponse } from './api-helpers';

// Імпортуємо методи з api.js
// @ts-ignore - api.js не має типів
import { getCountries, searchGeo, startSearchPrices, getSearchPrices, getHotels, getHotel, getPrice } from '../../api.js';

export const fetchCountries = async (): Promise<Record<string, Country>> => {
  const response = await getCountries();
  const data = await response.json();
  return data;
};

export const searchGeoEntities = async (search: string): Promise<Record<string, GeoEntity>> => {
  const response = await searchGeo(search);
  const data = await response.json();
  return data;
};

export const startTourSearch = async (countryID: string): Promise<StartSearchResponse> => {
  try {
    const response = await startSearchPrices(countryID);
    return await handleApiResponse<StartSearchResponse>(response, 'Помилка запуску пошуку');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Невідома помилка при запуску пошуку');
  }
};

export const fetchSearchPrices = async (token: string): Promise<GetSearchPricesResponse> => {
  try {
    const response = await getSearchPrices(token);
    if (!response.ok) {
      const error: SearchError = await response.json();
      throw error;
    }
    const data: GetSearchPricesResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Response) {
      const errorData: SearchError = await error.json();
      throw errorData;
    }
    throw error;
  }
};

export const fetchHotelsByCountry = async (countryID: string): Promise<Record<string, Hotel>> => {
  const response = await getHotels(countryID);
  const data: Record<string, Hotel> = await response.json();
  return data;
};

export const fetchHotel = async (hotelId: number): Promise<HotelDetails> => {
  try {
    const response = await getHotel(hotelId);
    return await handleApiResponse<HotelDetails>(response, 'Помилка завантаження готелю');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Невідома помилка при завантаженні готелю');
  }
};

export const fetchPrice = async (priceId: string): Promise<Price> => {
  try {
    const response = await getPrice(priceId);
    return await handleApiResponse<Price>(response, 'Помилка завантаження ціни');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Невідома помилка при завантаженні ціни');
  }
};

