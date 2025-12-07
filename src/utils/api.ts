import type { Country, GeoEntity } from '../types/api';

// Імпортуємо методи з api.js
// @ts-ignore - api.js не має типів
import { getCountries, searchGeo } from '../../api.js';

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

