import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set('versionKey', 'version'); // use 'version' instead of default '__v'
ticketSchema.plugin(updateIfCurrentPlugin);
/*
ticketSchema.pre('save', function (done) {
  // 'this' === the document
  // @ts-ignore
  this.$where = {
    // <- typescript types file falls a bit short on $where
    version: this.get('version') - 1,
  };
  // This enables us to customize the way that the version is managed

  done();
});
*/

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  // this can NOT be an arrow func
  // this === the ticket document instance that we just found in the database

  // Run query to look at all orders. Find an order where the
  // ticket is the ticket we just found *and* the order's status
  // is *not* cancelled. If we find an order from that, it means
  // the ticket *is* reserved.
  const existingOrder = await Order.findOne({
    ticket: this, // 'this' is the ticket
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
