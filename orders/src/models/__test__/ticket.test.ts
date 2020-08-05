import mongoose from 'mongoose';
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 5,
    version: 0,
  });

  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10, version: 1 });
  secondInstance!.set({ price: 15, version: 1 });

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
    version: 0,
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  ticket.set({ price: 25, version: 1 });
  await ticket.save();
  expect(ticket.version).toEqual(1);

  ticket.set({ price: 30, version: 2 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
