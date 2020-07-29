import buildClient from '../api/build-client';

// Can only use the useRequest "hook" from within a React component and cannot
// do so during server-side rendering of component.
// The Component is rendered once on the server, but we don't have access to
// any lifecycle events and can't wait for external requests to resolve. That's
// why all server-side data MUST be fetched first from getInitialProps()
const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

// Have to use axios directly because this is a plain function, useRequest hook
// can only be used within a React component from the client.
// getInitialProps() *is still called* from within the browser when navigating
// from one page to another while in the app (SPA).

// Page-level getInitialProps no longer get invoked when getInitialProps is
// used at the Custom App level (_app.js)
LandingPage.getInitialProps = async (context) => {
  console.log('LANDING PAGE!');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
