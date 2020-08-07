import axios from 'axios';

const buildClient = ({ req }) => {
  // Need to reach across k8s Namespace to reach the ingress-nginx namespace
  // from our "default" namespace for server-side requests.
  // Format: http://<service>.<namespace>.svc.cluster.local
  // We could use an External Name Service k8s object, but we will not for now.
  if (typeof window === 'undefined') {
    // We are on the server!
    // Send requests to ingress-nginx.
    // Must set the Host header so that the nginx routing rules can kick
    // in for the intra-service request to the ingress-nginx namespace
    // resource.
    return axios.create({
      baseURL: process.env.INGRESS_NGINX_URL,
      headers: req.headers,
    });
  } else {
    // We are on the browser!
    // Naked requests to our api will work.
    return axios.create({
      baseURL: '',
    });
  }
};

export default buildClient;
