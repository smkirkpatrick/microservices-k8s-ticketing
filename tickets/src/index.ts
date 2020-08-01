import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';

import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('Missing JWT_KEY environment variable');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    console.log('Establish connection to NATS...');
    await natsWrapper.connect('ticketing', 'laskdfj', 'http://nats-srv:4222');
    // ^ clusterId is defined by the -cid param in the nats-depl.yaml

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    console.log('Establish connection to Mongo...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!');
  });
};

start();
