---
permalink: getting-started-isp-ixp
title: "Getting Started: ISP and IXP Staff"
chapter: Getting Started
chapterOrder: 1
order: 5
status: draft
description: A guide for ISP engineers, network operators, and IXP staff who want to understand M-Lab data from their networks, host a measurement node, or use M-Lab for network diagnostics and performance benchmarking.
tags: [getting-started, node-operations, data-access, network-operations]
difficulty: intermediate
---

M-Lab sits at the intersection of your network and the public internet, running standardized tests from measurement points at internet exchange facilities worldwide. For ISPs and IXPs, M-Lab data offers a window into how your customers experience your network — and hosting a node puts that measurement capacity directly in your infrastructure.

This guide covers the three main ways ISP and IXP staff engage with M-Lab: understanding how tests work, reading M-Lab data about your network, and hosting your own node.

## Understanding What M-Lab Measures on Your Network

M-Lab runs active measurements — tests that generate real traffic — so the data reflects what your customers actually experience when using M-Lab-based speed tests (which are embedded in many ISP portals, apps, and platforms).

- [Welcome to M-Lab: Open Internet Measurement](/docs/welcome-to-mlab) — platform overview
- [How M-Lab Measures Internet Speed: NDT7 and MSAK](/docs/test-ndt) — what NDT7 and MSAK actually measure and how to interpret the numbers
- [NDT (Network Diagnostic Tool)](/docs/test-ndt) — the primary test; uses a single TCP stream, reports download/upload throughput, minimum RTT, and loss rate. Includes notes on M-Lab-managed vs. Host-Managed server distinctions.
- [MSAK (Measurement Swiss-Army Knife)](/docs/test-msak) — configurable multi-stream test; powers the official M-Lab speed test at speed.measurementlab.net
- [Beyond Speed: Understanding Internet Quality Metrics](/docs/internet-quality-beyond-speed) — why latency under load and packet loss matter as much as throughput for user experience

## Viewing Your Network's Data in BigQuery

Every test run against an M-Lab server includes the client's IP address and ASN annotations. You can filter BigQuery queries to your ASN to see how M-Lab users on your network are performing.

- [Setting Up Free BigQuery Access](/docs/getting-started-bigquery) — register for free query access
- [Getting Started with M-Lab Data in BigQuery](/docs/getting-started-bigquery) — first queries and schema overview
- [M-Lab Network Annotations: Geolocation, ASNs, and What They Mean](/docs/mlab-annotations-explained) — how ASN annotations work and their reliability

**Sample query — performance summary for your ASN:**

<!-- sqltest -->
```sql
-- Performance of your ASN 
SELECT
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(50)], 2) AS median_download_mbps,
  ROUND(APPROX_QUANTILES(a.MinRTT, 100)[OFFSET(50)], 2)             AS median_rtt_ms,
  COUNT(*) AS test_count
FROM `measurement-lab.ndt.ndt7_union`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND client.Network.ASNumber = 12345
  AND a.MeanThroughputMbps > 0
```

Replace `<YOUR_ASN>` with your Autonomous System Number.

## Network Path Data

M-Lab collects a traceroute from every M-Lab server to every client IP for every test. This gives you data on the routing paths between M-Lab measurement points and your customers:

- [Traceroute — M-Lab Core Service](/docs/core-service-traceroute) — how M-Lab's scamper-based MDA traceroute works and how to access the data
- [M-Lab Traceroute Data: Network Paths and Routing Analysis](/docs/core-service-traceroute) — common uses of traceroute data for routing analysis and topology research
- [Reverse Traceroute](/docs/test-reverse-traceroute) — measures the path *back* to the client (the direction you can't normally see from a speed test server); paired with ~25% of NDT tests and available in BigQuery

Traceroute data can help you identify where in the path latency or packet loss is occurring — whether within your network, at a peering point, or beyond.

## TCP-Level Diagnostics

- [TCP INFO — M-Lab Core Service](/docs/core-service-tcp-info) — detailed kernel-level TCP socket statistics polled throughout each connection. Useful for diagnosing congestion control behavior, buffer sizing, and retransmit patterns at scale.
- [Packet Headers (PCAP) — M-Lab Core Service](/docs/core-service-packet-headers) — per-flow packet header captures, accessible via GCS by UUID. Useful for deep-dive investigation of specific connections.

## Hosting an M-Lab Node (BYOS Program)

The **Bring Your Own Server** program lets ISPs and IXPs host M-Lab measurement nodes on their own infrastructure. Benefits:

- Tests from your region are served by your node, generating high-quality local data
- Your network appears in M-Lab's global measurement infrastructure
- All measurements from your node are published as open data
- IXPs hosting nodes provide measurement capability to all member ISPs

- [Running Your Own M-Lab Node: The BYOS Program](/docs/byos-overview) — requirements, deployment process, and what hosting entails
- [FAQ: Required Ports for M-Lab Nodes](/docs/required-ports) — firewall and routing requirements
- [FAQ: Checking Node Probability and Status](/docs/checking-node-probability) — how to verify your node is registered, active, and receiving traffic via the Locate API
- [FAQ: Docker Compose Troubleshooting — Register Node Issues](/docs/register-node-troubleshooting) — common registration problems and solutions
- [FAQ: Docker BYOS Monitoring and Logging](/docs/docker-byos-monitoring-logging) — how to monitor a running node
- [FAQ: Environment File Path Issues](/docs/env-file-path-issues) — configuration troubleshooting

**Node hardware minimums:** 4 CPU cores, 8 GB RAM, 50 GB SSD, 1 Gbps connectivity. 10 Gbps and 8+ cores recommended for accurate high-speed measurements.

## Checking Test Rate Limits

M-Lab enforces rate limits to protect data integrity and prevent bulk automated testing from distorting population statistics:

- [FAQ: Test Rate Limits](/docs/test-rate-limits) — current limits and what to do if you need higher throughput for network testing purposes

## Understanding WeHe and Traffic Differentiation

[WeHe](/docs/test-wehe) detects application-specific throttling by comparing throughput for real app traffic versus randomized (bit-inverted) traffic. A positive detection requires a statistically significant difference between the two — not just any throughput variation.

WeHe is a **client-initiated** test run by end users, not by network operators. ISPs cannot run WeHe against their own network. However, understanding WeHe's methodology helps operators:

- Distinguish whether legitimate QoS policies (e.g., rate-limiting video at peak hours across all traffic equally) would produce a positive WeHe result (they generally would not, since WeHe compares app traffic vs. bit-inverted traffic of the same size)
- Understand what customers running WeHe on your network are measuring and how to interpret reported detections

## Visualization

- [M-Lab Observatory](https://viz.measurementlab.net) — pre-built dashboards for ISP comparisons, filterable by ASN and region. No SQL required.

## Contact and Community

- Email [support@measurementlab.net](mailto:support@measurementlab.net) for questions about BYOS, your network's data, or technical issues
- The [M-Lab Discuss group](https://groups.google.com/a/measurementlab.net/g/discuss) is the primary community forum and is required for free BigQuery access

