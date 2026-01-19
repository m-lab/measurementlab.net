---
permalink: /tests/ndt/ndt5/
title: "ndt5 Data - NDT (Network Diagnostic Tool)"
status: current
parentTest: /tests/ndt/
showInIndex: false
---

# ndt5 Data - NDT (Network Diagnostic Tool)

Since M-Lab's platform upgrade in 2019, the ndt5 protocol continues to support
many NDT clients that used earlier [NDT protocol versions][ndt-evolution].
Measurements from the ndt5 protocol are based on [TCP INFO][tcp-info]
instrumentation.

## Ending Support and Transition to ndt7

As of January 2024, we will no longer support ndt5+raw protocol due to our added support for [admission control](/blog/ndt7-access-tokens) and transition to including [virtual servers](/blog/2022-mlab-to-the-cloud/) in the M-Lab platform. You can read more about about the transition [on our blog](/blog/retiring-ndt5-raw/#ending-support-for-ndt5+raw-protocol-and-mlab-ns).

While support ndt5+ws and ndt5+wss will remain available, **new and existing client integrations are strongly encouraged to use the [ndt7
protocol][ndt7-clients]** for better support, ease of
integration, and client performance.


[ndt-evolution]: /blog/evolution-of-ndt/
[ndt5-server]: https://github.com/m-lab/ndt-server/tree/master/ndt5/
[ndt-server]: https://github.com/m-lab/ndt-server/
[tcp-info]: /tests/tcp-info
[ndt5-storage]: https://console.cloud.google.com/storage/browser/archive-measurement-lab/ndt/ndt5
[ndt5-table]: https://console.cloud.google.com/bigquery?project=measurement-lab&p=measurement-lab&d=ndt&t=ndt5&page=table
[ndt7-clients]: /tests/ndt/#source-code

## ndt5 data in Cloud Storage
* [ndt5 raw data in Cloud Storage][ndt5-storage]

## ndt5 BigQuery Schema

* [ndt5 parsed & annotated dataset in BigQuery][ndt5-table]

<!-- TODO: inline schema_ndt5resultrowv2.md -->
