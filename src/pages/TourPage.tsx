import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHotel, fetchPrice, fetchCountries } from '../utils/api';
import { logger } from '../utils/logger';
import type { HotelDetails, Price } from '../types/api';
import { TourDetails } from '../components/TourDetails';
import './TourPage.css';

export const TourPage = () => {
  const { priceId, hotelId } = useParams<{ priceId: string; hotelId: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [countryFlag, setCountryFlag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!priceId || !hotelId) {
        setError('Відсутні необхідні параметри');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Завантажуємо дані паралельно
        const [hotelData, priceData, countries] = await Promise.all([
          fetchHotel(Number(hotelId)),
          fetchPrice(priceId),
          fetchCountries(),
        ]);

        setHotel(hotelData);
        setPrice(priceData);

        // Знаходимо прапорець країни
        const country = Object.values(countries).find(
          (c) => c.id === hotelData.countryId
        );
        if (country) {
          setCountryFlag(country.flag);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Помилка завантаження даних';
        setError(errorMessage);
        logger.error('Помилка завантаження туру', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [priceId, hotelId]);

  if (isLoading) {
    return (
      <div className="tour-page">
        <div className="tour-page-loading">
          <div className="tour-page-spinner" />
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel || !price) {
    return (
      <div className="tour-page">
        <div className="tour-page-error">
          <h2>Помилка</h2>
          <p>{error || 'Дані не знайдено'}</p>
          <button onClick={() => navigate('/')} className="tour-page-back-button">
            Повернутися до пошуку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-page">
      <button onClick={() => navigate('/')} className="tour-page-back-button">
        ← Повернутися до пошуку
      </button>
      <TourDetails hotel={hotel} price={price} countryFlag={countryFlag} />
    </div>
  );
};

