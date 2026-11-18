---
permalink: getting-started-bigquery
title: Getting Started with M-Lab Data in BigQuery
chapter: Accessing Data
chapterOrder: 5
order: 1
status: published
description: How to get free access to M-Lab's BigQuery datasets, run your first queries, understand the data structure, and work efficiently with large tables.
tags: [Data Access, BigQuery]
difficulty: beginner
---

M-Lab publishes all measurement data to [Google BigQuery](https://cloud.google.com/bigquery/docs/introduction) as a free, open dataset. Access is sponsored by M-Lab: queries you run in the `measurement-lab` project are paid for by M-Lab, but you must join the M-Lab Discuss group first to activate that sponsorship. **Running queries in your own project, even against M-Lab tables, or saving results to your own BigQuery tables will incur charges to you.**

Questions? Email [support@measurementlab.net](mailto:support@measurementlab.net).

## Step 1: Join the M-Lab Discuss Group

Subscribe your Google account to the [M-Lab Discuss group](https://groups.google.com/a/measurementlab.net/g/discuss). Membership grants your account permission to query the `measurement-lab` project at no charge.

The list also carries announcements about data format changes, platform updates, and M-Lab events. All participants are asked to follow the [community guidelines](https://www.measurementlab.net/community-guidelines/).

## Step 2: Connect to BigQuery

### Option A — Google Cloud Console (browser-based)

1. Visit the [BigQuery page for the measurement-lab project](https://console.cloud.google.com/bigquery?project=measurement-lab).
2. If prompted, accept the BigQuery Terms of Service.
3. The `measurement-lab` project will appear in the left-hand **Explorer** panel. Click it to browse datasets, tables, and views.

You can now run queries at no charge. You do **not** need to activate Google's free credit offer.

### Option B — Google Cloud CLI (command line)

1. [Download and install the Google Cloud CLI](https://cloud.google.com/sdk/docs/install) for your operating system.
2. Authenticate with the Google account you subscribed to M-Lab Discuss:
   ```bash
   gcloud auth login
   ```
3. Set your default project:
   ```bash
   gcloud config set project measurement-lab
   ```

BigQuery's `bq` command-line tool is now available and queries against `measurement-lab` datasets will not be billed to you.

### Service Accounts

If you need to query from an application using a service account (`@developer.gserviceaccount.com`), email [support@measurementlab.net](mailto:support@measurementlab.net) so M-Lab can add it to M-Lab Discuss manually.

## Your First Query

For speed test results, you can start with the `measurement-lab.ndt.ndt7_union` table.
For example, for the median download speed by country for a day:

<!-- sqltest -->
```sql
-- Median download speed by country for a day
SELECT
  client.Geo.CountryCode                                          AS country,
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 2)[OFFSET(1)], 2)  AS median_download_mbps,
  COUNT(*)                                                        AS test_count
FROM `measurement-lab.ndt.ndt7_union`
WHERE date = '2024-06-01'
  AND a.MeanThroughputMbps > 0
  AND a.MeanThroughputMbps < 10000   -- exclude outliers
  AND raw.Download.UUID IS NOT NULL  -- download tests only (the table also has uploads)
GROUP BY country
ORDER BY median_download_mbps DESC
LIMIT 20
```

### Understanding the Schema

NDT7 results have a nested structure. The key top-level fields are:

- **`a`** — measurement results (throughput, latency, loss)
- **`client`** — annotated client information (Geo, Network/ASN)
- **`server`** — M-Lab server that handled the test
- **`raw`** — raw TCP statistics from the kernel

### Commonly Used Fields

```
a.TestTime                     — when the test ran (TIMESTAMP)
a.MeanThroughputMbps           — throughput in Mbps, for the test's direction (download or upload)
a.MinRTT                       — minimum RTT in milliseconds
a.LossRate                     — packet loss fraction (0.0–1.0)

client.Geo.CountryCode         — ISO 3166-1 alpha-2 country code
client.Geo.Subdivision1ISOCode — region code
client.Geo.City                — city name (MaxMind, coarse precision)

client.Network.ASNumber        — client's Autonomous System Number
client.Network.ASName          — client's ISP/network name

server.Site                    — M-Lab site ID (e.g., "lga01")
```

## Query Costs and Partition Pruning

The NDT7 table is large (more than 100GB/day of new data). **Always** filter by `date` to use BigQuery's partition pruning:

```sql
-- Efficient: uses partition pruning
WHERE date = '2024-06-01'

-- Inefficient: scans all partitions (very expensive)
WHERE date > 'yyyy-mm-dd'
```

Most of a query's cost comes from how many days it covers. The example query above reads about 35 GB for one day in 2026, and `SELECT *` reads more than 100 GB per day. Before running a query, check how much data it will read: the *BigQuery console shows an estimate at the editor*, and `bq query --dry_run` prints one without running anything. `LIMIT` doesn't reduce the data read. Each user can query up to 10 TiB per day.

## Further Reading

- [M-Lab BigQuery Schema](https://www.measurementlab.net/data/docs/bq/schema) — full schema documentation

