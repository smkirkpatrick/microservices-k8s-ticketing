import Link from 'next/link';

// Can only use the useRequest "hook" from within a React component and cannot
// do so during server-side rendering of component.
// The Component is rendered once on the server, but we don't have access to
// any lifecycle events and can't wait for external requests to resolve. That's
// why all server-side data MUST be fetched first from getInitialProps()
const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

// Have to use axios directly because this is a plain function, useRequest hook
// can only be used within a React component from the client.
// getInitialProps() *is still called* from within the browser when navigating
// from one page to another while in the app (SPA).

// Page-level getInitialProps no longer get invoked when getInitialProps is
// used at the Custom App level (_app.js)
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
