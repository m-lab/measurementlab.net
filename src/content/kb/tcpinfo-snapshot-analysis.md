---
permalink: tcpinfo-snapshot-analysis
title: "Analyzing TCP INFO Snapshots: Data Characteristics and Research Patterns"
chapter: Research & Analysis
chapterOrder: 6
order: 2
status: draft
description: "A practical guide to M-Lab's TCP INFO snapshot data in BigQuery — how snapshots are collected and thinned, why most rows are noise, how to filter to real tests, and how to use RTT variance data to study latency-sensitive applications like VoIP."
tags: [Research, Data Access]
difficulty: intermediate
---

M-Lab's TCP INFO sidecar records a time series of kernel TCP socket statistics for every connection on the platform. The BigQuery table is large, heterogeneous, and counterintuitive until you understand how collection and storage work. This article explains the mechanics, the quirks, and the correct patterns for research use.

See [TCP INFO — M-Lab Core Service](/kb/core-service-tcp-info) for a general reference on what fields the table contains.

## How Snapshot Collection Works

The `tcp-info` sidecar runs on every M-Lab server, polling the Linux kernel's `INET_DIAG` netlink interface to read the `tcp_info` struct for every active TCP connection on the host. This is a passive sidecar — it generates no traffic and does not interfere with measurements.

**Collection cadence.** The sidecar targets a 10 ms poll interval, but each poll must complete a full kernel TCP table dump before the next tick. The dump walks the kernel's established-connections hash table, which is sized at boot proportional to available RAM. On small 4-core / 4 GB nodes the dump takes ~0.8 ms, so the 10 ms target is easily met. On large 32-core / 67 GB nodes — including several sites such as `lga04`, `lga05`, `yyz04`, `mnl02`, and others — the dump takes ~13 ms, which causes the loop to slip to an effective ~25 ms interval.

**Thinning.** The ETL parser applies a 10× decimation at ingest: only 1 snapshot in 10 is written to BigQuery. This reduces storage costs and query scan size, but it means BigQuery snapshots are already spaced roughly **100–260 ms apart** depending on the site, not 10 ms.

| hardware class | host dump time | effective poll | BigQuery gap |
|---|---|---|---|
| 4-core / 4 GB | ~0.8 ms | ~10 ms | ~100 ms |
| 32-core / 67 GB (fast) | ~3.4 ms | ~10 ms | ~100 ms |
| 32-core / 67 GB (slow batch, e.g. LGA) | ~13 ms | ~25 ms | ~260 ms |
| 40–56 core | ~11 ms | ~25 ms | ~250+ ms |

For a 10-second NDT download test, a typical site stores about **94 snapshots** (one per ~110 ms). Sites in the slow-hardware batch store about **39 snapshots** per test (~259 ms apart). If you need the full 10 ms resolution it only exists in the raw `.zst` files on GCS — not in BigQuery.

<div class="callout callout--note">
  <span class="callout-icon">ℹ️</span>
  <div class="callout-body">The per-site sparseness is not a malfunction. The fleet-wide ~10× gap is the ETL thinning; the additional ~2.6× at LGA-class sites is their slower INET_DIAG dump driven by hardware characteristics. Both are expected and stable.</div>
</div>

## Why Most Rows Are Noise

The sidecar monitors the host's **entire TCP table**, not just connections from active tests. About **50% of rows** in `measurement-lab.ndt.tcpinfo` are probes, port scanners, health checks, bots, and aborted handshakes hitting the public NDT endpoint. These appear as 1–2 snapshot rows with tiny byte counts (~250 bytes, ~1 segment).

The remaining ~50% of rows are the real NDT connections — but those connections each produce 39–94 snapshots, so they account for essentially all snapshot volume even though they are a minority of distinct connection rows.

**Never query `tcpinfo` in isolation.** Row count does not equal test count, and aggregate statistics over the raw table are dominated by noise. Always join against a test result table.

## The Correct Pattern: Join by UUID

Completed NDT tests each have a UUID (`id`) that appears in both `ndt.ndt7` (or `ndt.ndt5`) and `ndt.tcpinfo` tables respectively. Joining on `id` and `date` keeps only connections tied to a real test result and discards all scanner/handshake noise. Note that the `ndt.ndt7` table only contains tests from M-Lab manages servers, NOT Host-Managed (BYOS servers), tcpinfo tests do not run on Host-Managed servers, thus we join with the `ndt7` table NOT the `ndt7_union` table.

