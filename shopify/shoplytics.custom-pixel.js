const SHOPLYTICS_ENDPOINT = 'https://your-api-domain.com/track-event';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function postToShoplytics(payload) {
  return fetch(SHOPLYTICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch((error) => {
    console.error('Shoplytics pixel error', error);
  });
}

function getPageUrl(event) {
  return event?.context?.document?.location?.href;
}

analytics.subscribe('product_viewed', (event) => {
  const variant = event.data.productVariant;
  const product = variant?.product;

  if (!product?.id) {
    return;
  }

  postToShoplytics({
    eventId: event.id,
    eventType: 'view',
    productId: String(product.id),
    productTitle: product.title,
    sessionId: event.clientId,
    timestamp: event.timestamp,
    pageUrl: getPageUrl(event),
    source: 'shopify_pixel',
    currency: variant?.price?.currencyCode,
    value: toNumber(variant?.price?.amount),
    meta: {
      variantId: variant?.id ? String(variant.id) : null,
      variantTitle: variant?.title ?? null,
      productUrl: product?.url ?? null,
      vendor: product?.vendor ?? null
    }
  });
});

analytics.subscribe('product_added_to_cart', (event) => {
  const cartLine = event.data.cartLine;
  const variant = cartLine?.merchandise;
  const product = variant?.product;

  if (!product?.id) {
    return;
  }

  postToShoplytics({
    eventId: event.id,
    eventType: 'add_to_cart',
    productId: String(product.id),
    productTitle: product.title,
    sessionId: event.clientId,
    timestamp: event.timestamp,
    pageUrl: getPageUrl(event),
    source: 'shopify_pixel',
    currency: cartLine?.cost?.totalAmount?.currencyCode,
    value: toNumber(cartLine?.cost?.totalAmount?.amount),
    quantity: cartLine?.quantity,
    meta: {
      variantId: variant?.id ? String(variant.id) : null,
      variantTitle: variant?.title ?? null,
      productUrl: product?.url ?? null,
      vendor: product?.vendor ?? null
    }
  });
});

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;
  const lineItems = checkout?.lineItems ?? [];

  lineItems.forEach((lineItem, index) => {
    const variant = lineItem?.variant;
    const product = variant?.product;

    if (!product?.id) {
      return;
    }

    postToShoplytics({
      eventId: `${event.id}:${index}`,
      eventType: 'purchase',
      productId: String(product.id),
      productTitle: product.title || lineItem.title,
      sessionId: event.clientId,
      timestamp: event.timestamp,
      pageUrl: getPageUrl(event),
      source: 'shopify_pixel',
      currency: checkout?.totalPrice?.currencyCode,
      value: toNumber(lineItem?.finalLinePrice?.amount),
      quantity: lineItem?.quantity,
      orderId: checkout?.order?.id ? String(checkout.order.id) : undefined,
      meta: {
        variantId: variant?.id ? String(variant.id) : null,
        variantTitle: variant?.title ?? null,
        productUrl: product?.url ?? null,
        vendor: product?.vendor ?? null
      }
    });
  });
});
