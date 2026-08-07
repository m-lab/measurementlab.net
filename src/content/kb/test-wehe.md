---
permalink: test-wehe
title: "WeHe — Traffic Differentiation Detection"
chapter: Tests
chapterOrder: 3
order: 4
status: published
description: "WeHe tests whether your ISP is treating traffic from specific apps (like YouTube or Spotify) differently from other traffic — detecting throttling or blocking on a per-application basis."
tags: [Tests, Data Access, BigQuery, Net Neutrality, Throttling]
difficulty: intermediate
---

WeHe (pronounced "we-hee") is a test that detects whether an Internet Service Provider (ISP) is applying application-specific traffic differentiation — throttling, prioritizing, or blocking traffic based on which app generated it. It was developed by researchers at Northeastern University and is hosted by M-Lab.

## How WeHe Works

WeHe's methodology is based on a carefully controlled comparison:

1. **Original replay:** WeHe sends network traffic that was recorded from a real app (e.g., YouTube, Spotify, Amazon Video). From the network's perspective, this traffic looks identical to what the app would generate — same packet sizes, timing, and protocols.

2. **Bit-inverted replay:** WeHe then replays the same traffic with the payload bytes inverted. The traffic has the same volume and timing as the original, but the content is randomized — ISPs cannot classify it as belonging to any specific app.

3. **Statistical comparison:** WeHe runs each replay multiple times and compares the throughput distributions using a Kolmogorov-Smirnov (KS) test. If the original app traffic consistently gets different throughput than the bit-inverted control traffic, and the difference is statistically significant, WeHe concludes that differentiation is occurring.

**Differentiation is reported when all three conditions are true:**
- KS acceptance ratio > 0.95
- KS p-value < 0.05
- Average throughput difference > 10% (`avgXputDiffPct > 0.1`)

Because WeHe runs multiple trials and uses a statistical test, it filters out the natural noise of variable network conditions. A positive result indicates systematic, policy-driven treatment of the app's traffic, not random congestion.

## What WeHe Detects (and What It Doesn't)

WeHe is specifically designed to detect **application-specific** differentiation — cases where an ISP applies different treatment based on which app the traffic appears to come from. It will detect throttling of YouTube-like traffic even if other traffic is unaffected.

WeHe is **not** a general speed test. If an ISP throttles all traffic equally, WeHe will not detect this as differentiation (since both the original and inverted replays would be equally throttled). For overall throughput measurement, use [NDT](/kb/test-ndt).

## Privacy and Data Collection

When you run WeHe, your IP address is collected (truncated to /24 in the published data) along with your device type, carrier name, and network type (cellular/WiFi). See the [WeHe privacy policy](https://wehe.meddle.mobi/consent.html) for full details.

## Accessing WeHe Data

### BigQuery

WeHe data is parsed into BigQuery and available for free query access. See [Setting Up Free BigQuery Access](/kb/getting-started-bigquery).

WeHe data is organized into three tables, all keyed by `userID` + `historyCount` (together they uniquely identify a test):

| Table | Contents |
|-------|----------|
| `measurement-lab.wehe_raw.replayInfo1` | Test metadata: timestamp, carrier, device, location, network type |
| `measurement-lab.wehe_raw.clientXputs1` | Per-replay throughput samples over time (two rows per test: original + inverted) |
| `measurement-lab.wehe_raw.decisions1` | Statistical test results: KS values, throughput difference, differentiation verdict |

### Raw Data in Google Cloud Storage

Raw WeHe data is available at:  
[gs://archive-measurement-lab/wehe](https://console.cloud.google.com/storage/browser/archive-measurement-lab/wehe/)

### Example Queries

**Find tests where differentiation was detected on cellular networks (last 7 days):**

<!-- sqltest -->
```sql
-- Find tests where differentiation was detected on cellular networks
WITH info AS (
  SELECT raw.*
  FROM `measurement-lab.wehe_raw.replayInfo1`
  WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
    AND NOT (raw.userID LIKE '@%')
    AND raw.metadata.updatedCarrierName LIKE '%(cellular)'
),
result AS (
  SELECT raw.*
  FROM `measurement-lab.wehe_raw.decisions1`
  WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
    AND raw.KSAcceptRatio > 0.95
    AND raw.KSPVal < 0.05
    AND raw.avgXputDiffPct > 0.1
)
SELECT *
FROM info
INNER JOIN result
  ON info.userID = result.userID
  AND info.historyCount = CAST(result.historyCount AS INT64)
LIMIT 1000
```

**Count tests and differentiation detections per carrier (last 7 days):**

<!-- sqltest -->
```sql
-- Count tests and differentiation detections per carrier 
WITH info AS (
  SELECT raw.*
  FROM `measurement-lab.wehe_raw.replayInfo1`
  WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
    AND NOT (raw.userID LIKE '@%')
    AND raw.metadata.updatedCarrierName LIKE '%(cellular)'
),
result AS (
  SELECT raw.*
  FROM `measurement-lab.wehe_raw.decisions1`
  WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
)
SELECT
  info.metadata.updatedCarrierName AS network,
  COUNT(*) AS total_tests,
  COUNTIF(result.KSAcceptRatio > 0.95 AND result.KSPVal < 0.05 AND result.avgXputDiffPct > 0.1) AS tests_with_differentiation
FROM info
INNER JOIN result
  ON info.userID = result.userID
  AND info.historyCount = CAST(result.historyCount AS INT64)
GROUP BY network
ORDER BY total_tests DESC
LIMIT 100
```

## How People Use WeHe Data

**Net neutrality research and monitoring** — WeHe is one of the few tools capable of detecting app-specific throttling at scale. Researchers have used it to document and analyze ISP differentiation practices in multiple countries.

**Regulatory evidence** — WeHe data has been used in regulatory proceedings to demonstrate whether specific ISPs were applying traffic differentiation practices.

**ISP accountability** — advocates and journalists have used WeHe data to report on carrier throttling of specific streaming services.

**Comparative carrier analysis** — by filtering `updatedCarrierName`, researchers can compare the differentiation prevalence across carriers and over time.

## Key Research

The canonical paper for WeHe data is: **A large-scale analysis of deployed traffic differentiation practices.** [doi.org/10.1145/3341302.3342092](https://dl.acm.org/doi/abs/10.1145/3341302.3342092)

## Running WeHe

WeHe is available as a mobile app. Visit the [Wehe project website](https://wehe.meddle.mobi/) for download links and more information.

## Citing WeHe Data

> A large-scale analysis of deployed traffic differentiation practices. https://dl.acm.org/doi/abs/10.1145/3341302.3342092

## Further Reading

- [Wehe project website](https://wehe.meddle.mobi/)
- [Wehe source code](https://wehe.meddle.mobi/codeanddata.html)
- [Setting Up Free BigQuery Access](/kb/getting-started-bigquery)
- [NDT — general throughput testing](/kb/test-ndt)
- [DASH — streaming quality testing](/kb/test-neubot-dash)
