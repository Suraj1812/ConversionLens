# Shoplytics Shopify Integration

Assumption: you already have a Shopify development store using Dawn with products and a public URL for the Shoplytics backend.

## Recommended production setup

Use Shopify Customer Events with a custom pixel for first-party event delivery to Shoplytics.

This approach is cleaner than scattering manual tracking code across theme files, and it works with Shopify's standard customer events:

- `product_viewed`
- `product_added_to_cart`
- `checkout_completed`

## 1. Expose the backend publicly

Your Shopify storefront cannot send events to `http://localhost:4000`.

Use one of these:

- a deployed API domain such as `https://api.yourdomain.com`
- a tunnel such as Cloudflare Tunnel or ngrok for development

Your custom pixel must send events to:

```text
https://your-api-domain.com/track-event
```

## 2. Add the Shoplytics custom pixel

Open Shopify Admin:

1. `Settings`
2. `Customer events`
3. `Add custom pixel`
4. Paste the contents of [shopify/shoplytics.custom-pixel.js](/Users/surajsingh/Desktop/ConversionLens/shopify/shoplytics.custom-pixel.js)
5. Replace `https://your-api-domain.com/track-event` with your real API URL
6. Save and connect the pixel

## 3. Configure Meta Pixel and Google Analytics 4

For production, use Shopify's official integrations or your existing marketing stack for ad-platform tracking:

- Meta Pixel: configure through the Meta and Facebook sales channel or your approved tag setup
- GA4: configure through the Google & YouTube channel or GTM

Let Shoplytics handle first-party analytics ingestion, and let platform-native integrations handle marketing attribution and consent-aware ad tracking.

## 4. Event payload behavior

The Shoplytics custom pixel sends:

- `eventId`: Shopify customer event ID for idempotency
- `eventType`: `view`, `add_to_cart`, or `purchase`
- `productId`
- `productTitle`
- `sessionId`: Shopify `clientId`
- `timestamp`
- optional commerce context such as `currency`, `value`, `quantity`, and `orderId`

Purchase events are sent once per purchased line item and use an indexed event ID so the backend can deduplicate safely.

## 5. Test checklist

1. Open a product page in the storefront
2. Add the product to cart
3. Complete a test checkout
4. Confirm new event rows appear in PostgreSQL
5. Open the Shoplytics dashboard and verify:
   - overview counts increase
   - funnel counts move from view to cart to purchase
   - product analytics show views, conversions, and abandonment

## Notes

- If you still want the earlier manual-theme approach for interviews or demos, you can adapt the current backend payload shape easily.
- The production path in this repo is the custom pixel because it is easier to maintain and aligns better with modern Shopify customer event tracking.
