import Event from '../models/Event.js';

function isDuplicateKeyError(error) {
  return error?.name === 'MongoServerError' && error?.code === 11000;
}

export function createEventService(EventModel = Event) {
  return {
    async trackEvent(input) {
      const payload = {
        ...input,
        timestamp: input.timestamp ?? new Date()
      };

      try {
        const event = await EventModel.create(payload);

        return {
          created: true,
          deduplicated: false,
          event
        };
      } catch (error) {
        if (!payload.eventId || !isDuplicateKeyError(error)) {
          throw error;
        }

        const existingEvent = await EventModel.findOne({ eventId: payload.eventId }).lean();

        return {
          created: false,
          deduplicated: true,
          event: existingEvent
        };
      }
    }
  };
}

export const eventService = createEventService();
