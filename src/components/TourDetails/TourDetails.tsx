import type { HotelDetails, Price } from '../../types/api';
import { formatDate, formatPrice } from '../../utils/format';
import './TourDetails.css';

interface TourDetailsProps {
  hotel: HotelDetails;
  price: Price;
  countryFlag?: string | null;
}

export const TourDetails = ({ hotel, price, countryFlag }: TourDetailsProps) => {
  const { startDate, endDate, amount, currency } = price;

  // Обчислюємо тривалість туру
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Форматуємо сервіси для відображення
  const getServiceLabel = (key: string): string => {
    const labels: Record<string, string> = {
      wifi: 'Wi-Fi',
      aquapark: 'Аквапарк',
      tennis_court: 'Тенісний корт',
      laundry: 'Пральня',
      parking: 'Парковка',
    };
    return labels[key] || key;
  };

  const activeServices = hotel.services
    ? Object.entries(hotel.services)
        .filter(([_, value]) => value === 'yes')
        .map(([key]) => key)
    : [];

  return (
    <div className="tour-details">
      <div className="tour-details-header">
        <h1 className="tour-details-title">{hotel.name}</h1>
        <div className="tour-details-location">
          {countryFlag && (
            <img 
              src={countryFlag} 
              alt={hotel.countryName}
              className="tour-details-flag"
            />
          )}
          <span className="tour-details-country">{hotel.countryName}</span>
          {hotel.cityName && (
            <>
              <span className="tour-details-separator">, </span>
              <span className="tour-details-city">{hotel.cityName}</span>
            </>
          )}
        </div>
      </div>

      {hotel.img && (
        <div className="tour-details-image-wrapper">
          <img 
            src={hotel.img} 
            alt={hotel.name}
            className="tour-details-image"
          />
        </div>
      )}

      {hotel.description && (
        <div className="tour-details-section">
          <h2 className="tour-details-section-title">Опис</h2>
          <p className="tour-details-description">{hotel.description}</p>
        </div>
      )}

      {activeServices.length > 0 && (
        <div className="tour-details-section">
          <h2 className="tour-details-section-title">Сервіси</h2>
          <div className="tour-details-services">
            {activeServices.map((serviceKey) => (
              <div key={serviceKey} className="tour-details-service">
                <span className="tour-details-service-icon">
                  {serviceKey === 'wifi' && '📶'}
                  {serviceKey === 'aquapark' && '🏊'}
                  {serviceKey === 'tennis_court' && '🎾'}
                  {serviceKey === 'laundry' && '🧺'}
                  {serviceKey === 'parking' && '🅿️'}
                </span>
                <span className="tour-details-service-label">
                  {getServiceLabel(serviceKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tour-details-price-section">
        <div className="tour-details-price-info">
          <div className="tour-details-date">
            <span className="tour-details-date-icon">📅</span>
            <span className="tour-details-date-text">
              {formatDate(startDate)} - {formatDate(endDate)} ({duration} {duration === 1 ? 'день' : 'днів'})
            </span>
          </div>
          <div className="tour-details-price">
            {formatPrice(amount, currency)}
          </div>
        </div>
        <button className="tour-details-price-button">
          Відкрити ціну
        </button>
      </div>
    </div>
  );
};

