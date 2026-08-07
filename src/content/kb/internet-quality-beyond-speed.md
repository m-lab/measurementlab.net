---
permalink: internet-quality-beyond-speed
title: "Beyond Speed: Understanding Internet Quality Metrics"
chapter: Understanding Measurement
chapterOrder: 2
order: 2
status: draft
description: Why download speed alone is an incomplete picture of internet performance, and how M-Lab measures latency, packet loss, and working internet quality.
tags: [internet-quality, measurement]
difficulty: beginner
---

"How fast is your internet?" is the wrong question. Speed is one dimension of a multi-dimensional problem. M-Lab and the broader internet measurement community have been developing richer frameworks for understanding what makes an internet connection work well — or not.

## Why Speed Isn't Enough

Download throughput matters for large file transfers and video streaming, but many everyday internet experiences are more sensitive to other metrics:

| Use case | Most important metric |
|----------|-----------------------|
| Video calls (Zoom, Teams) | Latency + jitter + packet loss |
| Gaming | Latency + jitter |
| Web browsing | Latency (time to first byte) |
| VoIP | Packet loss + jitter |
| File download | Throughput |
| 4K streaming | Throughput + buffering |

A 1 Gbps connection with 200 ms latency or 2% packet loss will perform worse for video calls than a 50 Mbps connection with 10 ms latency and 0% loss.

## Key Quality Metrics

### Latency (Round-Trip Time)

**Minimum RTT** is the best-case round-trip time between your device and the measurement server — essentially the speed-of-light delay plus processing. It's a property of the physical path, not congestion.

**Working latency** (sometimes called "loaded latency") is the round-trip time during a data transfer. When a connection is busy sending or receiving data, latency often spikes dramatically — this is the real-world experience of lag during uploads or video calls.

In M-Lab NDT7 data:
<!-- sqltest -->
```sql
-- NDT7 Data Query
SELECT
  a.MinRTT,         -- best-case (unloaded) latency in ms
  a.MeanThroughputMbps
FROM `measurement-lab.ndt.ndt7_union`
WHERE date = '2024-06-01'
```

### Packet Loss

**`a.LossRate`** in NDT7 data measures the fraction of packets retransmitted during the test, as a proxy for packet loss. Values above 1–2% indicate significant congestion or link-layer errors.

### Jitter

Jitter is variation in packet delay — even if average latency is low, high jitter makes real-time applications like video calls unreliable. NDT7 doesn't directly measure jitter; MSAK measurements include jitter estimates.

## The Internet Quality Barometer (IQB)

In 2024–2025, M-Lab began developing the **Internet Quality Barometer (IQB)** — a composite metric that combines throughput, latency under load, and packet loss into a single quality score. The IQB is designed to:

- Capture "working quality" rather than peak speed
- Be comparable across different measurement methodologies
- Be meaningful for end users and policymakers, not just engineers
- Account for different use cases (video, gaming, browsing)

The IQB builds on the "responsiveness" concept from Apple's RPM test and BITAG's working latency research. M-Lab is working to publish IQB methodology and include IQB scores in BigQuery.

<div class="callout callout--note">
<span class="callout-icon">ℹ️</span>
<div class="callout-body"><p>See the M-Lab blog post <a href="https://measurementlab.net/blog/iqb-prototype-v1">Internet Quality Barometer Prototype v1</a> for the current methodology.</p></div>
</div>

## Rate Limits and Test Integrity

M-Lab enforces a limit of **40 tests per day per IP address**. This prevents bulk automated testing that would distort population-level statistics. If you need to run frequent tests for monitoring purposes, consider:

- Running a private NDT7 server (see [run-a-private-ndt-server](https://measurementlab.net/blog/run-a-private-ndt-server))
- Using MSAK which has separate rate limits
- Aggregating your analysis over longer time windows

See the [Test Rate Limits FAQ](#) for details.

## Geolocation and What It Means for Quality Analysis

M-Lab uses MaxMind GeoLite2 to annotate measurements with geographic information. Important caveats:

- Geolocation is at **city level at best** — coordinates represent the city centroid, not the user's location
- **Privacy** is the reason for coarse precision — M-Lab data is public, so fine-grained location data would expose users
- **ASN annotations** are more reliable than geolocation for identifying the network a user is on
- ISP-level analysis (using `client.Network.ASNumber`) is generally more reliable than sub-city geographic analysis

See [Geolocation Limitations in M-Lab Data](#) for how to handle these constraints in analysis.

## What "Good" Looks Like

Rough benchmarks for residential broadband:

| Metric | Adequate | Good | Excellent |
|--------|----------|------|-----------|
| Download | 25 Mbps | 100 Mbps | 1 Gbps |
| Upload | 3 Mbps | 20 Mbps | 500 Mbps |
| Latency (idle) | <50 ms | <20 ms | <10 ms |
| Packet loss | <1% | <0.1% | ~0% |

These benchmarks vary by use case. The FCC uses 25/3 Mbps as a minimum definition; the BEAD program uses 100/20 Mbps as the funded build-out target.

---

<!-- TODO: Add section on the BITAG (Broadband Internet Technical Advisory Group) working latency report and its influence on M-Lab's IQB work. Add worked example of comparing loaded vs. unloaded latency using MSAK data. Include a chart showing how packet loss affects video call quality (MOS score vs. loss rate). -->
