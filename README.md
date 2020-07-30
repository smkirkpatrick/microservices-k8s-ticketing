# Ticketing microservices toy project

## Bring online from scratch

```
$ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.34.1/deploy/static/provider/cloud/deploy.yaml
$ skaffold dev
```

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
