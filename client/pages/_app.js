import 'bootstrap/dist/css/bootstrap.css';

// Overrides default next.js app component to use for our pages
export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
