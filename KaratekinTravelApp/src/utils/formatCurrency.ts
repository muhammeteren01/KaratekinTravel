export function formatCurrency(amount?: number, currency: string = 'USD') {
  const val = typeof amount === 'number' ? amount : 0;
  const symbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
  // Simple thousands separator without Intl
  const parts = Math.round(val).toString().split('');
  const out: string[] = [];
  let count = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    out.unshift(parts[i]);
    count++;
    if (count === 3 && i > 0) {
      out.unshift('.'); // Turkish thousands separator
      count = 0;
    }
  }
  return symbol ? `${symbol}${out.join('')}` : `${out.join('')} ${currency}`;
}
