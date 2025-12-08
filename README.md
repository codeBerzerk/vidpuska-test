# Сервіс пошуку турів

Тестове завдання на розробку клієнтської частини сервісу пошуку турів.

## Технології

- **React 19** - бібліотека для побудови користувацьких інтерфейсів
- **TypeScript** - типізована надмножина JavaScript
- **Vite** - інструмент збірки та розробки
- **React Router DOM 7** - маршрутизація для односторінкових додатків
- **@floating-ui/react-dom** - утиліта для позиціонування випадаючих меню

## Встановлення та запуск

### Передумови

- Node.js (версія 18 або вище)
- npm або yarn

### Встановлення залежностей

```bash
npm install
```

### Запуск у режимі розробки

```bash
npm run dev
```

### Збірка для продакшну

```bash
npm run build
```

### Попередній перегляд збірки

```bash
npm run preview
```

## Структура проєкту

```
src/
├── components/              # React компоненти
│   ├── Icons.tsx           # Компоненти іконок (GlobeIcon, CityIcon, HotelIcon, ArrowDownIcon)
│   ├── SearchInput/       # Компонент інпуту з випадаючим меню
│   │   ├── SearchInput.tsx
│   │   ├── SearchInput.css
│   │   └── index.ts
│   ├── SearchStates/      # Компонент для відображення станів пошуку (loading, error, empty)
│   │   ├── SearchStates.tsx
│   │   ├── SearchStates.css
│   │   └── index.ts
│   ├── TourCard/          # Компонент картки туру
│   │   ├── TourCard.tsx
│   │   ├── TourCard.css
│   │   └── index.ts
│   ├── ToursList/         # Компонент сітки карток турів
│   │   ├── ToursList.tsx
│   │   ├── ToursList.css
│   │   └── index.ts
│   ├── TourDetails/       # Компонент деталей туру
│   │   ├── TourDetails.tsx
│   │   ├── TourDetails.css
│   │   └── index.ts
│   └── TourSearchForm/    # Головна форма пошуку турів
│       ├── TourSearchForm.tsx
│       ├── TourSearchForm.css
│       └── index.ts
├── hooks/                  # Custom React хуки
│   └── useTourSearch.ts   # Хук для логіки пошуку турів (polling, retry, кешування)
├── pages/                  # Сторінки додатку
│   ├── TourPage.tsx       # Сторінка деталей туру
│   └── TourPage.css
├── types/                  # TypeScript типи та інтерфейси
│   └── api.ts             # Типи для даних API (Country, Hotel, Tour, Price, тощо)
├── utils/                  # Утиліти та допоміжні функції
│   ├── api.ts             # Обгортка над api.js для роботи з API
│   ├── api-helpers.ts     # Утиліти для обробки API відповідей
│   ├── format.ts          # Функції форматування (дата, ціна)
│   └── logger.ts          # Централізований сервіс логування
├── constants/             # Константи та конфігурація
│   └── config.ts          # Конфігурація пошуку та UI
├── App.tsx                # Головний компонент з роутингом
├── App.css                # Глобальні стилі
├── main.tsx               # Точка входу
└── index.css              # Базові стилі
```
### Роутинг

- `/` - Головна сторінка з формою пошуку турів
- `/tour/:priceId/:hotelId` - Сторінка деталей туру