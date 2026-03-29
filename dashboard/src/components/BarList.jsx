function formatValue(value) {
  return new Intl.NumberFormat().format(value);
}

export default function BarList({
  items,
  valueKey = 'count',
  emptyMessage = 'No data yet.',
  valueFormatter = formatValue
}) {
  if (!items?.length) {
    return <p className="empty-text">{emptyMessage}</p>;
  }

  const maxValue = Math.max(...items.map((item) => item[valueKey]), 1);

  return (
    <div className="bar-list">
      {items.map((item) => {
        const itemValue = item[valueKey];
        const width = `${Math.max((itemValue / maxValue) * 100, 6)}%`;
        const label = item.productTitle || item.label || item.productId || item.key;

        return (
          <div className="bar-row" key={`${label}-${itemValue}`}>
            <div className="bar-row-header">
              <span>{label}</span>
              <strong>{valueFormatter(itemValue)}</strong>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
