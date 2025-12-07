import { useState, useRef, useEffect, useCallback } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, size } from '@floating-ui/react-dom';
import type { GeoEntity } from '../../types/api';
import { fetchCountries, searchGeoEntities } from '../../utils/api';
import { GlobeIcon, CityIcon, HotelIcon, ArrowDownIcon } from '../Icons';
import './SearchInput.css';

interface SearchInputProps {
  value: GeoEntity | null;
  onChange: (entity: GeoEntity | null) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Введіть напрямок подорожі' }: SearchInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState<GeoEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRequestRef = useRef<string | null>(null);

  const { refs, floatingStyles } = useFloating({
    middleware: [
      offset(4),
      flip(),
      shift(),
      size({
        apply({ rects }) {
          if (refs.floating.current) {
            refs.floating.current.style.width = `${rects.reference.width}px`;
          }
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Визначаємо функції перед useEffect, які їх використовують
  const loadCountries = useCallback(async () => {
    setIsLoading(true);
    try {
      const countries = await fetchCountries();
      const countriesList = Object.values(countries).map(country => ({
        ...country,
        type: 'country' as const,
      }));
      setOptions(countriesList);
    } catch (error) {
      console.error('Помилка завантаження країн:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (search: string) => {
    if (!search.trim()) {
      loadCountries();
      return;
    }

    // Зберігаємо поточний запит для перевірки актуальності
    const currentRequest = search.trim();
    searchRequestRef.current = currentRequest;
    setIsLoading(true);
    
    try {
      const results = await searchGeoEntities(currentRequest);
      
      // Перевіряємо, чи запит все ще актуальний (не був скасований новим пошуком)
      if (searchRequestRef.current === currentRequest) {
        const resultsList = Object.values(results);
        setOptions(resultsList);
      }
    } catch (error) {
      // Показуємо помилку тільки якщо запит все ще актуальний
      if (searchRequestRef.current === currentRequest) {
        console.error('Помилка пошуку:', error);
        setOptions([]);
      }
    } finally {
      // Скидаємо loading тільки якщо це останній запит
      if (searchRequestRef.current === currentRequest) {
        setIsLoading(false);
      }
    }
  }, [loadCountries]);

  // Завантаження країн при відкритті
  useEffect(() => {
    if (isOpen && !searchText && !value) {
      loadCountries();
    }
  }, [isOpen, loadCountries, searchText, value]);

  // Пошук при зміні тексту
  useEffect(() => {
    if (isOpen && searchText) {
      const timeoutId = setTimeout(() => {
        // Використовуємо актуальне значення searchText через замикання
        performSearch(searchText);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (isOpen && !searchText && !value) {
      loadCountries();
    }
  }, [searchText, isOpen, value, performSearch, loadCountries]);

  const handleInputClick = () => {
    setIsOpen(true);
    if (value && !searchText) {
      // Якщо вже є вибране значення і немає тексту, показуємо відповідні результати
      if (value.type === 'country') {
        loadCountries();
      } else {
        performSearch(value.name);
      }
    } else if (!value && !searchText) {
      loadCountries();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    // Очищаємо вибране значення при введенні тексту
    if (text && value) {
      onChange(null);
    }
    if (text) {
      setIsOpen(true);
    }
  };

  const handleSelect = (entity: GeoEntity) => {
    onChange(entity);
    setSearchText('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchText('');
    setIsOpen(false);
  };

  // Відображаємо текст пошуку, якщо він є, інакше - вибране значення
  const displayValue = searchText || (value ? value.name : '');

  const getIcon = (entity: GeoEntity) => {
    if (entity.type === 'country') {
      return <GlobeIcon className="search-option-icon" />;
    } else if (entity.type === 'city') {
      return <CityIcon className="search-option-icon" />;
    } else if (entity.type === 'hotel') {
      return <HotelIcon className="search-option-icon" />;
    }
    return <GlobeIcon className="search-option-icon" />;
  };

  // Закриваємо випадаюче меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const floatingEl = refs.floating.current;
      const referenceEl = refs.reference.current;
      
      if (
        isOpen &&
        floatingEl &&
        referenceEl &&
        !floatingEl.contains(target) &&
        (referenceEl instanceof HTMLElement ? !referenceEl.contains(target) : true)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, refs]);

  return (
    <>
      <div className="search-input-wrapper" ref={refs.setReference}>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputClick}
        />
        <ArrowDownIcon className="search-input-arrow" />
        {value && (
          <button
            type="button"
            className="search-input-clear"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Очистити"
          >
            ×
          </button>
        )}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="search-dropdown"
        >
          {isLoading ? (
            <div className="search-dropdown-loading">Завантаження...</div>
          ) : options.length === 0 ? (
            <div className="search-dropdown-empty">Нічого не знайдено</div>
          ) : (
            <ul className="search-dropdown-list">
              {options.map((entity) => (
                <li
                  key={`${entity.type}-${entity.id}`}
                  className="search-dropdown-item"
                  onClick={() => handleSelect(entity)}
                >
                  {getIcon(entity)}
                  <span className="search-dropdown-item-text">{entity.name}</span>
                  {entity.type === 'country' && 'flag' in entity && entity.flag && (
                    <img src={entity.flag} alt="" className="search-dropdown-flag" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

