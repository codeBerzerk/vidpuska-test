import { useNavigate } from 'react-router-dom';
import type { Tour } from '../../types/api';
import { formatDate, formatPrice } from '../../utils/format';
import './TourCard.css';

interface TourCardProps {
  tour: Tour;
  onOpenPrice?: (tourId: string) => void;
}

export const TourCard = ({ tour, onOpenPrice }: TourCardProps) => {
  const navigate = useNavigate();
  const { hotel, startDate, endDate, amount, currency, id } = tour;

  const handleOpenPrice = () => {
    if (onOpenPrice) {
      onOpenPrice(id);
    } else {
      // За замовчуванням використовуємо навігацію
      navigate(`/tour/${id}/${hotel.id}`);
    }
  };

  return (
    <div className="tour-card">
      {hotel.img && (
        <div className="tour-card-image-wrapper">
          <img 
            src={hotel.img} 
            alt={hotel.name}
            className="tour-card-image"
          />
        </div>
      )}
      <div className="tour-card-content">
        <h3 className="tour-card-title">{hotel.name}</h3>
        <div className="tour-card-location">
          {tour.countryFlag && (
            <img 
              src={tour.countryFlag} 
              alt={hotel.countryName}
              className="tour-card-flag"
            />
          )}
          <span className="tour-card-country">{hotel.countryName}</span>
          {hotel.cityName && (
            <>
              <span className="tour-card-separator">, </span>
              <span className="tour-card-city">{hotel.cityName}</span>
            </>
          )}
        </div>
        <div className="tour-card-dates">
          <span className="tour-card-date-label">Старт туру: </span>
          <span className="tour-card-date-value">{formatDate(startDate)}</span>
        </div>
        <div className="tour-card-price">
          {formatPrice(amount, currency)}
        </div>
        <button 
          className="tour-card-link"
          onClick={handleOpenPrice}
          type="button"
        >
          Відкрити ціну
        </button>
      </div>
    </div>
  );
};

