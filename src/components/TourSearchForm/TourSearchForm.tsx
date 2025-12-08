import { useState } from 'react';
import { SearchInput } from '../SearchInput';
import { SearchStates } from '../SearchStates';
import { ToursList } from '../ToursList';
import { useTourSearch } from '../../hooks/useTourSearch';
import type { GeoEntity } from '../../types/api';
import './TourSearchForm.css';

export const TourSearchForm = () => {
  const [selectedDestination, setSelectedDestination] = useState<GeoEntity | null>(null);
  const { state, tours, error, isSearching, searchTours } = useTourSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestination && selectedDestination.type === 'country') {
      searchTours(selectedDestination.id);
    } else if (selectedDestination) {
      // Якщо вибрано місто або готель, використовуємо countryId та передаємо фільтри
      const countryId = 'countryId' in selectedDestination 
        ? selectedDestination.countryId 
        : null;
      if (countryId) {
        const filters: { cityId?: number; hotelId?: number } = {};
        
        if (selectedDestination.type === 'city') {
          filters.cityId = selectedDestination.id;
        } else if (selectedDestination.type === 'hotel') {
          filters.hotelId = selectedDestination.id;
          // Якщо вибрано готель, також фільтруємо по місту цього готелю
          if ('cityId' in selectedDestination) {
            filters.cityId = selectedDestination.cityId;
          }
        }
        
        searchTours(countryId, filters);
      }
    }
  };

  const isSubmitDisabled = !selectedDestination || isSearching || state === 'cancelling';

  return (
    <>
      <div className="tour-search-form-container">
        <h1 className="tour-search-form-title">Форма пошуку турів</h1>
        <form className="tour-search-form" onSubmit={handleSubmit}>
          <div className="tour-search-form-field">
            <SearchInput
              value={selectedDestination}
              onChange={setSelectedDestination}
              placeholder="Введіть напрямок подорожі"
            />
          </div>
          <button 
            type="submit" 
            className="tour-search-form-button"
            disabled={isSubmitDisabled}
          >
            {state === 'cancelling' ? 'Скасування...' : isSearching ? 'Пошук...' : 'Знайти'}
          </button>
        </form>
        <SearchStates state={state} error={error} />
      </div>
      {state === 'success' && tours.length > 0 && (
        <ToursList tours={tours} />
      )}
    </>
  );
};


