---
permalink: monthly-stats-dataset
title: "M-Lab Monthly Stats: Pre-computed Parquet Summaries"
chapter: Accessing Data
chapterOrder: 5
order: 4
status: published
description: What the Monthly Stats dataset is, how it's derived from NDT
  measurements, what the parquet files contain, and how to access them without
  BigQuery.
tags:
  - Data Access
  - Research
difficulty: beginner
---
M-Lab publishes a dataset called **Monthly Stats** — pre-computed monthly summaries of NDT speed test results, available as [Parquet](https://parquet.apache.org/) files. Monthly Stats make it possible to explore M-Lab data without writing BigQuery SQL or processing billions of raw test records.

💡

**Explore the data interactively:** [Open the Monthly Stats introduction notebook on Binder](https://mybinder.org/v2/gh/m-lab/mlab-notebooks/HEAD?urlpath=%2Fdoc%2Ftree%2Fmonthlystats%2F00-introduction-and-catalog.ipynb) — no installation required.

## What Monthly Stats Are

Each Monthly Stats file covers one calendar month of NDT measurements, pre-aggregated at a chosen geographic granularity. Instead of one row per test, each row summarises all tests in that geography/ISP for that month — recording the full **percentile distribution** of download speed, upload speed, latency, and packet loss.

This design means you can answer questions like "what was the median download speed in Germany in October 2024?" with a single parquet read rather than scanning hundreds of millions of raw test rows.

## Geographic Granularities (Slices)

Monthly Stats are published at six geographic granularities, called **slices**:


| Slice name | Rows grouped by |
| ----------------------------- | --------------------------------- |
| `by_country` | Country only |
| `by_country_asn` | Country + ASN (internet provider) |
| `by_country_subdivision1` | Country + state/province |
| `by_country_subdivision1_asn` | Country + state/province + ASN |
| `by_country_city` | Country + city |
| `by_country_city_asn` | Country + city + ASN |


Each granularity is split into download and upload files, giving twelve file types per month. The download files contain `download_p{N}`, `latency_p{N}`, and `loss_p{N}` columns; the upload files contain only `upload_p{N}` columns.

ℹ️

**ASN** stands for Autonomous System Number — a number assigned to each network operator (ISP, university, cloud provider, etc.). ASN-level slices let you compare performance across providers within the same country or region. See [M-Lab Network Annotations](../mlab-annotations-explained) for details.

## Data Schema

Every download parquet file contains:


| Column | Description |
| --------------- | ------------------------------------------------ |
| `country_code` | ISO 3166-1 alpha-2 code (e.g. `US`, `DE`) |
| `asn` | Autonomous System Number *(ASN slices only)* |
| `as_name` | AS (provider) name *(ASN slices only)* |
| `subdivision1_iso_code` | ISO 3166-2 subdivision code, without the country prefix *(subdivision and city slices)* |
| `subdivision1_name` | State/province name *(subdivision and city slices)* |
| `city` | City name *(city slices only)* |
| `download_p{N}` | Nth percentile download speed in Mbit/s |
| `latency_p{N}` | Minimum RTT in milliseconds, with inverted labels: `latency_p{N}` is the (100−N)th percentile, so higher N means lower (better) latency |
| `loss_p{N}` | Packet loss rate (0–1), with inverted labels like `latency_p{N}` |
| `sample_count` | Number of NDT tests that contributed to this row |


Upload files contain `upload_p{N}` columns instead of the download, latency, and loss columns. Available percentiles: 1, 5, 10, 25, 50, 75, 90, 95, 99.

For guidance on interpreting percentiles — including the counterintuitive polarity of latency and loss — see [Reading Percentiles in Monthly Stats](/kb/monthly-stats-percentiles).

## How Monthly Stats Are Derived

Monthly Stats are computed from M-Lab's unified NDT views (`unified_downloads` and `unified_uploads`), which combine all NDT versions since 2009, using a BigQuery pipeline. For each (geography, month) combination:

1. Raw NDT tests are filtered by standard quality criteria (the checks applied by the unified views, for example excluding tests that are too short). No minimum number of tests per row is applied
2. Test results are binned by geographic and network annotations
3. Percentiles are computed across all tests in each bin
4. Results are written to Parquet and uploaded to Google Cloud Storage

The pipeline source and configuration live in the [m-lab/iqb](https://github.com/m-lab/iqb) repository, which also contains the [Internet Quality Barometer](/iqb) score library that uses Monthly Stats as its primary input.

## How to Access the Data

### Without any account (direct download)

A public manifest lists every available file:

```
https://www.measurementlab.net/data/stats/manifest.json
```

Each entry maps a cache path (`cache/v1/{start}/{end}/{slice}/data.parquet`) to a public GCS download URL. You can download individual files with any HTTP client.

### In Python with pandas

```python
import pandas as pd
import requests

# Fetch the manifest
manifest = requests.get("https://www.measurementlab.net/data/stats/manifest.json").json()

# Find the URL for a specific file
path = "cache/v1/20241001T000000Z/20241101T000000Z/downloads_by_country/data.parquet"
url = manifest["files"][path]["url"]

# Load into a DataFrame
df = pd.read_parquet(url)
print(df[["country_code", "download_p50", "latency_p50"]].head())
```

The community notebooks (see links below) handle manifest parsing, caching, and interactive exploration automatically.

### Date coverage

Monthly Stats are available from **January 2009** to within ~2 months of the present. Coverage is denser from 2015 onward as NDT test volumes grew substantially.

## Community Notebooks

In [GitHub (m-lab/mlab-notebooks)](https://github.com/m-lab/mlab-notebooks/tree/main/monthlystats) we provide a list of interactive notebooks to explore Monthly Stats at each geographic granularity. You can find interactive versions of the notebooks: click **launch binder** to run them without installing anything.

## Limitations and Caveats

**Sample count matters.** Rows with fewer than ~100 tests produce unreliable percentile estimates. The `sample_count` column lets you filter out low-confidence rows. The notebooks default to a 500–2000 test minimum depending on the granularity.

**City-level data has significant geolocation uncertainty.** See [M-Lab Network Annotations](/kb/mlab-annotations-explained) for a full discussion of what city-level geolocation means in practice.

**Monthly Stats reflect NDT test populations, not all internet users.** NDT tests are opt-in and typically run by users who suspect a problem or are doing research. This creates a non-representative sample. See [Understanding Speed Test Results](/kb/understanding-speed-test-results) for context.

**Data is usually 4–8 weeks behind the current date** due to pipeline processing time.