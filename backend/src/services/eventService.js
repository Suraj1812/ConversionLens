import { eventRepository } from '../repositories/eventRepository.js';

function isDuplicateKeyError(error) {
  return error?.code === '23505';
}

export function createEventService(repository = eventRepository) {
  return {
    async trackEvent(input) {
      const payload = {
        ...input,
        timestamp: input.timestamp ?? new Date()
      };

      try {
        const event = await repository.insertEvent(payload);

        return {
          created: true,
          deduplicated: false,
          event
        };
      } catch (error) {
        if (!payload.eventId || !isDuplicateKeyError(error)) {
          throw error;
        }

        const existingEvent = await repository.findByEventId(payload.eventId);

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
