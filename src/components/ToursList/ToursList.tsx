import type { Tour } from '../../types/api';
import { TourCard } from '../TourCard';
import './ToursList.css';

interface ToursListProps {
  tours: Tour[];
  onOpenPrice?: (tourId: string) => void;
}

export const ToursList = ({ tours, onOpenPrice }: ToursListProps) => {
  if (tours.length === 0) {
    return null;
  }

  return (
    <div className="tours-list-container">
      <div className="tours-list-grid">
        {tours.map((tour) => (
          <TourCard 
            key={tour.id} 
            tour={tour}
            onOpenPrice={onOpenPrice}
          />
        ))}
      </div>
    </div>
  );
};

