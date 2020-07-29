import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// Overrides default next.js app component to use for our pages
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />;
    </div>
  );
};

// *Custom App* component gets different args to getInitialProps vs a page.
// Have to use axios directly because this is a plain function, useRequest hook
// can only be used within a React component from the client.
// getInitialProps() *is still called* from within the browser when navigating
// from one page to another while in the app (SPA).
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // Need to do this to run getInitialProps on the page Components that is
  // being rendered.
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
