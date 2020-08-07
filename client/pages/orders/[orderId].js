import { useEffect, useState } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft(); // call it right away once
    const timerId = setInterval(findTimeLeft, 1000);

    // returning a function will be invoked when navigating away
    return () => {
      clearInterval(timerId);
    };
  }, []); // [] means only run once when page loaded

  if (timeLeft < 0) {
    return (
      <div>
        {errors}
        <div>Order expired.</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      <div>Time left to pay: {timeLeft} seconds</div>
      {errors}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_XzDCM2MG64QzN2guDffCgvGymQOLN"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
