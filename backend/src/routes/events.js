import { Router } from 'express';
import { createHttpError } from '../lib/http.js';
import { trackEventSchema } from '../validation/events.js';

function parseEvent(body) {
  const parsed = trackEventSchema.safeParse(body);

  if (!parsed.success) {
    throw createHttpError(400, 'Invalid event payload', parsed.error.flatten());
  }

  return parsed.data;
}

export function createEventsRouter(eventService) {
  const router = Router();

  router.post('/track-event', async (req, res, next) => {
    try {
      const payload = parseEvent(req.body);
      const result = await eventService.trackEvent(payload);

      return res.status(result.created ? 201 : 200).json({
        message: result.created ? 'Event stored successfully' : 'Duplicate event ignored',
        deduplicated: result.deduplicated,
        eventId: result.event?.eventId || payload.eventId || null
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

export default createEventsRouter;
