---
permalink: /tests/utilization/
title: "Utilization Dataset"
description: "High resolution switch telemetry for each M-Lab server and site uplink."
status: core-service
icon: /src/assets/images/tests/tcpinfo.png
order: 4
showInIndex: false
---

# Utilization Dataset

Since June 2016, M-Lab has collected high resolution switch telemetry for each M-Lab server and site uplink and published it as the `utilization` dataset, with one datatype table: `switch`.

## Utilization Data in Raw Format

Utilization data in raw format can be found in Google Cloud Storage: [https://console.developers.google.com/storage/browser/archive-measurement-lab/utilization/](https://console.developers.google.com/storage/browser/archive-measurement-lab/utilization/).

## Utilization Data in BigQuery

M-Lab parses all _switch_ utilization data into BigQuery, and makes query access available for free by subscription to a Google Group. Find out more about how to get access on our [BigQuery QuickStart page](/data/docs/bq/quickstart/).

BigQuery Tables/Views for Switch Data:

* [measurement-lab.utilization.switch](https://console.cloud.google.com/bigquery?project=measurement-lab&p=measurement-lab&d=utilization&t=switch&page=table)

## Switch BigQuery Schema

<!-- TODO: inline schema_switch.html -->

## Source Code

The switch dataset is produced by the M-Lab Collectd monitoring tool, which can be found on Github: [https://github.com/m-lab/collectd-mlab](https://github.com/m-lab/collectd-mlab).
