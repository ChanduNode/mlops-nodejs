#!/bin/sh
set -e
if [ "${MODE:-train}" = "serve" ]; then exec node dist/server.js; fi
dvc pull data/customers.csv
npm run train