<!-- sqltest -->
```sql
-- Join TCPinfo with NDT7 test results
SELECT
    ndt7.id,
    ndt7.date,
    ndt7.a.MeanThroughputMbps,
    ndt7.a.MinRTT,
    ndt7.client.Geo.CountryCode          AS client_country,
    ndt7.server.Site                     AS server_site,
    tcp.a.FinalSnapshot.TCPInfo.BytesAcked,
    tcp.a.FinalSnapshot.TCPInfo.BytesRetrans,
    tcp.a.FinalSnapshot.TCPInfo.TotalRetrans,
    tcp.a.FinalSnapshot.TCPInfo.MinRTT   AS tcpinfo_min_rtt_us,
    tcp.a.FinalSnapshot.TCPInfo.RTT      AS tcpinfo_rtt_us,
    tcp.a.FinalSnapshot.TCPInfo.RTTVar   AS tcpinfo_rttvar_us
FROM `measurement-lab.ndt.ndt7` AS ndt7
JOIN `measurement-lab.ndt.tcpinfo` AS tcp
  ON  ndt7.id   = tcp.id
  AND ndt7.date = tcp.date
WHERE
    ndt7.date = "2026-06-01"
    AND ndt7.a.MeanThroughputMbps IS NOT NULL
ORDER BY ndt7.date DESC
LIMIT 10
```

<div class="callout callout--warn">
  <span class="callout-icon">⚠️</span>
  <div class="callout-body">Always filter by <code>ndt7.date</code> to use partition pruning. BigQuery is configured to present an error if you do not query on <code>ndt7.date</code>.  Filtering by both <code>ndt7.date</code> and <code>tcp.date</code> in the JOIN is especially important — it prevents a full cross-partition scan on the tcpinfo table.
  <b>Example:</b> <code>Cannot query over table 'mlab-oti.ndt.ndt7' without a filter over column(s) 'date' that can be used for partition elimination</code>
  </div>
</div>

## Snapshot Count Distribution

To understand the quality of TCPinfo data for a set of tests, it helps to look at the distribution of snapshot counts. Connections with only 1–2 snapshots are noise; completed NDT downloads typically have 10–100+ snapshots.

<!-- sqltest -->
```sql
-- Snapshot count distribution for all tcpinfo rows (includes noise)
WITH snapshot_counts AS (
  SELECT
    id,
    (SELECT COUNT(s.Timestamp) FROM UNNEST(raw.Snapshots) AS s) AS num_snapshots
  FROM `measurement-lab.ndt.tcpinfo`
  WHERE
    date = '2026-06-01'
    AND client.Geo.CountryCode = 'US'
)
SELECT
  num_snapshots,
  COUNT(*)                                                    AS num_connections,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)        AS pct
FROM snapshot_counts
GROUP BY num_snapshots
ORDER BY num_snapshots
```

<!-- sqltest -->
```sql
-- Snapshot count distribution for completed NDT7 tests only (noise removed)
WITH snapshot_counts AS (
  SELECT
    tcp.id,
    ARRAY_LENGTH(tcp.raw.Snapshots) AS num_snapshots
  FROM `measurement-lab.ndt.ndt7` AS ndt7
  JOIN `measurement-lab.ndt.tcpinfo` AS tcp
    ON  ndt7.id   = tcp.id
    AND ndt7.date = tcp.date
  WHERE
    ndt7.date = '2026-06-01'
    AND ndt7.a.MeanThroughputMbps IS NOT NULL
    AND tcp.client.Geo.CountryCode = 'US'
)
SELECT
  num_snapshots,
  COUNT(*)                                                    AS num_connections,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)        AS pct
FROM snapshot_counts
GROUP BY num_snapshots
ORDER BY num_snapshots
```

Comparing the two outputs makes the noise problem concrete: the first query will show a large fraction of 1–2 snapshot rows; the second (UUID-joined) query will show a clean distribution concentrated at 40–100 snapshots.

## RTT, RTTVar, and Latency-Sensitive Applications

Each TCPinfo snapshot exposes three RTT fields from the kernel (values are in **microseconds**):

| Field | Description |
|---|---|
| `TCPInfo.MinRTT` | Minimum RTT observed since connection start — a proxy for propagation delay |
| `TCPInfo.RTT` | Kernel's smoothed RTT estimate (SRTT) at snapshot time |
| `TCPInfo.RTTVar` | Kernel's RTT variance estimate — a proxy for jitter |

`MinRTT` is the most reliable latency measure for research: it is less sensitive to transient congestion and queue buildup than SRTT. `RTTVar` captures variation in RTT across the connection and is useful as a jitter proxy for applications like VoIP and real-time video.

### Use Case: VoIP and Voice Quality Estimation

