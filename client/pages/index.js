import axios from 'axios';

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
LandingPage.getInitialProps = async ({ req }) => {
  // Need to reach across k8s Namespace to reach the ingress-nginx namespace
  // from our "default" namespace
  // Format: http://<service>.<namespace>.svc.cluster.local
  // We could use an External Name Service k8s object, but we will not for now.
  if (typeof window === 'undefined') {
    // We are on the server!
    // Send requests to ingress-nginx.
    // Must set the Host header so that the nginx routing rules can kick
    // in for the intra-service request to the ingress-nginx namespace
    // resource.
    const { data } = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        headers: req.headers,
      }
    );
    return data;
  } else {
    // We are on the browser!
    // Naked requests to our api will work.
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }
  return {};
};

export default LandingPage;
