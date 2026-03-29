import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import EmptyAnalyticsState from '../components/EmptyAnalyticsState.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';
import { formatDateRange, formatNumber, formatPercent } from '../lib/formatters.js';

export default function ProductsPage({ windowDays }) {
  const { data: products, loading, error } = useAnalyticsData('/analytics/products', {
    windowDays,
    limit: 8
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const rangeLabel = formatDateRange(products.range);
  const isEmpty =
    !products.topViewed.length &&
    !products.topPurchased.length &&
    !products.bestConverting.length &&
    !products.mostAbandoned.length;
  const mergedProducts = new Map();

  for (const group of [
    products.topViewed,
    products.topPurchased,
    products.bestConverting,
    products.mostAbandoned
  ]) {
    for (const product of group) {
      const current = mergedProducts.get(product.productId) ?? {};
      mergedProducts.set(product.productId, {
        ...current,
        ...product
      });
    }
  }

  const productRows = [...mergedProducts.values()].sort((left, right) => {
    if (right.viewCount !== left.viewCount) {
      return right.viewCount - left.viewCount;
    }

    return right.purchaseCount - left.purchaseCount;
  });

  const topViewedProduct = products.topViewed[0];
  const topPurchasedProduct = products.topPurchased[0];
  const bestConvertingProduct = products.bestConverting[0];
  const mostAbandonedProduct = products.mostAbandoned[0];

  return (
    <div className="page-grid">
      <SectionHeading
        title="Products"
        subtitle={`Product-level performance and friction points from ${rangeLabel || `the last ${windowDays} days`}.`}
      />

      {isEmpty ? (
        <EmptyAnalyticsState
          title="No product analytics yet"
          description="Once storefront events are flowing, this page highlights which products attract attention, convert efficiently, and leak from cart."
          steps={[
            {
              title: 'Visit multiple product pages',
              description:
                'Create view events across a few products so the dashboard has something real to compare.'
            },
            {
              title: 'Add different products to cart',
              description:
                'This helps surface cart intent and later shows which products are frequently abandoned.'
            },
            {
              title: 'Place at least one test order',
              description:
                'Purchases unlock conversion-rate and product-performance comparisons.'
            }
          ]}
        />
      ) : null}

      <div className="metrics-grid">
        <MetricCard
          label="Top Viewed Product"
          value={formatNumber(topViewedProduct?.viewCount || 0)}
          helper={topViewedProduct?.productTitle || 'Waiting for storefront views'}
        />
        <MetricCard
          label="Top Purchased Product"
          value={formatNumber(topPurchasedProduct?.purchaseCount || 0)}
          helper={topPurchasedProduct?.productTitle || 'Waiting for completed orders'}
        />
        <MetricCard
          label="Best Conversion Rate"
          value={formatPercent(bestConvertingProduct?.conversionRate || 0)}
          helper={bestConvertingProduct?.productTitle || 'Waiting for product conversion data'}
        />
        <MetricCard
          label="Highest Abandonment"
          value={formatPercent(mostAbandonedProduct?.abandonmentRate || 0)}
          helper={mostAbandonedProduct?.productTitle || 'Waiting for add-to-cart behavior'}
        />
      </div>

      <Panel title="Catalog Performance" subtitle="A consolidated view of the products showing up across key analytics lists.">
        {!productRows.length ? (
          <p className="empty-text">No product performance rows available yet.</p>
        ) : (
          <div className="table-wrapper">
            <div className="data-table">
              <div className="data-row data-row-head">
                <span>Product</span>
                <span>Views</span>
                <span>Carts</span>
                <span>Purchases</span>
                <span>Conv. rate</span>
                <span>Abandonment</span>
              </div>

              {productRows.map((product) => (
                <div className="data-row" key={product.productId}>
                  <div className="product-cell">
                    <strong>{product.productTitle || product.productId}</strong>
                    <span>{product.productId}</span>
                  </div>
                  <span>{formatNumber(product.viewCount)}</span>
                  <span>{formatNumber(product.cartCount)}</span>
                  <span>{formatNumber(product.purchaseCount)}</span>
                  <span>{formatPercent(product.conversionRate)}</span>
                  <span>{formatPercent(product.abandonmentRate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <div className="page-grid two-column">
        <Panel title="Top Viewed Products" subtitle="Products pulling the most product-page attention.">
          <BarList items={products.topViewed} emptyMessage="No product views have been tracked yet." />
        </Panel>

        <Panel title="Most Abandoned Products" subtitle="Products that make it to cart but stall before purchase.">
          <BarList
            items={products.mostAbandoned}
            valueKey="abandonmentCount"
            emptyMessage="No abandoned cart patterns have been tracked yet."
          />
        </Panel>
      </div>
    </div>
  );
}
