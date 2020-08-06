import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@smkirkpatrick-ticketing/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('token is required'),
    body('orderId').not().isEmpty().withMessage('orderId is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    // TODO: Need a sanity check for order that is already in complete state?
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, // must be in cents
      source: token,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
