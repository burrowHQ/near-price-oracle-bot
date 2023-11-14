#!/bin/bash
set -e

export NODE_ENV=mainnet
# export PRINT_DEBUG=true
# export SOURCE_ALARM_FILTER=cryptocom
# export PRICE_ZERO_ALARM_FILTER=chainlink
# export PRICE_ANOMALY_ALARM_FILTER=chainlink

cd $(dirname "$0")
mkdir -p logs

while :
do
  DATE=$(date "+%Y_%m_%d")
  date | tee -a logs/monitor_logs_$DATE.txt
  # TODO: Update your path to the node binary if necessary
  node price_source_monitor.js 2>&1 | tee -a logs/monitor_logs_$DATE.txt
  sleep 5
done
