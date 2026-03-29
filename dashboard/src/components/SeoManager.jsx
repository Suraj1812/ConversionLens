import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Shoplytics';
const DEFAULT_DESCRIPTION =
  'Shoplytics is a Shopify analytics dashboard for funnel tracking, conversion analysis, and product performance insights.';
const SITE_URL = 'https://conversionlens.vercel.app';
const OG_IMAGE_URL = `${SITE_URL}/og-image.svg`;

const routeMeta = {
  '/overview': {
    title: 'Overview Dashboard',
    description:
      'Monitor Shopify traffic, event volume, and conversion rate from a clean eCommerce analytics dashboard.'
  },
  '/funnel': {
    title: 'Funnel Analysis',
    description:
      'Analyze how users move from product view to cart to purchase across the Shopify funnel.'
  },
  '/products': {
    title: 'Product Analytics',
    description:
      'Track top viewed products, best converters, and abandoned cart leaders in your Shopify store.'
  }
};

function upsertMeta(name, content, attribute = 'name') {
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', href);
}

export default function SeoManager() {
  const location = useLocation();
  const meta = routeMeta[location.pathname] ?? {
    title: 'Shopify Analytics Dashboard',
    description: DEFAULT_DESCRIPTION
  };
  const canonicalUrl = `${SITE_URL}${location.pathname === '/' ? '/overview' : location.pathname}`;
  const title = `${meta.title} | ${SITE_NAME}`;

  useEffect(() => {
    document.title = title;

    upsertMeta('description', meta.description);
    upsertMeta('keywords', 'Shopify analytics, eCommerce tracking, funnel analysis, conversion dashboard');
    upsertMeta('author', 'Shoplytics');
    upsertMeta('robots', 'index, follow');
    upsertMeta('application-name', SITE_NAME);
    upsertMeta('theme-color', '#0f172a');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:site_name', SITE_NAME, 'property');
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', meta.description, 'property');
    upsertMeta('og:url', canonicalUrl, 'property');
    upsertMeta('og:image', OG_IMAGE_URL, 'property');
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', meta.description);
    upsertMeta('twitter:image', OG_IMAGE_URL);
    upsertLink('canonical', canonicalUrl);
  }, [canonicalUrl, meta.description, title]);

  return null;
}
