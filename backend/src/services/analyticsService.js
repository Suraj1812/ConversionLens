import { eventRepository } from '../repositories/eventRepository.js';

function buildTimeFilter(windowDays = 30) {
  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd.getTime() - windowDays * 24 * 60 * 60 * 1000);

  return {
    rangeStart,
    rangeEnd,
    filter: {
      timestamp: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    }
  };
}

function formatPercentage(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

export function calculateFunnelFromEvents(events) {
  const sessionSteps = new Map();

  for (const event of events) {
    const current = sessionSteps.get(event.sessionId) ?? {
      viewed: false,
      addedToCart: false,
      purchased: false
    };

    if (event.eventType === 'view') {
      current.viewed = true;
    }

    if (event.eventType === 'add_to_cart' && current.viewed) {
      current.addedToCart = true;
    }

    if (event.eventType === 'purchase' && current.addedToCart) {
      current.purchased = true;
    }

    sessionSteps.set(event.sessionId, current);
  }

  let viewCount = 0;
  let cartCount = 0;
  let purchaseCount = 0;

  for (const current of sessionSteps.values()) {
    if (current.viewed) {
      viewCount += 1;
    }

    if (current.addedToCart) {
      cartCount += 1;
    }

    if (current.purchased) {
      purchaseCount += 1;
    }
  }

  return {
    steps: [
      {
        key: 'view',
        label: 'Product Views',
        count: viewCount,
        conversionFromPrevious: 100
      },
      {
        key: 'add_to_cart',
        label: 'Add to Cart',
        count: cartCount,
        conversionFromPrevious: formatPercentage(cartCount, viewCount)
      },
      {
        key: 'purchase',
        label: 'Purchase',
        count: purchaseCount,
        conversionFromPrevious: formatPercentage(purchaseCount, cartCount)
      }
    ],
    overallConversionRate: formatPercentage(purchaseCount, viewCount)
  };
}

function sortDescending(items, primaryKey, secondaryKey) {
  return [...items].sort((left, right) => {
    if (right[primaryKey] !== left[primaryKey]) {
      return right[primaryKey] - left[primaryKey];
    }

    return (right[secondaryKey] || 0) - (left[secondaryKey] || 0);
  });
}

export function createAnalyticsService(repository = eventRepository) {
  return {
    async getOverviewStats({ windowDays = 30 } = {}) {
      const { rangeStart, rangeEnd } = buildTimeFilter(windowDays);
      const overview = await repository.getOverviewRollup({
        rangeStart,
        rangeEnd
      });

      return {
        totalEvents: overview.totalEvents,
        totalUsers: overview.totalUsers,
        conversionRate: formatPercentage(overview.purchaseSessions, overview.viewSessions),
        totalsByEvent: {
          view: overview.viewCount,
          add_to_cart: overview.cartCount,
          purchase: overview.purchaseCount
        },
        range: {
          windowDays,
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString()
        }
      };
    },

    async getFunnelStats({ windowDays = 30 } = {}) {
      const { rangeStart, rangeEnd } = buildTimeFilter(windowDays);
      const events = await repository.getFunnelEvents({
        rangeStart,
        rangeEnd
      });

      return {
        ...calculateFunnelFromEvents(events),
        range: {
          windowDays,
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString()
        }
      };
    },

    async getProductStats({ windowDays = 30, limit = 5 } = {}) {
      const { rangeStart, rangeEnd } = buildTimeFilter(windowDays);
      const rows = await repository.getProductRollups({
        rangeStart,
        rangeEnd
      });

      const byProduct = new Map();

      for (const row of rows) {
        const current = byProduct.get(row.productId) ?? {
          productId: row.productId,
          productTitle: row.productTitle || row.productId,
          viewCount: 0,
          cartCount: 0,
          purchaseCount: 0,
          viewSessions: 0,
          cartSessions: 0,
          purchaseSessions: 0,
          conversionRate: 0,
          abandonmentCount: 0,
          abandonmentRate: 0
        };

        current.productTitle = row.productTitle || current.productTitle;

        if (row.eventType === 'view') {
          current.viewCount = row.totalCount;
          current.viewSessions = row.uniqueSessions;
        }

        if (row.eventType === 'add_to_cart') {
          current.cartCount = row.totalCount;
          current.cartSessions = row.uniqueSessions;
        }

        if (row.eventType === 'purchase') {
          current.purchaseCount = row.totalCount;
          current.purchaseSessions = row.uniqueSessions;
        }

        byProduct.set(row.productId, current);
      }

      const products = [...byProduct.values()].map((product) => ({
        ...product,
        conversionRate: formatPercentage(product.purchaseSessions, product.viewSessions),
        abandonmentCount: Math.max(product.cartSessions - product.purchaseSessions, 0),
        abandonmentRate: formatPercentage(
          Math.max(product.cartSessions - product.purchaseSessions, 0),
          product.cartSessions
        )
      }));

      return {
        topViewed: sortDescending(products, 'viewCount', 'viewSessions').slice(0, limit),
        topPurchased: sortDescending(products, 'purchaseCount', 'purchaseSessions').slice(0, limit),
        bestConverting: sortDescending(
          products.filter((product) => product.viewSessions > 0),
          'conversionRate',
          'purchaseSessions'
        ).slice(0, limit),
        mostAbandoned: sortDescending(
          products.filter((product) => product.cartSessions > 0),
          'abandonmentCount',
          'cartSessions'
        ).slice(0, limit),
        range: {
          windowDays,
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString()
        }
      };
    }
  };
}

export const analyticsService = createAnalyticsService();
