import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from '@smkirkpatrick-ticketing/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    // ^ TODO: refactor into Order object method

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.Complete) {
      order.set({ status: OrderStatus.Cancelled });
      await order.save();
    }

    msg.ack();
  }
}
