import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@smkirkpatrick-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
