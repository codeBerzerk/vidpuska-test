import { useState } from 'react';
import { SearchInput } from './SearchInput';
import type { GeoEntity } from '../types/api';
import './TourSearchForm.css';

export const TourSearchForm = () => {
  const [selectedDestination, setSelectedDestination] = useState<GeoEntity | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestination) {
      console.log('Пошук туру для:', selectedDestination);
      // Тут буде логіка пошуку турів (наступне завдання)
    }
  };

  return (
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
        <button type="submit" className="tour-search-form-button">
          Знайти
        </button>
      </form>
    </div>
  );
};

