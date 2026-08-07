---
permalink: core-service-packet-headers
title: "Packet Headers (PCAP) — M-Lab Core Service"
chapter: Core Services
chapterOrder: 4
order: 2
status: published
description: M-Lab's packet-headers service captures TCP packet headers for every connection on the M-Lab platform, stored as per-flow .pcap files indexed by UUID.
tags: [core-services, data-access, pcap, tcp]
difficulty: advanced
---

The Packet Header Service is an M-Lab core service that runs alongside every hosted measurement test. For every TCP connection that reaches an M-Lab server, it captures the packet headers (not the payload) and saves them as a `.pcap` file. Each file is named after the [UUID](https://github.com/m-lab/uuid) of the TCP flow, making it straightforward to correlate packet captures with their corresponding measurement results.

This service is a passive sidecar: it does not generate any traffic itself and does not affect the measurements. It simply records what arrives.

## What Is Captured

The packet-headers service saves **headers only**, not payload content. This means:

- IP headers (source/destination addresses, TTL, flags)
- TCP headers (sequence numbers, acknowledgment numbers, flags, window size, options)
- Timestamps with sub-millisecond precision

Payload bytes are deliberately excluded to protect user privacy and reduce storage volume. The headers alone are sufficient for TCP behavior analysis — retransmits, congestion signals, window scaling, and timing can all be reconstructed from headers.

**IP address anonymization** is supported via a command-line flag and can be enabled on a per-deployment basis.

## How It Works

The service runs as a separate binary ([packet-headers](https://github.com/m-lab/packet-headers)) on each M-Lab server. It uses a packet capture library (libpcap) to monitor all incoming TCP flows. When a new flow is established, it opens a new `.pcap` file named after the flow's UUID and writes all subsequent packet headers for that flow into the file until the flow closes.

Because file naming is UUID-based, you can take any measurement result from BigQuery (e.g., an NDT test), extract its UUID, and look up the corresponding `.pcap` file directly in GCS.

## Accessing Packet Header Data

### Google Cloud Storage

Packet captures are stored in GCS, organized by the measurement service that generated the connection:

| Service | GCS Path |
|---------|----------|
| NDT | [gs://archive-measurement-lab/ndt/pcap](https://console.cloud.google.com/storage/browser/archive-measurement-lab/ndt/pcap/) |
| Neubot/DASH | [gs://archive-measurement-lab/neubot/pcap](https://console.cloud.google.com/storage/browser/archive-measurement-lab/neubot/pcap/) |
| WeHe | [gs://archive-measurement-lab/wehe/pcap](https://console.cloud.google.com/storage/browser/archive-measurement-lab/wehe/pcap/) |
| Host server | [gs://archive-measurement-lab/host/pcap](https://console.cloud.google.com/storage/browser/archive-measurement-lab/host/pcap/) |

Files are organized by date. To download a specific PCAP for a known NDT test UUID:

```bash
gsutil ls gs://archive-measurement-lab/ndt/pcap/2024/06/01/ | grep <UUID>
gsutil cp gs://archive-measurement-lab/ndt/pcap/2024/06/01/<UUID>.pcap.gz .
```

Then open with Wireshark, tcpdump, or any tool that reads standard `.pcap` format.

### BigQuery

Packet header data is **not published to BigQuery**. Analysis requires working with the raw `.pcap` files in GCS.

## How People Use Packet Header Data

**Deep TCP analysis** — packet captures enable analysis at the sub-RTT level: tracing individual retransmissions, observing congestion window evolution, detecting spurious retransmits, and characterizing buffer sizing.

**Reconstructing congestion events** — when NDT or MSAK reports unexpectedly high loss or low throughput, the corresponding PCAP can show exactly which packets were dropped and when.

**Validating TCP metrics** — tcp-info provides periodic kernel-level statistics; PCAPs provide a complementary view that can validate or extend those statistics with packet-level timing.

**Research requiring raw packet timing** — studies of queuing latency, jitter, or packet reordering require sub-millisecond precision that only packet captures can provide.

**Protocol behavior studies** — researchers studying TCP options (SACK, timestamps, window scaling) or congestion control algorithm behavior use PCAPs to observe these mechanisms in the wild.

<!-- FIXME: Create article on working with M-Lab PCAPs in Python (using scapy or dpkt) with example analysis of retransmit events. -->

## Source Code

- [packet-headers service](https://github.com/m-lab/packet-headers)

## Citing Packet Header Data

> The M-Lab Packet Header Data Set, \<date range used\>. https://measurementlab.net/tests/pcap

## Further Reading

- [TCP INFO — kernel-level TCP statistics (companion dataset)](/kb/core-service-tcp-info)
- [NDT — speed test whose flows are captured](/kb/test-ndt)
<!-- FIXME: add link – "Accessing Data in GCS" -->
- [Traceroute — network path data collected alongside PCAPs](/kb/core-service-traceroute)