There is active research interest in using M-Lab TCPinfo data to assess whether voice-over-IP on the public internet meets quality thresholds comparable to traditional landline service. Key questions include:

- What fraction of connections have 99th-percentile RTT below 100 ms?
- What is the distribution of RTT variance (jitter) across connections?
- Does quality differ between rural and urban areas, or by ISP?

TCPinfo's `RTTVar` field (kernel RTTVAR, in microseconds) provides a per-connection jitter estimate. Because multiple snapshots are available per connection, you can also compute rolling statistics across the snapshot array.

<div class="callout callout--note">
  <span class="callout-icon">ℹ️</span>
  <div class="callout-body"><strong>Sampling density caveat.</strong> At most sites, BigQuery snapshots are ~110 ms apart; at LGA-class sites, ~260 ms apart. This is sufficient for characterizing latency distributions across many tests, but may be too coarse for sub-100 ms jitter analysis within a single connection. For sub-100 ms resolution, the full snapshot data is available in the raw <code>.zst</code> files on GCS.</div>
</div>

<!-- sqltest -->
```sql
-- RTT and jitter summary for completed NDT7 downloads, by country
SELECT
    ndt7.client.Geo.CountryCode                                AS country,
    ndt7.server.Site                                           AS site,
    COUNT(*)                                                   AS test_count,
    ROUND(AVG(tcp.a.FinalSnapshot.TCPInfo.MinRTT) / 1000, 2) AS avg_min_rtt_ms,
    ROUND(
      APPROX_QUANTILES(tcp.a.FinalSnapshot.TCPInfo.RTT, 100)[OFFSET(95)] / 1000,
      2
    )                                                          AS p95_rtt_ms,
    ROUND(AVG(tcp.a.FinalSnapshot.TCPInfo.RTTVar) / 1000, 2) AS avg_rttvar_ms
FROM `measurement-lab.ndt.ndt7_union` AS ndt7
JOIN `measurement-lab.ndt.tcpinfo` AS tcp
  ON  ndt7.id   = tcp.id
  AND ndt7.date = tcp.date
WHERE
    ndt7.date = '2026-06-01'
    AND ndt7.raw.Download.UUID IS NOT NULL
    AND ndt7.a.MeanThroughputMbps IS NOT NULL
  -- exclude connections where the kernel never measured RTT:
  -- MinRTT holds the uint32 "unset" sentinel and RTT/RTTVar are defaults
    AND tcp.a.FinalSnapshot.TCPInfo.MinRTT < 4294967295
    AND tcp.a.FinalSnapshot.TCPInfo.RTT > 0
GROUP BY country, site
HAVING test_count > 100
ORDER BY avg_min_rtt_ms
LIMIT 50
```

## Site-Level Sparseness and What It Means for Analysis

When comparing results across M-Lab sites, be aware that snapshot density varies. Analyses that depend on within-connection time resolution (e.g., detecting short congestion events, estimating per-connection jitter from multiple snapshots) will have lower power at LGA-class sites than at small-hardware sites.

For most per-test aggregate analyses (mean RTT, final-snapshot statistics, throughput), the difference is immaterial — you still have 39–94 snapshots per test, which is plenty for stable estimates.

If you need to identify which sites are in the slow-hardware batch, you can compute the median within-connection snapshot gap from the `raw.Snapshots` array for a given date.

## Raw Data on GCS

For analyses requiring the full 10 ms resolution, the complete unthinned snapshot archives are available in Google Cloud Storage:

```
gs://archive-measurement-lab/ndt/tcpinfo/YYYY/MM/DD/
```

Each day's directory contains `.tgz` tarballs (one per server, per time window). Inside each tarball are per-connection files in `.jsonl.zst` format — one Zstandard-compressed JSONL file per TCP connection, holding that connection's full snapshot time series. To work with the data, download the tarball, extract it, then decompress individual connection files with `zstd -d` (or read them directly with a library that supports streaming Zstandard).


## Further Reading

- [TCP INFO — M-Lab Core Service](/kb/core-service-tcp-info) — field reference and architecture overview
- [NDT (Network Diagnostic Tool)](/kb/test-ndt) — the primary test whose connections TCPinfo instruments
- [Getting Started with M-Lab Data in BigQuery](/kb/getting-started-bigquery) — access setup and query basics
- [Analyzing M-Lab Data: A Researcher's Guide](/kb/research-guide) — broader M-Lab research patterns
- [Beyond Speed: Understanding Internet Quality Metrics](/kb/internet-quality-beyond-speed) — context on latency and jitter as quality dimensions
