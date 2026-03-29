export const routeMeta = {
  '/login': {
    path: '/login',
    pageTitle: 'Sign in',
    pageSubtitle: 'Access the Shoplytics admin dashboard.',
    seoTitle: 'Sign In',
    seoDescription: 'Secure sign in for the Shoplytics admin analytics dashboard.'
  },
  '/overview': {
    path: '/overview',
    navLabel: 'Overview',
    pageTitle: 'Overview',
    pageSubtitle: 'Traffic, events, and conversion across your store.',
    seoTitle: 'Overview Dashboard',
    seoDescription:
      'Monitor Shopify traffic, event volume, and conversion rate from a clean eCommerce analytics dashboard.'
  },
  '/funnel': {
    path: '/funnel',
    navLabel: 'Funnel',
    pageTitle: 'Funnel',
    pageSubtitle: 'Track how sessions move from view to cart to purchase.',
    seoTitle: 'Funnel Analysis',
    seoDescription:
      'Analyze how users move from product view to cart to purchase across the Shopify funnel.'
  },
  '/products': {
    path: '/products',
    navLabel: 'Products',
    pageTitle: 'Products',
    pageSubtitle: 'See which products attract attention, convert, and get abandoned.',
    seoTitle: 'Product Analytics',
    seoDescription:
      'Track top viewed products, best converters, and abandoned cart leaders in your Shopify store.'
  }
};

export const navigationItems = [
  routeMeta['/overview'],
  routeMeta['/funnel'],
  routeMeta['/products']
];

export function getRouteMeta(pathname) {
  return routeMeta[pathname] ?? routeMeta['/overview'];
}
