---
permalink: test-ndt
title: NDT (Network Diagnostic Tool)
chapter: Tests
chapterOrder: 3
order: 1
status: draft
description: "NDT is M-Lab's flagship speed test — it measures single-stream download and upload throughput, latency, and provides TCP-level diagnostics for every test."
tags: [Tests, Data Access, BigQuery, Speed Test]
difficulty: beginner
---

NDT (Network Diagnostic Tool) is M-Lab's most widely used measurement test. It measures a connection's capacity for "bulk transport" — what most people know as download and upload speed — and records detailed TCP statistics that allow researchers to diagnose what is limiting performance. NDT has been hosted on M-Lab since the platform's founding in 2009 and is the backbone of [speed.measurementlab.net](https://speed.measurementlab.net).

## How NDT Works

NDT runs a single TCP stream from the client to the M-Lab server (upload) and from the server to the client (download), measuring how fast data can be transferred under real network conditions. Unlike simpler speed tests that open many parallel connections to maximize throughput, NDT deliberately uses a single stream. This design is sensitive to the network path's actual capacity and to any congestion or impairment along the way — making it useful for diagnosing problems, not just reporting headline numbers.

**Step by step:**

1. Your client queries the [Locate API](https://locate.measurementlab.net) to find the nearest M-Lab server
2. The server streams data to your client (download) for ~10 seconds
3. Your client streams data to the server (upload) for ~10 seconds
4. TCP kernel statistics are sampled throughout via the `tcp_info` socket API
5. Results are uploaded to M-Lab's data pipeline and archived within ~24 hours

You can query the Locate API directly to see which servers are available near a given point:

```bash
curl "https://locate.measurementlab.net/v2/nearest/ndt/ndt7"
```

During each test, the M-Lab server collects detailed TCP statistics from the kernel (via tcp-info), capturing metrics like congestion window size, retransmit rates, and minimum RTT. These are recorded alongside the throughput result and stored permanently.

### Protocol Versions (Datatypes)

NDT has evolved over time. M-Lab uses the term "datatype" to refer to each protocol generation:

**ndt7** (February 2020 – present, recommended) uses WebSocket over standard HTTP/S ports (80 and 443), making it work through most firewalls. It relies on TCP BBR congestion control where available, falling back to Cubic. ndt7 is the current standard and accounts for the vast majority of M-Lab speed test data today.

**ndt5** (July 2019 – present) is a backward-compatible protocol for legacy NDT clients. It uses TCP Cubic and runs on non-standard ports. ndt7 is preferred, but ndt5 continues to run to support older integrations.

**web100** (February 2009 – November 2019) was the original NDT protocol, relying on the now-deprecated web100 kernel module for TCP statistics. This data remains available in archives and BigQuery for historical analysis.

## What NDT Measures

Each NDT test records:

| Metric | Description |
|--------|-------------|
| Download throughput | Maximum bits per second when receiving data |
| Upload throughput | Maximum bits per second when sending data |
| Minimum RTT | Best-case round-trip time, a proxy for network latency |
| Packet loss rate | Fraction of packets that were retransmitted |
| TCP congestion control | e.g., BBR or Cubic, with associated parameters |
| Client IP + annotations | Country, region, city, ASN/ISP |
| Server site | The M-Lab node that served the test |

## Known Limitations

- A single TCP stream may not saturate very fast links (>500 Mbps) — use [MSAK](/kb/test-msak) for high-bandwidth connections
- Results reflect conditions at the moment of testing; network conditions vary by time of day and day of week
- The measurement is from the client to an M-Lab server, not to an arbitrary endpoint
- NDT is sensitive to congestion on the single stream; multi-stream tests like MSAK produce higher numbers on high-capacity links

## Privacy and Data Collection

When you run NDT, your IP address is collected along with measurement results and published publicly. NDT does not collect any information about other Internet activity. See M-Lab's [Privacy Policy](https://www.measurementlab.net/privacy/) for full details.

## M-Lab-Managed vs. Host-Managed Servers

In 2024, M-Lab introduced a "Host-Managed" deployment model where network operators can host their own M-Lab servers. Data from Host-Managed servers is kept separate so researchers can choose the scope that fits their analysis. The `ndt7_union` view includes both; `ndt7` contains only M-Lab-managed data; `ndt7_dynamic` contains only Host-Managed data.

## Access Tokens

Since 2021, M-Lab has used **access tokens** for NDT7 tests run through the Locate API. These tokens bind measurements to the test session and help prevent abuse. If you're running a custom NDT7 client, you must pass the token returned by the Locate API to the test server. Tokens are logged in the raw data, enabling audit of measurement provenance.

## Accessing NDT Data

### BigQuery (recommended)

NDT data is parsed into BigQuery and available for free. See [Getting Started with M-Lab Data in BigQuery](/kb/getting-started-bigquery) for access setup.

The current recommended view for general use is `measurement-lab.ndt.ndt7_union`. Key views:

| View | Contents |
|------|----------|
| `measurement-lab.ndt.ndt7_union` | All ndt7 data — M-Lab-managed + Host-Managed (recommended) |
| `measurement-lab.ndt.ndt7` | ndt7 from M-Lab-managed servers only |
| `measurement-lab.ndt.ndt7_dynamic` | ndt7 from Host-Managed servers only |
| `measurement-lab.ndt.ndt5` | All ndt5 data |
| `measurement-lab.ndt.unified_downloads` | Quality-filtered downloads across all datatypes |
| `measurement-lab.ndt.unified_uploads` | Quality-filtered uploads across all datatypes |

**Unified views** (`unified_downloads`, `unified_uploads`) apply quality filters that exclude tests shorter than 9 seconds, tests with less than 8 KB transferred, and tests from M-Lab's own monitoring systems. Good for policy and advocacy work where you want only clean, complete tests.

**A simple first query** — average download speed by country over the last 30 days:

<!-- sqltest --> 
```sql
-- Average download speed by country over past 30-days
SELECT
  client.Geo.CountryCode AS country,
  ROUND(AVG(a.MeanThroughputMbps), 2) AS avg_download_mbps,
  COUNT(*) AS test_count
FROM `measurement-lab.ndt.ndt7_union`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND a.MeanThroughputMbps > 0
  AND a.MeanThroughputMbps < 10000
GROUP BY country
ORDER BY avg_download_mbps DESC
```

**Key fields for analysis:**

<!-- sqltest -->
```sql
-- Key fields
SELECT
  a.TestTime,
  a.MeanThroughputMbps,          -- download speed in Mbps
  a.MinRTT,                       -- minimum round-trip time (ms)
  a.LossRate,                     -- packet loss fraction (0.0–1.0)
  client.Geo.CountryCode,
  client.Geo.Region,
  client.Network.ASNumber,
  client.Network.ASName
FROM `measurement-lab.ndt.ndt7_union`
WHERE date = '2024-01-01'
  AND a.MeanThroughputMbps > 0
```

Always filter by `DATE(a.TestTime)` to use BigQuery's partition pruning — without it you'll scan the entire multi-terabyte table.

### Raw Data in Google Cloud Storage

All raw NDT archives are available at:
[gs://archive-measurement-lab/ndt](https://console.cloud.google.com/storage/browser/archive-measurement-lab/ndt)

<!-- FIXME: add link for "Accessing Data in GCS" -->

## How People Use NDT Data

NDT is one of the most-cited Internet measurement datasets in the world. Common uses include:

**Broadband policy and advocacy** — researchers, regulators, and advocacy groups use NDT to characterize ISP performance at national and regional scales. M-Lab's data has been cited in FCC proceedings and government broadband mapping efforts.

**ISP comparison** — comparing median download speeds across ASNs or carriers within a geography over time.

**Detecting performance issues** — correlating NDT results with known network events (peering disputes, outages, congestion at interconnects).

**Longitudinal Internet health studies** — NDT's dataset spans from 2009 to the present, making it one of the longest continuous records of consumer broadband performance available.

**Academic research** — see [M-Lab Publications](https://www.measurementlab.net/publications/) for peer-reviewed papers that use NDT data.

<!-- FIXME: Add link to example ISP comparison query article once created. -->

## Companion Data

Each NDT test automatically triggers collection of additional datasets that can enrich analysis:

- **Traceroute** — a forward path traceroute from the M-Lab server to the client is run for every connection. See [Traceroute](/kb/core-service-traceroute).
- **Reverse Traceroute** — for ~25% of NDT tests, a reverse path measurement is also run. See [Reverse Traceroute](/kb/test-reverse-traceroute).
- **TCP INFO** — kernel-level TCP socket statistics collected continuously during each test. See [TCP INFO](/kb/core-service-tcp-info).
- **Packet Headers** — packet header captures (.pcap) stored per-flow. See [Packet Headers](/kb/core-service-packet-headers).

## Running an NDT Test

Visit [speed.measurementlab.net](https://speed.measurementlab.net) to run a test from your browser. NDT clients are also available for Go, JavaScript, iOS, and Android — see [ndt-server on GitHub](https://github.com/m-lab/ndt-server) for reference clients.

## Citing NDT Data

> The M-Lab NDT Data Set, \<date range used\>. https://measurementlab.net/tests/ndt

## Further Reading

- [Evolution of NDT](https://www.measurementlab.net/blog/evolution-of-ndt/) — blog post on NDT's technical history
- [Introducing ndt7](https://www.measurementlab.net/blog/ndt7-introduction/) — blog post on the current protocol
- [NDT Unified Views Example Queries](https://www.measurementlab.net/tests/ndt/views/examples) — official example queries
- [Getting Started with M-Lab Data in BigQuery](/kb/getting-started-bigquery)

<!-- TODO: Add diagram showing NDT7 test flow (client → Locate API → server selection → measurement → pipeline). Add section on how to run your own NDT7 test from the command line using the reference client. Link to the ndt7-client-go repository. -->
