import buildClient from '../api/build-client';

// Can only use the useRequest "hook" from within a React component and cannot
// do so during server-side rendering of component.
// The Component is rendered once on the server, but we don't have access to
// any lifecycle events and can't wait for external requests to resolve. That's
// why all server-side data MUST be fetched first from getInitialProps()
const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Landing Page</h1>;
};

// Have to use axios directly because this is a plain function, useRequest hook
// can only be used within a React component from the client.
// getInitialProps() *is still called* from within the browser when navigating
// from one page to another while in the app (SPA).
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
