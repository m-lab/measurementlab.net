---
permalink: research-guide
title: "Analyzing M-Lab Data: A Researcher's Guide"
chapter: Research & Analysis
chapterOrder: 6
order: 1
status: draft
description: Methods, tools, and best practices for using M-Lab's open datasets in academic research, policy analysis, and community broadband advocacy.
tags: [research, data-access]
difficulty: intermediate
---

M-Lab data has been used in peer-reviewed publications, regulatory filings, government broadband reports, and advocacy campaigns. This guide covers how to approach M-Lab data for research purposes.

## Why Researchers Use M-Lab Data

- **Longitudinal depth** — continuous measurements since 2009 enable multi-year trend analysis
- **Global coverage** — tests from nearly every country, with dense coverage in North America, Europe, and parts of Asia
- **Open and reproducible** — methodology is public, data is freely accessible, results are verifiable
- **Population-scale** — billions of tests, enabling statistically robust analysis even for narrow sub-populations
- **Network-level resolution** — ASN and geolocation annotations allow ISP-level and regional analysis

## Data Access Methods

### BigQuery (Recommended for Most Research)

BigQuery provides the most convenient access for analytical queries. See [Getting Started with M-Lab Data in BigQuery](#) for setup instructions.

The `measurement-lab.ndt.ndt7` unified view is the recommended starting point — it applies standard quality filters and provides a stable schema.

### Google Cloud Storage (Raw Data)

For access to raw measurement files (JSON + tcpinfo):

```bash
# List available dates
gsutil ls gs://archive-measurement-lab/ndt/ndt7/2024/01/

# Download a specific day's data
gsutil -m cp -r gs://archive-measurement-lab/ndt/ndt7/2024/01/15/ ./data/
```

Raw files are in newline-delimited JSON format. Each file contains measurements from a single server for a single hour.

### M-Lab Observatory

For exploratory analysis and visualization without writing SQL, the [M-Lab Observatory](https://viz.measurementlab.net) provides pre-built dashboards for ISP and geographic comparisons.

## Common Research Patterns

### ISP Performance Comparison

<!-- sqltest -->
```sql
-- ISP Performance Comparison
SELECT
  client.Network.ASName                          AS isp,
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(50)], 2)
                                                  AS median_download_mbps,
  ROUND(APPROX_QUANTILES(a.MinRTT, 100)[OFFSET(50)], 2)
                                                  AS median_rtt_ms,
  COUNT(*)                                        AS test_count
FROM `measurement-lab.ndt.ndt7_union`
WHERE date BETWEEN '2024-01-01' AND '2024-03-31'
  AND client.Geo.CountryCode = 'US'
  AND a.MeanThroughputMbps > 0
GROUP BY isp
HAVING test_count > 10000
ORDER BY median_download_mbps DESC
```

### Geographic Coverage Analysis

<!-- sqltest -->
```sql
-- Geographic coverage analysis
SELECT
  client.Geo.Region       AS region,
  COUNT(*)                AS test_count,
  ROUND(AVG(a.MeanThroughputMbps), 2) AS avg_mbps
FROM `measurement-lab.ndt.ndt7_union`
WHERE date BETWEEN '2024-01-01' AND '2024-12-31'
  AND client.Geo.CountryCode = 'US'
GROUP BY region
ORDER BY test_count DESC
```

### Temporal Trend Analysis

<!-- sqltest -->
```sql
-- Temporal trend analysis 
SELECT
  DATE_TRUNC(DATE(a.TestTime), MONTH)            AS month,
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(50)], 2)
                                                  AS median_mbps
FROM `measurement-lab.ndt.ndt7_union`
WHERE date BETWEEN '2020-01-01' AND '2024-12-31'
  AND client.Network.ASNumber = 7922            -- Comcast as example
  AND a.MeanThroughputMbps > 0
GROUP BY month
ORDER BY month
```

## Sampling Bias Considerations

M-Lab data is not a random sample of internet users. Key biases to acknowledge in research:

- **Self-selection** — users who run tests are more likely to be experiencing problems or have high interest in their connection
- **Client distribution** — test volume varies by platform (Android, browser, ISP portal integrations) across time periods
- **Coverage gaps** — limited data from regions with low test volumes; filter for minimum test counts before making claims
- **ISP integration effects** — some ISPs embed NDT7 in support tools, creating concentrated test volumes for those providers

Use median rather than mean for throughput statistics; the distribution is right-skewed. Report test counts alongside performance metrics so readers can judge reliability.

## Citation and Attribution

When citing M-Lab data in publications:

**Dataset citation:**
> Measurement Lab. (Year). NDT7 Network Measurement Data [Dataset]. Available at https://measurementlab.net/data. Licensed under CC BY 4.0.

**For methodology, cite:**
> Feamster, N., & Livingood, J. (2020). The Path to Better Internet Performance Measurement. *IEEE Transactions on Network and Service Management*.

M-Lab also maintains a [publications list](https://measurementlab.net/publications) of research using M-Lab data — useful for related work sections.

## Collaborating with M-Lab

M-Lab's **Research Fellowship Program** funds researchers working on internet measurement. Fellows get direct collaboration with M-Lab staff, access to pre-publication data, and support for disseminating results.

M-Lab also hosts annual **Open Measurement Gatherings (OMG)** — workshops for the internet measurement community focused on open data and methodology.

---

<!-- TODO: Add section on using the Python BigQuery client for reproducible research (pandas + google-cloud-bigquery). Add worked example of broadband mapping use case (matching M-Lab data to census geography). Add section on the NTIA/FCC broadband data programs that have used or reference M-Lab data. Link to example Jupyter notebooks in the M-Lab data tools repository. -->
