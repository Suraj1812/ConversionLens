const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric'
});

export function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

export function formatPercent(value) {
  return `${percentFormatter.format(Number(value || 0))}%`;
}

export function formatDateRange(range) {
  if (!range?.start || !range?.end) {
    return '';
  }

  return `${dateFormatter.format(new Date(range.start))} - ${dateFormatter.format(
    new Date(range.end)
  )}`;
}
