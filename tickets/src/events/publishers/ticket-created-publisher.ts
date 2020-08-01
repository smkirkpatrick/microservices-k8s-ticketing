import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@smkirkpatrick-ticketing/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
