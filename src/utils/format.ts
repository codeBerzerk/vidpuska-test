/**
 * Форматує дату у формат DD.MM.YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Форматує ціну з розділювачами тисяч та валютою
 * @param amount - сума
 * @param currency - валюта (usd, uah, eur тощо)
 * @returns Відформатована ціна, наприклад: "25 000 грн"
 */
export const formatPrice = (amount: number, currency: string): string => {
  // Форматуємо число з розділювачами тисяч
  const formattedAmount = amount.toLocaleString('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Мапінг валют на українські назви
  const currencyMap: Record<string, string> = {
    usd: 'USD',
    uah: 'грн',
    eur: 'EUR',
    gbp: 'GBP',
  };

  const currencySymbol = currencyMap[currency.toLowerCase()] || currency.toUpperCase();

  return `${formattedAmount} ${currencySymbol}`;
};

