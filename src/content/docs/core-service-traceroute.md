---
permalink: core-service-traceroute
title: "Traceroute — M-Lab Core Service"
chapter: Core Services
chapterOrder: 4
order: 3
status: published
description: M-Lab's Traceroute core service automatically runs a network path measurement from every M-Lab server back to the client for every TCP connection, building a continuous record of Internet routing.
tags: [core-services, data-access, bigquery, routing, network-topology]
difficulty: intermediate
---

M-Lab's Traceroute core service runs a network path measurement from the M-Lab server to the client IP address for every TCP connection received by the platform. This happens automatically alongside every NDT, Neubot/DASH, WeHe, and MSAK measurement — users do not need to do anything extra to trigger it.

The result is one of the largest continuous datasets of Internet routing paths available, paired directly with performance measurements from the same connections.

## How M-Lab Traceroute Works

When a client connects to an M-Lab server, the [`traceroute-caller`](https://github.com/m-lab/traceroute-caller) service detects the new TCP flow and launches a traceroute from the server toward the client IP. It uses [`scamper`](https://www.caida.org/catalog/software/scamper/) from CAIDA, which runs a **Multipath Detection Algorithm (MDA)** traceroute. MDA traceroute probes multiple paths through load-balanced routers, revealing the actual set of routes traffic may take — unlike classic traceroute, which follows only one path and may miss load-balanced branches.

To reduce load, `traceroute-caller` caches results for 10 minutes: if two connections arrive from the same IP within that window, the second connection gets the cached result rather than a fresh traceroute.

Each traceroute generates two files saved to GCS:

- **`scamper1`** — the full MDA traceroute output in JSONL format
- **`hopannotation1`** — geolocation and ASN annotations for each hop discovered in the traceroute

Both files are named after the UUID of the TCP flow, linking them to the corresponding measurement.

## Evolution of the Traceroute Format

| Period | Tool | Format | Notes |
|--------|------|--------|-------|
| 2009–2019 | Paris Traceroute | Unstructured `.paris` text files in GCS | Uses per-flow load balancing avoidance |
| 2019–Sept 2021 | Scamper (`traceroute` datatype) | JSONL | Structured output, richer probe types |
| Sept 2021–present | Scamper (`scamper1` datatype) | JSONL + `hopannotation1` | Real-time hop annotation added; historical data retroactively migrated |

Scamper supports ICMP, UDP, and TCP probes plus MDA multipath detection — a significant capability expansion over Paris Traceroute.

For current work, use `scamper1` and `hopannotation1`. The `paris1_legacy` table in BigQuery covers the earlier Paris Traceroute era.

## What a Traceroute Record Contains

Each traceroute record captures:

- The sequence of **hops** (routers) between the M-Lab server and the client
- The **RTT** at each hop
- The **IP address** of each hop (where ICMP responses are returned)
- The **AS path** — which autonomous systems the traffic traverses
- The **branching structure** of multiple paths through load balancers (MDA)
- Probe metadata (type, TTL, timestamp)

Not all hops respond to probes; gaps in the hop sequence are common and don't indicate a problem.

**To read a raw file:**

```bash
gsutil cp gs://archive-measurement-lab/ndt/scamper1/2024/06/01/20240601T003000Z-scamper1-mlab1-jfk06-ndt.tgz .
tar xzf 20240601T003000Z-scamper1-mlab1-jfk06-ndt.tgz
jq . < 2024/06/01/<UUID>.jsonl | more
```

## Accessing Traceroute Data

### BigQuery

Traceroute data is parsed into BigQuery and available for free. See [Getting Started with M-Lab Data in BigQuery](/docs/getting-started-bigquery).

| Table | Contents |
|-------|----------|
| `measurement-lab.ndt_raw.scamper1` | Current scamper-based traceroute data (2019–present) |
| `measurement-lab.ndt_raw.paris1_legacy` | Historical Paris Traceroute data (2009–2019) |

Both use the `id` field (the flow UUID) to join with corresponding measurement tables like `measurement-lab.ndt.ndt7_union`.

**Join NDT result with its forward traceroute:**

<!-- sqltest -->
```sql
-- Join NDT results with forward traceroute
SELECT
  ndt.a.TestTime,
  ndt.a.MeanThroughputMbps,
  ndt.client.Geo.CountryCode,
  tr.raw.Tracelb.Dst AS traceroute_destination
FROM `measurement-lab.ndt.ndt7_union` AS ndt
JOIN `measurement-lab.ndt_raw.scamper1` AS tr
  ON ndt.id = tr.id
WHERE ndt.date = '2024-06-01' and tr.date = '2024-06-01'
```

**Extract individual hops** (traceroute uses a deeply nested schema — UNNEST to work with individual hop data):

<!-- sqltest -->
```sql
-- Extract individual hops
SELECT
  TIMESTAMP_SECONDS(raw.Tracelb.start.Sec) AS start_time,
  raw.Tracelb.src AS server_ip,
  raw.Tracelb.dst AS client_ip,
  hop.addr        AS hop_ip,
  probe.TTL,
  rtt.RTT         AS hop_rtt_ms
FROM `measurement-lab.ndt_raw.scamper1`,
  UNNEST(raw.Tracelb.nodes) AS hop,
  UNNEST(hop.links) AS linkgroup,
  UNNEST(linkgroup.Links) AS link,
  UNNEST(link.Probes) AS probe,
  UNNEST(probe.Replies) AS rtt
WHERE date = '2024-01-15'
LIMIT 100
```

<!-- FIXME: Add example query extracting hop-level ASN path from scamper1 JSONL structure in BigQuery. -->

### Raw Data in Google Cloud Storage

Traceroute archives are organized by the measurement service that triggered the connection:

| Service | scamper1 path (2019–present) |
|---------|-------------------------------|
| NDT | [gs://archive-measurement-lab/ndt/scamper1](https://console.cloud.google.com/storage/browser/archive-measurement-lab/ndt/scamper1) |
| Host | [gs://archive-measurement-lab/host/scamper1](https://console.cloud.google.com/storage/browser/archive-measurement-lab/host/scamper1) |
| Neubot | [gs://archive-measurement-lab/neubot/scamper1](https://console.cloud.google.com/storage/browser/archive-measurement-lab/neubot/scamper1) |
| Paris Traceroute (historical) | [gs://archive-measurement-lab/paris-traceroute](https://console.cloud.google.com/storage/browser/archive-measurement-lab/paris-traceroute) |

## Research Applications

**Internet topology research** — M-Lab's traceroute dataset is among the largest publicly available sources of real-world routing paths. Researchers use it to study how Internet topology changes over time, across geographies, and in response to events like outages or peering changes.

**Path-aware performance analysis** — joining traceroute data with NDT results allows researchers to attribute performance differences to specific network segments or ASes in the path. A test with good RTT but poor throughput where traceroutes show a congested peering link suggests interconnection problems rather than last-mile issues.

**AS path analysis** — common research questions include: which transit providers appear most frequently between residential ISPs and M-Lab servers? How does AS path length correlate with measured latency? Has an ISP's peering arrangement changed over time (detected via AS path shifts)?

**Routing change detection** — comparing traceroute paths across time for the same client IP range can reveal routing changes, policy shifts, or traffic engineering decisions. Large changes in AS paths can also correlate with censorship events or network incidents.

**Geographic routing anomalies** — traceroutes sometimes reveal **traffic tromboning** — where traffic between two nearby points routes through a distant hub. This is especially relevant for countries with limited local internet exchange infrastructure.

**Validation of network models** — Internet topology models and simulations can be validated against the empirical path data in M-Lab's traceroute archive.

**Pairing with Reverse Traceroute** — M-Lab's forward traceroutes are a direct complement to the [Reverse Traceroute](/docs/test-reverse-traceroute) dataset, which provides the path in the opposite direction for a subset of NDT tests.

## Data Volume Considerations

The Scamper dataset is hundreds of terabytes. Strategies for efficient BigQuery analysis:

- Filter by `DATE(a.StartTime)` to use partition pruning
- Sample by UUID rather than loading all records
- Use approximate aggregate functions (`APPROX_QUANTILES`, `APPROX_COUNT_DISTINCT`)
- Pre-aggregate into smaller derived tables for iterative analysis

## Schema Documentation

- [scamper1 schema](https://www.measurementlab.net/tests/traceroute/scamper1)

## Source Code

- [`traceroute-caller`](https://github.com/m-lab/traceroute-caller)
- [`scamper`](https://www.caida.org/catalog/software/scamper/)
- [`paris-traceroute` (historical)](https://github.com/libparistraceroute)

## Citing Traceroute Data

> The M-Lab Traceroute Dataset, \<date range used\>. https://measurementlab.net/tests/traceroute

## Further Reading

- [Reverse Traceroute — the return path](/docs/test-reverse-traceroute)
- [NDT — the speed test paired with each traceroute](/docs/test-ndt)
- [Getting Started with M-Lab Data in BigQuery](/docs/getting-started-bigquery)
- [Long Term Supported Schemas blog post](https://www.measurementlab.net/blog/long-term-schema-support-standard-columns/)

<!-- TODO: Add section on extracting single traceroutes using the M-Lab traceroute extraction tool (blog post: 2022-extracting-single-traceroute). Add worked example of AS path analysis using the CAIDA AS relationship dataset for enrichment. Add section on known limitations (MPLS tunnels hiding intermediate hops, load balancers causing inconsistent paths). -->
