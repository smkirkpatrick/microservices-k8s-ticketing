import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import {
  OrderCancelledEvent,
  OrderStatus,
} from '@smkirkpatrick-ticketing/common';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'ABC',
    price: 99,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not overwrite a completed order', async () => {
  const { listener, order, data, msg } = await setup();
  order.set({ status: OrderStatus.Complete });
  await order.save();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    // listener will throw Error because version on event
    // will not match the lookup after the order was
    // updated to complete. Should we ack in this case
    // if the order is in a final state?
    // BUT we won't know the state of the order because
    // the lookup will fail because of the version mismatch
    // ...hrm...
  }

  // This will pass, but then this event will keep being retransmitted
  // until it gives up...
  expect(msg.ack).not.toHaveBeenCalled();

  const updatedOrder = await Order.findById(data.id);

  // This is correct, though. The order should be left in Complete state.
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});
