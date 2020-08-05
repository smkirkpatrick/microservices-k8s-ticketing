import mongoose from 'mongoose';
import { Ticket } from '../ticket';
import { Order } from '../order';
import { OrderStatus } from '@smkirkpatrick-ticketing/common';

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 5,
  });

  // Save the ticket to the database
  await ticket.save();

  // Create an order for the ticket
  const order = Order.build({
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // fetch the order twice
  const firstInstance = await Order.findById(order.id);
  const secondInstance = await Order.findById(order.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ status: OrderStatus.AwaitingPayment });
  secondInstance!.set({ status: OrderStatus.Cancelled });

  // save the first fetched ticket - should work
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    // jest expect() toThrow() didn't work well with typescript
    return done();
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  expect(order.version).toEqual(0);

  await order.save();
  expect(order.version).toEqual(1);

  await order.save();
  expect(order.version).toEqual(2);
});
