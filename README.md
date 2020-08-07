# Ticketing microservices toy project

## Need to implement in actual project

Course project does not implement a solution for ensuring data consistency between service database and published events. If a service will be publishing events that can not be lost (such as monetary transactions), additional robustness will be needed.

Events that need to be published should be written to a separate journal (database table / SQS queue / somewhere). The event content should be included as well as a status (i.e. Sent?). Some external process or part of the service should then be responsible for processing this event journal to ensure that the event is successfully published. Q: How to scale that event processing? Limited to a single process unless it is somehow safe to have multiple processes pulled pending events to publish to NATS...

For immutable records (like a transaction), could potentially include a `published_at` field on the record to help cut down on duplicate data being saved to the db. However, for a mutable entity - such as a `post` that can be edited or updated - a separate record for each event would be needed if each change needs to be published to ensure consistent behavior elsewhere in the platform. The events become an audit trail of sorts for changes made to an entity over time.

Ref: [Handling Publish Failures](https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19485352#questions)

### Digital Ocean Load Balancer

There is a bug that needs to be worked around in the ingress-nginx manifest: [Digital Ocean Bug](https://github.com/digitalocean/digitalocean-cloud-controller-manager/blob/master/docs/controllers/services/examples/README.md#accessing-pods-over-a-managed-load-balancer-from-inside-the-cluster)

Also, we did not set up this load balancer to use HTTPS and that will be required otherwise.

### Database

*Optimistic Concurrency Control* for versioning records automatically.

## Bring online from scratch

Best to build and push the individual service images to your id on docker hub:

```
$ cd auth
$ docker build -t smkirkpatrick/ticketing-auth .
$ docker push smkirkpatrick/ticketing-auth
```

Rinse and repeat for each service.

```
$ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
$ kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=<Stripe secret>
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.34.1/deploy/static/provider/cloud/deploy.yaml
$ skaffold dev
```

## CI/CD to Digital Ocean k8s Cluster

Install `doctl` Digital Ocean cli tool:

```
$ brew install doctl
```

Visit [Applications & API](https://cloud.digitalocean.com/account/api/tokens?i=8d92cf) dashboard and generate a *Personal access token* to use to initialize the DO cli:

```
$ doctl auth init
# Provide the PAT when prompted
```

Configure the Digital Ocean K8S Cluster configuration for `kubectl`:

```
$ doctl kubernetes cluster kubeconfig save ticketing
# "ticketing" was the name that I gave my cluster
```

To list the Kubernetes contexts and switch from local docker for desktop to Digital Ocean cluster:

```
$ kubectl config view
# Find the contexts section

$ kubectl config use-context docker-desktop
$ kubectl get pods # <- lists pods running on local machine

# Switch to DO cluster context
$ kubectl config use-context do-nyc1-ticketing
$ kubectl get pods # <- lists pods running on Digital Ocean cluster 
```

Need to create the cluster secrets for the Digital Ocean cluster:

```
$ kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=<stripe key>
$ uuidgen
7E8DEE10-A581-4895-B5CA-49F08E9808C7
$ kubectl create secret generic jwt-secret --from-literal JWT_KEY=7E8DEE10-A581-4895-B5CA-49F08E9808C7
```

Need to deploy `ingress-nginx` to the Digital Ocean cluster:

```
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.34.1/deploy/static/provider/do/deploy.yaml
```

To check the logs for a pod:

```
$ kubectl get pods
...
auth-depl-5dbb64544-sb4n9   ...
...
$ kubectl logs auth-depl-5dbb64544-sb4n9
```

If a pod refuses to start up, there are a couple of ways to check what's going on:

```
$ kubectl describe pod client-depl-9bbdffbc8-8tv8s
...
Events:
  Type    Reason     Age        From                           Message
  ----    ------     ----       ----                           -------
  Normal  Scheduled  <unknown>  default-scheduler              Successfully assigned default/client-depl-9bbdffbc8-8tv8s to pool-zra9w1j9k-3bi9i
  Normal  Pulling    103s       kubelet, pool-zra9w1j9k-3bi9i  Pulling image "smkirkpatrick/ticketing-client"
  Normal  Pulled     85s        kubelet, pool-zra9w1j9k-3bi9i  Successfully pulled image "smkirkpatrick/ticketing-client"
  Normal  Created    85s        kubelet, pool-zra9w1j9k-3bi9i  Created container client
  Normal  Started    85s        kubelet, pool-zra9w1j9k-3bi9i  Started container client
$ kubectl logs client-depl-9bbdffbc8-8tv8s
```

## NATS test project

To run the `nats-test` toy project, start up the full set up of services (really just to get the NATS Streaming Server pod online). Then you need to use k8s port forwarding to expose 4222 (and 8222) from localhost:

```
$ skaffold dev # in one terminal
$ kubectl get pods
NAME                                 READY   STATUS    RESTARTS   AGE
auth-depl-5fd477987b-kf5p9           1/1     Running   0          133m
auth-mongo-depl-64f5b88f6d-ph5pn     1/1     Running   0          133m
client-depl-6659d89c8-fp86m          1/1     Running   0          133m
nats-depl-5f77864fcd-2ggbm           1/1     Running   0          133m
tickets-depl-6dd94598c9-hszbc        1/1     Running   0          133m
tickets-mongo-depl-6b74cc9bd-6dc8m   1/1     Running   0          133m

# Use the nats-depl pod name from the list of pods for port forwarding
$ kubectl port-forward nats-depl-5f77864fcd-2ggbm 4222:4222 # in 2nd terminal
$ kubectl port-forward nats-depl-5f77864fcd-2ggbm 8222:8222 # in 3rd terminal
```

Now you can spin up the publisher and a couple listeners in separate terminals:

```
# Terminal 1
$ cd nats-test
$ npm install
$ npm run publisher

# Terminal 2
$ cd nats-test
$ npm run listener

# Terminal 3
$ cd nats-test
$ npm run listener
```

In any of the running publisher/listener terminals, you can type `rs` and hit enter to restart the service.

## Docker cleanup

```
$ docker rmi $(docker images | grep smkirkpatrick | grep -v latest | awk 'NR>1 {print $3}')
```

For the following cases:

```
Error response from daemon: conflict: unable to delete 0f4db1997942 (must be forced) - image is referenced in multiple repositories
```

These can be cleaned up with:

```
$ docker images | grep smkirkpatrick | grep -v latest | awk '{print $1 ":" $2}' | xargs docker rmi
```
