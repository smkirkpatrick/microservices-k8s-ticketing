#!/bin/sh

CWD="$(pwd)"
echo "CWD: $CWD"

declare -a NODE_SERVICES=(
"common"
"nats-test"
"payments"
"tickets"
"auth"
"expiration"
"client"
"orders"
);

for SERVICE in "${NODE_SERVICES[@]}"
do
  echo "Audit: $SERVICE"
  cd $SERVICE
  npm audit fix
  cd $CWD
done

