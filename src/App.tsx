import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TourSearchForm } from './components/TourSearchForm';
import { TourPage } from './pages/TourPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<TourSearchForm />} />
          <Route path="/tour/:priceId/:hotelId" element={<TourPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
