---
permalink: getting-started-researchers
title: "Getting Started: Researchers"
chapter: Getting Started
chapterOrder: 1
order: 2
status: draft
description: "A curated starting path for academic researchers and data scientists using M-Lab data — covering data access, key datasets, measurement methodology, and common research patterns."
tags: [Getting Started, Research, Data Access]
difficulty: beginner
---

M-Lab's open datasets have been used in hundreds of peer-reviewed publications, government reports, and conference papers. This guide maps out the most useful resources for researchers coming to M-Lab for the first time, or looking to go deeper.

## Start Here

Read these first — they cover the conceptual ground you need before diving into data:

- [Welcome to M-Lab: Open Internet Measurement](/kb/welcome-to-mlab) — what M-Lab is, what it measures, and how the platform works
- [NDT (Network Diagnostic Tool)](/kb/test-ndt) — the flagship dataset: single-stream throughput, latency, loss. Protocol history, BigQuery views, and what the numbers mean.
- [Beyond Speed: Understanding Internet Quality Metrics](/kb/internet-quality-beyond-speed) — latency, loss, working quality, and the IQB framework

## Getting Data Access

- [Getting Started with M-Lab Data in BigQuery](/kb/getting-started-bigquery) — join the M-Lab Discuss group for sponsored free access, run your first queries, schema overview, cost management
- [Analyzing M-Lab Data: A Researcher's Guide](/kb/research-guide) — research patterns, ISP comparison queries, working with raw data, and statistical guidance
- [FAQ: Accessing M-Lab Data Buckets](/kb/accessing-data-buckets) — how to access raw data archives in Google Cloud Storage

## Understanding the Data

Before drawing conclusions, read these:

- [M-Lab Network Annotations: Geolocation, ASNs, and What They Mean](/kb/mlab-annotations-explained) — how geographic and network annotations are applied, their reliability at different scales, and how to improve spatial precision
- [FAQ: IP Address Mismatch in M-Lab Data](/kb/ip-address-mismatch) — why the IP address annotated in a test sometimes differs from a client's actual IP, and how to handle it

## Go Deeper: Additional Tests and Datasets

Once you have NDT working, these datasets extend your analysis:

- [MSAK (Measurement Swiss-Army Knife)](/kb/test-msak) — configurable multi-stream throughput and UDP latency; useful for studying how parallelism affects perceived throughput
- [Neubot DASH Streaming Test](/kb/test-neubot-dash) — adaptive video streaming emulation; measures network quality from a video player's perspective
- [WeHe — Traffic Differentiation Detection](/kb/test-wehe) — detects application-specific throttling using controlled traffic replays and KS statistical tests
- [Reverse Traceroute](/kb/test-reverse-traceroute) — reconstructs the network path from M-Lab server back to client (the direction standard traceroute can't see); paired with ~25% of NDT tests

## Go Deeper: Core Infrastructure Data

These datasets are collected automatically alongside every test:

- [Traceroute — M-Lab Core Service](/kb/core-service-traceroute) — forward path from M-Lab server to client for every connection; one of the world's largest longitudinal routing datasets. Includes research applications, joining with NDT, data volume guidance.
- [TCP INFO — M-Lab Core Service](/kb/core-service-tcp-info) — kernel-level TCP socket statistics polled throughout each connection; underlies NDT's RTT and loss metrics
- [Packet Headers (PCAP) — M-Lab Core Service](/kb/core-service-packet-headers) — per-flow packet header captures; useful for sub-RTT TCP behavior analysis

## Key External Resources

- [M-Lab Publications](https://www.measurementlab.net/publications/) — peer-reviewed papers, regulatory filings, and presentations using M-Lab data
- [Internet Quality Barometer (IQB) Framework](https://www.measurementlab.net/blog/iqb/) — M-Lab's composite quality metric framework. Full [report](https://www.measurementlab.net/publications/IQB_report_2025.pdf) and [executive summary](https://www.measurementlab.net/publications/IQB_executive_summary_2025.pdf) available.
- [Reverse Traceroute Tutorial](https://www.measurementlab.net/blog/revtr_tutorial/) — hands-on worked example joining RevTr and NDT data in BigQuery
- [M-Lab Data Schema Repository](https://github.com/m-lab/etl-schema) — authoritative BigQuery schema definitions
- [NDT Unified Views Example Queries](https://www.measurementlab.net/tests/ndt/views/examples) — official query examples
- [M-Lab Observatory](https://viz.measurementlab.net) — pre-built visualization dashboards for ISP and geographic comparisons

## Data Citation

When publishing work that uses M-Lab data, cite the specific dataset used:

- NDT: *The M-Lab NDT Data Set, \<date range\>. https://measurementlab.net/tests/ndt*
- Traceroute: *The M-Lab Traceroute Dataset, \<date range\>. https://measurementlab.net/tests/traceroute*
- WeHe: *A large-scale analysis of deployed traffic differentiation practices. https://dl.acm.org/doi/abs/10.1145/3341302.3342092*

## Community

M-Lab hosts a [discuss mailing list](https://groups.google.com/a/measurementlab.net/g/discuss) (also required for free BigQuery access), monthly community calls, and an annual hackathon. Email [support@measurementlab.net](mailto:support@measurementlab.net) for research questions or collaborations.

<!-- FIXME: Add link to "Statistical Pitfalls in M-Lab Analysis" article once created (selection bias, test population, temporal sampling). -->
<!-- FIXME: Add link to "Working with M-Lab GCS Raw Data in Python" article once created. -->
