import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@smkirkpatrick-ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
