import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@smkirkpatrick-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
