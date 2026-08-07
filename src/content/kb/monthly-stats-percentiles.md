---
permalink: monthly-stats-percentiles
title: Reading Percentiles in Monthly Stats
chapter: Accessing Data
chapterOrder: 5
order: 5
status: published
description: How to interpret percentile columns in M-Lab Monthly Stats data, including the counterintuitive polarity of latency and loss, and what p50 vs p95 tells you.
tags: [Data Access, Internet Quality, Research]
difficulty: intermediate
---

Monthly Stats files store the full **percentile distribution** of each metric across all NDT tests in a given geography and month. Understanding what percentiles mean — and a critical quirk in how latency and loss are stored — is essential for correct analysis.

<div class="callout callout--tip">
<span class="callout-icon">💡</span>
<div class="callout-body"><p><strong>Try it yourself:</strong> <a href="https://mybinder.org/v2/gh/m-lab/mlab-notebooks/HEAD?urlpath=%2Fdoc%2Ftree%2Fmonthlystats%2F01-country-level.ipynb">Open the country-level explorer on Binder</a></p></div>
</div>

## What a Percentile Means Here

A percentile column `metric_pN` answers: *"What was the metric value at or below which N% of tests fell?"*

For example, `download_p50` is the **median download speed** — half of all NDT tests in that geography/month were slower, half were faster.

Available percentiles in Monthly Stats: **1, 5, 10, 25, 50, 75, 90, 95, 99**.

### The distribution tells a richer story than a single number

| Percentile | What it represents |
|---|---|
| `p50` | Typical experience — the median user |
| `p25`–`p75` | The "middle 50%" — the interquartile range |
| `p95` / `p99` | Near-best performance — the top 5% or 1% of tests |
| `p5` / `p1` | Near-worst performance — the bottom 5% or 1% |

A wide gap between `p25` and `p75` signals high variability — some users have very fast connections while others are very slow. A narrow band means more uniform service.

## The Polarity Quirk: Latency and Loss Are Inverted

This is the most important thing to understand about Monthly Stats percentiles.

**For download and upload speed, higher is better.** `download_p95` is the 95th percentile of speed — only 5% of tests were faster. It represents near-best performance.

**For latency and loss, lower is better.** But the percentile numbering still follows the same convention — `latency_p95` is the 95th percentile of latency values, meaning 95% of tests had *lower* latency. It therefore represents **near-worst** latency (only 5% of tests had higher latency).

In summary:

| Metric | `p5` means | `p95` means |
|---|---|---|
| Download / Upload | Near-worst speed | Near-best speed |
| Latency | Near-best latency (lowest values) | Near-worst latency (highest values) |
| Loss | Near-best loss (lowest values) | Near-worst loss (highest values) |

### Why does this matter?

If you naively plot `latency_p95` alongside `download_p95` expecting both to represent "good" performance, you will draw the wrong conclusions. Geographies with high `latency_p95` have *worse* latency, not better.

The Internet Quality Barometer (IQB) handles this by applying the polarity correctly when computing scores: it uses `download_p95` (high = good) but `latency_p5` or `latency_p50` (low = good) as inputs.

### Code example

```python
# Correct: for latency, LOWER values are better, so nsmallest finds best
best_latency = df.nsmallest(10, "latency_p50")[["country_code", "latency_p50"]]

# Correct: for download, HIGHER values are better
best_download = df.nlargest(10, "download_p50")[["country_code", "download_p50"]]

# Wrong: this finds countries with worst latency, not best
worst_approach = df.nlargest(10, "latency_p50")  # ← these are the SLOWEST countries
```

## Which Percentile Should I Use?

The right choice depends on your question:

**Use `p50` (median)** when you want the typical user experience. The median is robust to outliers and represents a realistic "what does this network feel like for most people?" summary.

**Use `p95`** for download/upload when you want near-peak performance — useful for understanding what fast connections look like in an area. The IQB framework uses `p95` download/upload as an optimistic baseline for its quality thresholds.

**Use `p5`** for latency/loss when you want near-best latency — the lowest latency achieved by 95% of users. This is the IQB convention.

**Use `p25`–`p75`** to understand variability and equity. A location where `download_p75 / download_p25` is very large has high inequality between its fast and slow users.

## Sample Count and Reliability

The `sample_count` column records how many NDT tests contributed to each row. Rows with very few tests have noisy percentiles:

```python
# Filter out low-confidence rows before analysis
df_reliable = df[df["sample_count"] >= 100]
```

As a rough guide:
- **< 30 tests**: very unreliable — avoid using percentile estimates
- **30–100 tests**: usable with caution, especially for p50
- **> 100 tests**: generally reliable for p25–p75
- **> 500 tests**: reliable for extreme percentiles (p5, p95)

Finer-grained slices (city, city+ASN) will have far more low-count rows than country-level data, especially for smaller cities or minority ISPs.

## Further Reading

- [M-Lab Monthly Stats Dataset](/kb/monthly-stats-dataset) — dataset overview, access, and structure
- [Beyond Speed: Understanding Internet Quality Metrics](/kb/internet-quality-beyond-speed) — why latency and loss matter as much as speed
- [NDT (Network Diagnostic Tool)](/kb/test-ndt) — how the underlying measurements are made
