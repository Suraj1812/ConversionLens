import { describe, expect, it, vi } from 'vitest';
import { calculateFunnelFromEvents, createAnalyticsService } from '../src/services/analyticsService.js';
import { createEventService } from '../src/services/eventService.js';
import { trackEventSchema } from '../src/validation/events.js';

describe('trackEventSchema', () => {
  it('accepts a valid event payload', () => {
    const result = trackEventSchema.safeParse({
      eventId: 'evt_12345678',
      eventType: 'view',
      productId: '123',
      productTitle: 'Classic Hoodie',
      sessionId: 'session_1',
      source: 'shopify_pixel'
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid event payload', () => {
    const result = trackEventSchema.safeParse({
      eventType: 'view'
    });

    expect(result.success).toBe(false);
  });
});

describe('calculateFunnelFromEvents', () => {
  it('counts only sequential view to cart to purchase progressions', () => {
    const funnel = calculateFunnelFromEvents([
      { sessionId: 'a', eventType: 'view' },
      { sessionId: 'a', eventType: 'add_to_cart' },
      { sessionId: 'a', eventType: 'purchase' },
      { sessionId: 'b', eventType: 'view' },
      { sessionId: 'b', eventType: 'purchase' },
      { sessionId: 'c', eventType: 'view' },
      { sessionId: 'c', eventType: 'add_to_cart' }
    ]);

    expect(funnel.steps[0].count).toBe(3);
    expect(funnel.steps[1].count).toBe(2);
    expect(funnel.steps[2].count).toBe(1);
    expect(funnel.overallConversionRate).toBe(33.33);
  });
});

describe('createAnalyticsService', () => {
  it('returns product analytics with conversion and abandonment details', async () => {
    const aggregate = vi.fn().mockResolvedValue([
      {
        productId: 'p1',
        eventType: 'view',
        productTitle: 'Product One',
        totalCount: 10,
        uniqueSessions: 8
      },
      {
        productId: 'p1',
        eventType: 'add_to_cart',
        productTitle: 'Product One',
        totalCount: 4,
        uniqueSessions: 4
      },
      {
        productId: 'p1',
        eventType: 'purchase',
        productTitle: 'Product One',
        totalCount: 2,
        uniqueSessions: 2
      }
    ]);

    const analyticsService = createAnalyticsService({
      aggregate
    });

    const result = await analyticsService.getProductStats({ windowDays: 30, limit: 5 });

    expect(aggregate).toHaveBeenCalled();
    expect(result.topViewed[0].productId).toBe('p1');
    expect(result.bestConverting[0].conversionRate).toBe(25);
    expect(result.mostAbandoned[0].abandonmentCount).toBe(2);
  });
});

describe('createEventService', () => {
  it('deduplicates duplicate event IDs', async () => {
    const EventModel = {
      create: vi.fn().mockRejectedValue({
        name: 'MongoServerError',
        code: 11000
      }),
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          eventId: 'evt_duplicate_123'
        })
      })
    };

    const eventService = createEventService(EventModel);
    const result = await eventService.trackEvent({
      eventId: 'evt_duplicate_123',
      eventType: 'purchase',
      productId: 'p1',
      sessionId: 'session_1'
    });

    expect(result.created).toBe(false);
    expect(result.deduplicated).toBe(true);
    expect(result.event.eventId).toBe('evt_duplicate_123');
  });
});
