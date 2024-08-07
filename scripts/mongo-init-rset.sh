#!/bin/bash

start_mongo() {
    mongod --replSet rs0 --bind_ip_all
}

activate_rs() {
    echo "Waiting for Mongo to start..."
    sleep 5
    echo "INITIATE REPLICA SET"
    mongosh --host mongo <<EOF
rs.initiate()
while (! db.isMaster().ismaster ) { sleep(1000) }
rs.status()
EOF
    echo "MAKE ADMIN USER FOR REPLICA SET"
    mongosh --host mongo admin <<EOF
db.createUser({ user: "root", pwd: "root", roles: [ { role: "root", db: "admin" } ] });
EOF
}

activate_rs &
start_mongo