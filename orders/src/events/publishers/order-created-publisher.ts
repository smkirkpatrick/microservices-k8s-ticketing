import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@smkirkpatrick-ticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
