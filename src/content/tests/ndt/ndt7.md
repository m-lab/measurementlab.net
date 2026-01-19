---
permalink: /tests/ndt/ndt7/
title: "ndt7 Protocol - NDT (Network Diagnostic Tool)"
status: current
parentTest: /tests/ndt/
showInIndex: false
---

# ndt7 Protocol - NDT (Network Diagnostic Tool)

ndt7 is a protocol in [ndt-server](https://github.com/m-lab/ndt-server/tree/master/ndt7/) that uses TCP BBR where available and collects TCP statistics using TCP_INFO. ndt7 test data has been collected since **2020-02-18** using [tcp-info](/tests/tcp-info/) for all TCP metrics.

More details about the ndt7 protocol can be found in the [ndt7 protocol specification on Github](https://github.com/m-lab/ndt-server/blob/master/spec/ndt7-protocol.md). Additional information about the [ndt7 data format](https://github.com/m-lab/ndt-server/blob/master/spec/data-format.md) is also available on Github.

## ndt7 BigQuery Schema

<!-- TODO: inline schema_ndt7resultrow.md -->
