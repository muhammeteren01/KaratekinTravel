const MONTH_LABELS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function toApiDate(date) {
  return date.toISOString();
}

export function getRangeForFilter(filter = 'Aylık') {
  const end = new Date();
  const start = new Date(end);

  if (filter === 'Günlük') {
    start.setHours(0, 0, 0, 0);
  } else if (filter === 'Haftalık') {
    start.setDate(end.getDate() - 7);
  } else {
    start.setMonth(end.getMonth() - 1);
  }

  return { start, end };
}

export function getMonthRanges(count = 6) {
  const ranges = [];
  const anchor = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() - i + 1, 0, 23, 59, 59, 999);
    ranges.push({
      start,
      end,
      label: MONTH_LABELS_TR[start.getMonth()],
    });
  }

  return ranges;
}

export function formatDisplayDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatCurrency(value, currency = 'TRY') {
  const amount = Number(value || 0);
  if (currency === 'TRY' || currency === 'TL') {
    return `₺${amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
  }
  return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ${currency}`;
}
