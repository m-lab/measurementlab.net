---
permalink: getting-started-bigquery
title: Getting Started with M-Lab Data in BigQuery
chapter: Accessing Data
chapterOrder: 5
order: 1
status: draft
description: How to get free access to M-Lab's BigQuery datasets, run your first queries, understand the data structure, and work efficiently with large tables.
tags: [data-access, bigquery]
difficulty: beginner
---

M-Lab publishes all measurement data to [Google BigQuery](https://cloud.google.com/bigquery/what-is-bigquery) as a free, open dataset. Access is sponsored by M-Lab — queries against the `measurement-lab` project don't come out of your own GCP quota — but you must join the M-Lab Discuss group first to activate that sponsorship. **Saving query results to your own BigQuery tables, or running queries billed to your own project, will incur charges to you.**

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

### Option B — Google Cloud SDK (command line)

1. [Download and install the Google Cloud SDK](https://cloud.google.com/sdk/) for your operating system.
2. Authenticate with the Gmail account you subscribed to M-Lab Discuss:
   ```
   gcloud auth login
   ```
3. Set your default project:
   ```
   gcloud config set project measurement-lab
   ```

BigQuery's `bq` command-line tool is now available and queries against `measurement-lab` datasets will not be billed to you.

### Service Accounts

If you need to query from an application using a service account (`@developer.gserviceaccount.com`), email [support@measurementlab.net](mailto:support@measurementlab.net) so M-Lab can add it to M-Lab Discuss manually. Ensure the account has the **BigQuery User**, **BigQuery Job User**, and **BigQuery Data Viewer** IAM roles on the `measurement-lab` project.

## Your First Query

For speed test results, you can start with the `measurement-lab.ndt.ndt7_union` table.
For example, for the average download speed by country for the last 30 days:

<!-- sqltest -->
```sql
-- Median download speed by country for a day
SELECT
  client.Geo.CountryCode                     AS country,
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 2)[OFFSET(1)], 2)       AS median_download_mbps,
  COUNT(*)                                   AS test_count
FROM `measurement-lab.ndt.ndt7_union`
WHERE date = '2024-06-01'
  AND a.MeanThroughputMbps > 0
  AND a.MeanThroughputMbps < 10000   -- exclude outliers
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
a.TestTime              — when the test ran (TIMESTAMP)
a.MeanThroughputMbps    — download speed in Mbps
a.MinRTT                — minimum RTT in milliseconds
a.LossRate              — packet loss fraction (0.0–1.0)

client.Geo.CountryCode  — ISO 3166-1 alpha-2 country code
client.Geo.Region       — ISO 3166-2 region/subdivision code
client.Geo.City         — city name (MaxMind, coarse precision)

client.Network.ASNumber — client's Autonomous System Number
client.Network.ASName   — client's ISP/network name

server.Site             — M-Lab site ID (e.g., "lga01")
server.Metro            — metro area (e.g., "lga" for New York)
```

## Query Costs and Partition Pruning

The NDT7 table is large (~0.5 TB/day of new data). **Always** filter by `DATE(a.TestTime)` to use BigQuery's partition pruning:

```sql
-- Efficient: uses partition pruning
WHERE DATE(a.TestTime) = '2024-06-01'

-- Inefficient: scans all partitions (very expensive)
WHERE a.TestTime > '2024-06-01'
```

Use the **preview** feature in the BigQuery UI to inspect data before running queries. The daily query limit per user per day is currently set to 10TiB.

## Exporting Data

For larger analyses, export to Google Cloud Storage rather than downloading from BigQuery:

<!-- sqltest -->
```sql
-- Export example
EXPORT DATA
  OPTIONS (
    uri = 'gs://your-bucket/ndt7-export-*.csv',
    format = 'CSV',
    overwrite = true
  )
AS (
  SELECT a.TestTime, a.MeanThroughputMbps, client.Geo.CountryCode
  FROM `measurement-lab.ndt.ndt7_union`
  WHERE date = '2024-06-01'
);
```

## Further Reading

- [M-Lab BigQuery Schema](https://www.measurementlab.net/data/docs/bq/schema) — full schema documentation
- [NDT (Network Diagnostic Tool)](/docs/test-ndt) — the primary dataset
- [Analyzing M-Lab Data: A Researcher's Guide](/docs/research-guide) — ISP comparison patterns and advanced queries

<!-- TODO: Add section on using the BigQuery API from Python (google-cloud-bigquery library). Add worked example of ISP comparison query. Add section on M-Lab's long-term schema support policy (stable column names since 2020). Link to the M-Lab data documentation at measurementlab.net/data. -->
