---
permalink: monthly-stats-python
title: Exploring Monthly Stats with Python
chapter: Accessing Data
chapterOrder: 5
order: 6
status: published
description: A practical guide to loading, filtering, and visualising M-Lab
  Monthly Stats parquet files in Python using pandas, without needing BigQuery
  or a Google Cloud account.
tags:
  - Data Access
  - Research
difficulty: intermediate
---
Monthly Stats parquet files are designed to be easy to work with in Python. You need only `pandas`, `pyarrow`, and `requests` — all freely available via pip or uv. No Google Cloud account required.

The fastest way to start is to run the [community notebooks](https://github.com/m-lab/mlab-notebooks/tree/main/monthlystats) directly in your browser.

## Running the Notebooks Locally

To run the notebooks on your own machine:

```bash
# Clone the repository
git clone https://github.com/m-lab/mlab-notebooks.git
cd mlab-notebooks/monthlystats

# With uv (recommended): installs the dependencies and starts Jupyter
uv run jupyter notebook

# Or with pip
pip install -r requirements.txt jupyter
jupyter notebook
```

The notebooks read the manifest, find the URL of the file they need, and open the parquet file directly from M-Lab's public storage. Nothing is cached locally.

## Loading a Single File Manually

If you want to work outside the notebooks, here is the minimal pattern:

```python
import pandas as pd
import requests
from io import BytesIO

# Step 1: fetch the manifest to find download URLs
manifest = requests.get(
    "https://www.measurementlab.net/data/stats/manifest.json",
    timeout=30,
).json()

# Step 2: pick a file — format is cache/v1/{start}/{end}/{slice}/data.parquet
# Timestamps use YYYYMMDDTHHMMSSZ format
path = "cache/v1/20241001T000000Z/20241101T000000Z/downloads_by_country/data.parquet"
url = manifest["files"][path]["url"]

# Step 3: download and read
response = requests.get(url, timeout=60)
df = pd.read_parquet(BytesIO(response.content))

print(df.shape)          # (N_countries, N_columns)
print(df.columns.tolist())
```

## Common Operations

### Get the median download speed for every country

```python
# Sort by median download — higher is better
top = df.nlargest(20, "download_p50")[["country_code", "download_p50", "sample_count"]]
print(top)
```

### Filter out low-sample rows

Rows with few tests have unreliable percentiles. Always filter before ranking:

```python
reliable = df[df["sample_count"] >= 100].copy()
```

### Latency: remember lower is better

```python
# Best latency = SMALLEST values — use nsmallest, not nlargest
best_latency = reliable.nsmallest(10, "latency_p50")[["country_code", "latency_p50"]]
```

See [Reading Percentiles in Monthly Stats](/kb/monthly-stats-percentiles) for a full explanation of the polarity difference between speed and latency/loss columns.

### Load multiple months and compare

```python
months = ["2024-01-01", "2024-04-01", "2024-07-01", "2024-10-01"]

frames = []
for start in months:
    # Convert to timestamp format used in manifest paths
    ts = pd.to_datetime(start).strftime("%Y%m%dT000000Z")
    ts_end = (pd.to_datetime(start) + pd.DateOffset(months=1)).strftime("%Y%m%dT000000Z")
    path = f"cache/v1/{ts}/{ts_end}/downloads_by_country/data.parquet"
    url = manifest["files"][path]["url"]
    month_df = pd.read_parquet(BytesIO(requests.get(url, timeout=60).content))
    month_df["month"] = start
    frames.append(month_df)

all_months = pd.concat(frames, ignore_index=True)

# Median US download over time
us = all_months[all_months["country_code"] == "US"][["month", "download_p50"]]
print(us)
```

### Filter to an ASN (ISP) within a country

ASN slices group by both country code and Autonomous System Number:

```python
# Load the country+ASN slice
path = "cache/v1/20241001T000000Z/20241101T000000Z/downloads_by_country_asn/data.parquet"
url = manifest["files"][path]["url"]
asn_df = pd.read_parquet(BytesIO(requests.get(url, timeout=60).content))

# Filter to US providers with at least 500 tests
us_isps = asn_df[
    (asn_df["country_code"] == "US") &
    (asn_df["sample_count"] >= 500)
].nlargest(15, "download_p50")[["asn", "download_p50", "sample_count"]]

print(us_isps)
```

## Available Slices


| Slice name | Key columns |
| --------------------------------------- | ------------------------------------- |
| `downloads_by_country` | `country_code` |
| `uploads_by_country` | `country_code` |
| `downloads_by_country_asn` | `country_code`, `asn` |
| `uploads_by_country_asn` | `country_code`, `asn` |
| `downloads_by_country_subdivision1` | `country_code`, `subdivision1_iso_code` |
| `uploads_by_country_subdivision1` | `country_code`, `subdivision1_iso_code` |
| `downloads_by_country_subdivision1_asn` | `country_code`, `subdivision1_iso_code`, `asn` |
| `uploads_by_country_subdivision1_asn` | `country_code`, `subdivision1_iso_code`, `asn` |
| `downloads_by_country_city` | `country_code`, `subdivision1_iso_code`, `city` |
| `uploads_by_country_city` | `country_code`, `subdivision1_iso_code`, `city` |
| `downloads_by_country_city_asn` | `country_code`, `subdivision1_iso_code`, `city`, `asn` |
| `uploads_by_country_city_asn` | `country_code`, `subdivision1_iso_code`, `city`, `asn` |


Download files contain `download_p{N}`, `latency_p{N}`, `loss_p{N}`. Upload files contain only `upload_p{N}`.

## Computing IQB Scores

If you want to compute [Internet Quality Barometer](/iqb) scores from Monthly Stats, use the `mlab-iqb` library:

```python
# Install: pip install 'git+https://github.com/m-lab/iqb.git#subdirectory=library'
from iqb import IQBCalculator

calculator = IQBCalculator()

# Data dict expected by the calculator (`row` and `up_row` are the same
# country in the download and upload files of the same month)
data = {
    "m-lab": {
        "download_throughput_mbps": float(row["download_p95"]),
        "upload_throughput_mbps":   float(up_row["upload_p95"]),
        "latency_ms":               float(row["latency_p95"]),  # note: p95 = near-best latency (labels are flipped)
        "packet_loss":              float(row["loss_p95"]),     # note: p95 = near-best loss (labels are flipped)
    }
}

score = calculator.calculate_iqb_score(data=data)
print(f"IQB score: {score:.3f}")
```

See the [IQB library README](https://github.com/m-lab/iqb/blob/main/library/README.md) for installation and a complete example.

## Further Reading

- [M-Lab Monthly Stats Dataset](/kb/monthly-stats-dataset) — dataset overview and structure
- [Reading Percentiles in Monthly Stats](/kb/monthly-stats-percentiles) — percentile interpretation and polarity
- [M-Lab Network Annotations](/kb/mlab-annotations-explained) — understanding ASN and geolocation fields

