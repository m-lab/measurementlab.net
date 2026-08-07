---
permalink: test-msak
title: MSAK (Measurement Swiss-Army Knife)
chapter: Tests
chapterOrder: 3
order: 2
status: published
description: "MSAK is M-Lab's configurable multi-stream throughput and UDP latency measurement service — designed for researchers and developers who need more control than single-stream NDT provides."
tags: [tests, data-access, bigquery, throughput, latency]
difficulty: intermediate
---

MSAK (Measurement Swiss-Army Knife) is a measurement service hosted by M-Lab that implements two measurement protocols: a configurable WebSocket-based throughput protocol and a UDP-based latency protocol. Where [NDT](/docs/test-ndt) is a standardized single-stream bulk transport test, MSAK is designed for cases where researchers need to tune measurement parameters.

MSAK is also the engine behind M-Lab's official speed test at [speed.measurementlab.net](https://speed.measurementlab.net).

## How MSAK Works

### Throughput Protocol

MSAK's throughput protocol is WebSocket-based and supports **multi-stream** tests — running several parallel TCP connections simultaneously. This allows it to measure the aggregate throughput that a connection can sustain across multiple streams, which is closer to how many real applications (browsers, download managers, video platforms) behave.

Configurable parameters include:

- **Number of streams** — how many parallel TCP connections to open
- **Congestion control algorithm** — e.g., BBR or Cubic
- **Test duration** — how long to run the measurement
- **Per-stream byte limit** — cap the data transferred per stream

For most users, the defaults are appropriate. The configurability is intended for researchers designing specific measurement studies.

### UDP Latency Protocol

MSAK also implements a UDP-based latency measurement protocol, distinct from the RTT measurements derived from TCP in NDT. UDP latency can reveal queuing and delay characteristics that TCP-based measurements may mask (since TCP's flow control adapts to congestion).

## What MSAK Measures

Each MSAK throughput test records:

- **Per-stream throughput** over time, including start/end timestamps per stream
- **Aggregate throughput** across all streams
- **TCP socket statistics** (via tcp-info sidecar)
- **Packet captures** (via pcap sidecar)
- **Client IP address** and server site

UDP latency tests record round-trip times and packet loss for a series of UDP probes.

## Privacy and Data Collection

When you run MSAK, your IP address is collected along with measurement results and published publicly. See [M-Lab's Privacy Policy](https://www.measurementlab.net/privacy/).

## Accessing MSAK Data

### BigQuery

MSAK data is available in BigQuery for free. See [Setting Up Free BigQuery Access](/docs/getting-started-bigquery).

Data is in two datasets:

| Dataset | Contents |
|---------|----------|
| `measurement-lab.msak` | Processed/annotated MSAK measurements |
| `measurement-lab.msak_raw` | Raw parsed measurements |

<!-- FIXME: Add example queries for MSAK once schema documentation is published or confirmed. -->

### Raw Data in Google Cloud Storage

Raw MSAK data is available in GCS:

- **Throughput and latency results:** [gs://archive-measurement-lab/autoload/v1/msak](https://console.cloud.google.com/storage/browser/archive-measurement-lab/autoload/v1/msak)
- **Sidecar data** (tcpinfo snapshots and PCAPs): [gs://archive-measurement-lab/msak](https://console.cloud.google.com/storage/browser/archive-measurement-lab/msak)

See Accessing Data in GCS<!-- FIXME: add link for "Accessing Data in GCS" --> for how to download and work with raw archives.

## Running an MSAK Test

- **Browser:** Visit [speed.measurementlab.net](https://speed.measurementlab.net) — it uses MSAK under the hood.
- **Command line:** A standalone Go client is available in the [MSAK GitHub repository](https://github.com/m-lab/msak/).

## How People Use MSAK Data

**Multi-stream throughput research** — comparing multi-stream throughput against single-stream NDT results can reveal how much a connection's apparent capacity depends on parallelism — relevant for understanding real-world application performance.

**Congestion control comparison** — MSAK's ability to configure the CCA (BBR vs. Cubic) allows researchers to study how different algorithms perform across network types.

**Latency under load** — combining MSAK's throughput test with UDP latency measurements allows researchers to characterize bufferbloat and latency degradation under load.

**Platform development** — because MSAK is the test powering M-Lab's official speed test, its data represents the current operational measurement load on the platform.

## Source Code

- [MSAK server & client](https://github.com/m-lab/msak)

## Further Reading

- [NDT — single-stream speed test](/docs/test-ndt)
- [TCP INFO — kernel-level TCP statistics collected alongside MSAK](/docs/core-service-tcp-info)
- [Packet Headers — per-flow PCAPs collected alongside MSAK](/docs/core-service-packet-headers)
- [Setting Up Free BigQuery Access](/docs/getting-started-bigquery)
