export interface Country {
  id: string;
  name: string;
  flag: string;
  type?: 'country';
}

export interface City {
  id: number;
  name: string;
  countryId: string;
  type?: 'city';
}

export interface Hotel {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
  img?: string;
  type?: 'hotel';
}

export type GeoEntity = Country | City | Hotel;

export interface SearchResult {
  country?: Country;
  city?: City;
  hotel?: Hotel;
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelID: number | string; // Може бути рядком (ключ об'єкта) або числом
}

export interface Tour extends Price {
  hotel: Hotel;
  countryFlag?: string; // Прапорець країни для відображення
}

export interface StartSearchResponse {
  token: string;
  waitUntil: string;
}

export interface GetSearchPricesResponse {
  prices: Record<string, Price>;
}

export interface SearchError {
  code: number;
  error: boolean;
  message: string;
  waitUntil?: string;
}

export type SearchState = 'idle' | 'waiting' | 'polling' | 'success' | 'error' | 'empty';

export interface HotelServices {
  wifi?: 'yes' | 'no' | 'none';
  aquapark?: 'yes' | 'no' | 'none';
  tennis_court?: 'yes' | 'no' | 'none';
  laundry?: 'yes' | 'no' | 'none';
  parking?: 'yes' | 'no' | 'none';
  [key: string]: 'yes' | 'no' | 'none' | undefined;
}

export interface HotelDetails extends Hotel {
  description?: string;
  services?: HotelServices;
}

