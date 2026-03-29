export const routeMeta = {
  '/overview': {
    path: '/overview',
    navLabel: 'Overview',
    navDescription: 'Traffic, event volume, and store health',
    pageTitle: 'Store overview',
    pageSubtitle:
      'Monitor storefront activity, cart intent, and completed purchases across your Shopify funnel.',
    seoTitle: 'Overview Dashboard',
    seoDescription:
      'Monitor Shopify traffic, event volume, and conversion rate from a clean eCommerce analytics dashboard.'
  },
  '/funnel': {
    path: '/funnel',
    navLabel: 'Funnel',
    navDescription: 'Step-by-step conversion progression',
    pageTitle: 'Funnel analysis',
    pageSubtitle:
      'See how shoppers move from product view to cart to purchase and where the biggest drop-offs happen.',
    seoTitle: 'Funnel Analysis',
    seoDescription:
      'Analyze how users move from product view to cart to purchase across the Shopify funnel.'
  },
  '/products': {
    path: '/products',
    navLabel: 'Products',
    navDescription: 'Winners, leaks, and product-level performance',
    pageTitle: 'Product analytics',
    pageSubtitle:
      'Compare top viewed products, best converters, and cart abandonment hotspots in one workspace.',
    seoTitle: 'Product Analytics',
    seoDescription:
      'Track top viewed products, best converters, and abandoned cart leaders in your Shopify store.'
  }
};

export const navigationItems = Object.values(routeMeta);

export function getRouteMeta(pathname) {
  return routeMeta[pathname] ?? routeMeta['/overview'];
}
