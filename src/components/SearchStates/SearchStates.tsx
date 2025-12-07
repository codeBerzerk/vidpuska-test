import type { SearchState } from '../../types/api';
import './SearchStates.css';

interface SearchStatesProps {
  state: SearchState;
  error: string | null;
}

export const SearchStates = ({ state, error }: SearchStatesProps) => {
  if (state === 'waiting' || state === 'polling') {
    return (
      <div className="search-loading">
        <div className="search-loading-spinner" />
        <p className="search-loading-text">
          {state === 'waiting' ? 'Очікування результатів...' : 'Завантаження результатів...'}
        </p>
      </div>
    );
  }

  if (state === 'error' && error) {
    return (
      <div className="search-error">
        <h3 className="search-error-title">Помилка пошуку</h3>
        <p className="search-error-message">{error}</p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="search-empty">
        <svg
          className="search-empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="search-empty-title">Турів не знайдено</h3>
        <p className="search-empty-message">За вашим запитом турів не знайдено. Спробуйте змінити критерії пошуку.</p>
      </div>
    );
  }

  return null;
};

