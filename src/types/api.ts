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

